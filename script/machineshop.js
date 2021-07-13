/* global Scalers, Scaler, Util, Game, GearGenerator, Obtainium, TabManager */
let MachineShop = {};

{
	Scalers.MarkupCost = new Scaler("MarkupCost", 1000, 10);
	Scalers.RotCost = new Scaler("RotCost", 1000, 10);
	Scalers.LubeCost = new Scaler("LubeCost", 100, 1.5);
	Scalers.LubePower = new Scaler("LubePower", 1, 1.1);
	Scalers.CarveCost = new Scaler("CarveCost", 1000, 5);

	let inv = document.getElementById("machine-inv");
	let content = document.getElementById("machine-content");
	let upgrades = document.getElementById("machine-upgrades");

	let globRotDisplay = document.getElementById("machine-global-rots");
	let globMarkupDisplay = document.getElementById("machine-global-Game.markup");
	let globMarkupButton = document.getElementById("machine-global-Game.markup-button");

	let rotDisplay = document.getElementById("machine-rots");
	let lubeDisplay = document.getElementById("machine-lubricate");
	let lubeButton = document.getElementById("machine-lubricate-button");
	let carveDisplay = document.getElementById("machine-carve");
	let carveButton = document.getElementById("machine-carve-button");

	let refreshGears;

	/**
	 * @param num {number}
	 * @return {string}
	 */
	let trim = function(num) {
		return Util.display(num, true);
	};

	/**
	 * @return {number}
	 */
	let markupVal = function() {
		return 1 + Game.markup * 0.25;
	};

	/**
	 * @return {number}
	 */
	let gearCap = function() {
		return Game.activeGearbox.baseMax + Game.activeGearbox.upgrades.carve;
	};

	/**
	 * @return {number}
	 */
	let now = function() {
		return Math.floor(Date.now()/1000);
	};

	let recalculateGlobal = function() {
		let rots = 0;
		// replace this with a loop iterating over all gearboxes at some point
		rots = Game.activeGearbox.rots;

		globRotDisplay.textContent = `You are producing a total of ${trim(rots)} rot/s, worth $${trim(rots*markupVal())} total`;
		globMarkupDisplay.textContent = `You have marked up the value of rots ${Game.markup} times, so they are worth $${markupVal()} each`;
		globMarkupButton.textContent = `Markup ($${trim(Scalers.RotCost.getAtLevel(Game.markup))}, +0.25 $/rot)`;
	};

	let recalculate = function() {
		let rots = 0;
		let nw = now();
		let nextUpdate = Infinity;
		for (let gear of Game.activeGearbox.gears) {
			gear.lifetime = Math.max(gear.placed + gear.lifetime - nw, 0);
			gear.placed = nw;
			if (gear.lifetime > 0) {
				rots += gear.rots;
				if (gear.lifetime + nw < nextUpdate) {
					nextUpdate = gear.lifetime + nw;
				}
			}
			else {
				if (gear.effect[0] === "persistent") {
					rots += gear.rots * (gear.effect[1]/10) * (Obtainium.upgrades.persistence ? 1.5 : 1);
				}
			}
		}

		let lubeMul = Scalers.LubePower.getAtLevel(Game.activeGearbox.upgrades.lubricate);
		rots *= lubeMul;

		Game.activeGearbox.rots = rots;
		Game.activeGearbox.nextUpdate = nextUpdate;
		rotDisplay.textContent = `This gearbox is producing ${trim(rots)} rot/s, worth $${trim(rots*markupVal())} total`;
		lubeDisplay.textContent = `This gearbox has been lubricated ${Game.activeGearbox.upgrades.lubricate} times, so its production is multiplied by ${trim(lubeMul)}`;
		lubeButton.textContent = `Lubricate ($${trim(Scalers.LubeCost.getAtLevel(Game.activeGearbox.upgrades.lubricate))}, 1.1x)`;
		carveDisplay.textContent = `This gearbox has been carved ${Game.activeGearbox.upgrades.carve} times, so it can hold ${Game.activeGearbox.baseMax+Game.activeGearbox.upgrades.carve} gears`;
		carveButton.textContent = `Carve ($${trim(Scalers.CarveCost.getAtLevel(Game.activeGearbox.upgrades.carve))}, +1 gear)`;
		
		carveButton.disabled = Game.activeGearbox.baseMax * 2 === gearCap();

		recalculateGlobal();
	};

	/**
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
	 * @param id
	 * @return {(function(): void)}
	 */
	let unequipGearGenerator = function(id) {
		return function() {
			let gear = Game.activeGearbox.gears.splice(id, 1)[0];
			gear.lifetime = Math.max(gear.placed + gear.lifetime - now(), 0);
			delete gear.placed;
			Game.gearInventory.push(gear);
			refreshGears();
			recalculate();
		};
	};

	let wipeGears = function() {
		while (inv.hasChildNodes()) {
			inv.removeChild(inv.childNodes[0]);
		}
		while (content.hasChildNodes()) {
			content.removeChild(content.childNodes[0]);
		}
	};

	refreshGears = function() {
		wipeGears();
		let id = 1;
		let addEquip = Game.activeGearbox.gears.length < gearCap();
		let tip = function(gear) {
			return `${gear.rots} rots<br>
			${gear.lifetime === 0 ? "Broken" : Util.lifetime(gear.lifetime)}<br>
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
				render = Util.tip(render, tip(Game.activeGearbox.gears[i]));
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

	MachineShop.recalculateGears = function() {
		recalculate();
		if (TabManager.activeTab[0] === 2) {
			refreshGears();
		}
	};
}