/** @namespace MachineShop */
let MachineShop = {};

{
	Scalers.MarkupCost = new Scaler("MarkupCost", 1000, 10);
	Scalers.LubeCost = new Scaler("LubeCost", 100, 1.5);
	Scalers.LubePower = new Scaler("LubePower", 1, 1.1);
	Scalers.CarveCost = new Scaler("CarveCost", 1000, 5);

	let inv = document.getElementById("machine-inv");
	let content = document.getElementById("machine-content");
	let upgrades = document.getElementById("machine-upgrades");

	let globRotDisplay = document.getElementById("machine-global-rots");
	let globRotWorthDisplay = document.getElementById("machine-global-rots-worth");
	let globMarkupDisplay = document.getElementById("machine-global-markup");
	let globMarkupWorthDisplay = document.getElementById("machine-global-markup-worth");
	let globMarkupButton = document.getElementById("machine-global-markup-button");
	let globMarkupCostDisplay = document.getElementById("machine-markup-cost");

	let rotsDisplay = document.getElementById("machine-rots");
	let rotsWorthDisplay = document.getElementById("machine-rots-worth");
	let lubeDisplay = document.getElementById("machine-lubricate");
	let lubeFactorDisplay = document.getElementById("machine-lubricate-factor");
	let lubeCostDisplay = document.getElementById("machine-lubricate-cost");
	let lubeButton = document.getElementById("machine-lubricate-button");
	let carvesDisplay = document.getElementById("machine-carves");
	let capacityDisplay = document.getElementById("machine-capacity");
	let carveCostDisplay = document.getElementById("machine-carve-cost");
	let carveButton = document.getElementById("machine-carve-button");

	/** @type {function(): void} */
	let refreshGears;

	/**
	 * Convenience method for pretty-printing numbers.
	 *
	 * @private
	 * @param num {number}
	 * @return {string}
	 */
	let trim = function(num) {
		return Util.display(num, false);
	};

	/**
	 * Determines the current value of rots.
	 * Its linear nature makes using a Scaler inadvisable.
	 *
	 * @private
	 * @return {number}
	 */
	let rotVal = function() {
		return 1 + Game.markup * 0.25;
	};

	/**
	 * Determines the gear cap of the current gearbox.
	 *
	 * @private
	 * @return {number}
	 */
	let gearCap = function() {
		return Game.activeGearbox.baseMax + Game.activeGearbox.upgrades.carve;
	};

	/**
	 * Convenience method to get the current second.
	 *
	 * @private
	 * @return {number}
	 */
	let now = function() {
		return Math.floor(Date.now()/1000);
	};

	/**
	 * Recalculates global production, updating the displays.
	 *
	 * @private
	 */
	let recalculateGlobal = function() {
		let rots = 0;
		// replace this with a loop iterating over all gearboxes at some point
		rots = Game.activeGearbox.rots;

		globRotDisplay.textContent = trim(rots);
		globRotWorthDisplay.textContent = "$" + trim(rots*rotVal());
		globMarkupDisplay.textContent = Game.markup;
		globMarkupWorthDisplay.textContent = "$" + rotVal();
		globMarkupCostDisplay.textContent = "$" + trim(Scalers.MarkupCost.getAtLevel(Game.markup));
	};

	/**
	 * Recalculates the current gearbox, updating displays.
	 *
	 * @param {boolean} damaging=false - if gears get damaged during this calculation
	 * @return {number} - rots produced this tick
	 * @private
	 */
	let recalculate = function(damaging=false) {
		let rots = 0;
		for (let gear of Game.activeGearbox.gears) {
			if (damaging && gear.life > 0) {
				gear.life -= 1;
			}
			if (gear.life > 0) {
				rots += gear.getRots();
			}
			else {
				if (gear.effect[0] === "persistent") {
					rots += gear.getRots() * (gear.effect[1]/10) * (Obtainium.upgrades.persistence ? 1.5 : 1);
				}
			}
		}

		let lubeFactor = Scalers.LubePower.getAtLevel(Game.activeGearbox.upgrades.lubricate);
		rots *= lubeFactor;

		Game.activeGearbox.rots = rots;

		rotsDisplay.textContent = trim(rots);
		rotsWorthDisplay.textContent = "$" + trim(rots*rotVal());
		lubeDisplay.textContent = Game.activeGearbox.upgrades.lubricate;
		lubeFactorDisplay.textContent = trim(lubeFactor);
		lubeCostDisplay.textContent = "$" + trim(Scalers.LubeCost.getAtLevel(Game.activeGearbox.upgrades.lubricate));
		carvesDisplay.textContent = Game.activeGearbox.upgrades.carve;
		capacityDisplay.textContent = Game.activeGearbox.baseMax+Game.activeGearbox.upgrades.carve;
		carveCostDisplay.textContent = "$" + trim(Scalers.CarveCost.getAtLevel(Game.activeGearbox.upgrades.carve));
		carveButton.disabled = Game.activeGearbox.baseMax * 2 === gearCap();

		recalculateGlobal();
		return rots;
	};

	/**
	 * Listener applied to gears to equip them.
	 *
	 * @private
	 * @param event {MouseEvent}
	 */
	let equipGear = function(event) {
		let idx = -1;
		for (let i = 0; i < inv.childElementCount; i++) {
			if (inv.children[i].contains(event.currentTarget)) {
				idx = i;
				break;
			}
		}
		let gear = Game.gearInventory.splice(idx, 1)[0];
		gear.placed = now();
		Game.activeGearbox.gears.push(gear);
		refreshGears();
		recalculate();
	};

	/**
	 * Generates listeners to apply to gears to unequip them.
	 *
	 * @private
	 * @param id - id to generate removal for
	 * @return {(function(): void)}
	 */
	let unequipGearGenerator = function(id) {
		return function() {
			let gear = Game.activeGearbox.gears.splice(id, 1)[0];
			delete gear.placed;
			Game.gearInventory.push(gear);
			refreshGears();
			recalculate();
		};
	};

	/**
	 * Clears out all the gears in the inventory and gear box.
	 *
	 * @private
	 */
	let wipeGears = function() {
		while (inv.hasChildNodes()) {
			inv.removeChild(inv.childNodes[0]);
		}
		while (content.hasChildNodes()) {
			content.removeChild(content.childNodes[0]);
		}
	};

	/**
	 * Re-renders all gears in the inventory and gear box.
	 *
	 * @private
	 */
	refreshGears = function() {
		wipeGears();
		let id = 1;
		let addEquip = Game.activeGearbox.gears.length < gearCap();
		let tip = function(gear) {
			return `${gear.getRots()} rots<br>
			${gear.life > 0 ? Util.toTime(gear.life) : "Broken"}<br>
			${gear.effect[0]} ${Util.roman(gear.effect[1])}`;
		};
		for (let gear of Game.gearInventory) {
			let render = GearGenerator.render(gear, id);
			if (addEquip) {
				render.addEventListener("click", equipGear);
			}
			render = Util.tip(render, tip(gear));
			inv.appendChild(render);
			id++;
		}
		for (let i = 0; i < gearCap(); i++) {
			let render;
			if (Game.activeGearbox.gears[i] != null) {
				render = GearGenerator.render(Game.activeGearbox.gears[i], id);
				render.addEventListener("click", unequipGearGenerator(i));
				render = Util.liveTip(render, Game.activeGearbox.gears[i], tip);
				id++;
			} else {
				render = document.createElement("img");
				render.setAttribute("src", "fakegear.svg");
			}
			content.appendChild(render);
		}
	};

	// button code
	globMarkupButton.addEventListener("click", function() {
		let cost = Scalers.MarkupCost.getAtLevel(Game.markup);
		if (Game.trySpendMoney(cost)) {
			Game.markup++;
			recalculate();
		}
	});

	lubeButton.addEventListener("click", function() {
		let cost = Scalers.LubeCost.getAtLevel(Game.activeGearbox.upgrades.lubricate);
		if (Game.trySpendMoney(cost)) {
			Game.activeGearbox.upgrades.lubricate++;
			recalculate();
		}
	});

	carveButton.addEventListener("click", function() {
		let cost = Scalers.CarveCost.getAtLevel(Game.activeGearbox.upgrades.carve);
		let gearCount = gearCap();
		let limit = Game.activeGearbox.baseMax * 2;
		if (gearCount < limit && Game.trySpendMoney(cost))
		{
			Game.activeGearbox.upgrades.carve++;
			recalculate();
			refreshGears();
		}
	});

	TabManager.addTabOpenedListener(refreshGears, 0, 2);
	TabManager.addTabClosedListener(wipeGears, 0, 2);

	/**
	 * Recalculates current gear values, and if in the Machine Shop, re-renders it.
	 *
	 * @param {boolean} damaging=false - if gears get damaged during this calculation
	 * @return {number} rots produced this tick
	 * @memberOf MachineShop
	 */
	MachineShop.tickGears = function(damaging=false) {
		return recalculate(damaging);
	};
}