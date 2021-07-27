/** @namespace CraftingRoom */
let CraftingRoom = {};

{
	Scalers.PolishCost = new Scaler("PolishCost", 100, 5);
	Scalers.PolishPower = new Scaler("PolishPower", 1, 2);
	Scalers.MenderCapacityCost = new Scaler("MenderCapacityCost", 10, 4);
	Scalers.MenderObtainiumCost = new Scaler("MenderObtainiumCost", 10, 6);
	Scalers.MenderTimeCost = new Scaler("MenderTimeCost", 10, 8);
	
	const inv = document.getElementById("craft-inv");
	const carpenterStats = document.getElementById("carpenter-stats");
	const carpenterDisplay = document.getElementById("carpenter-display");
	const carpenterList = document.getElementById("carpenter-list");
	const carpenterButtons = [
		document.getElementById("carpenter-buy"),
		document.getElementById("carpenter-gear-rim"),
		document.getElementById("carpenter-gear-core")
	];

	let selectedMaterial = null;
	let selectedGear = null;
	let scrapData = [];
	let assembleData = [[]];

	/** @type {Gear[]} */
	CraftingRoom.menderGear = [];
	CraftingRoom.menderCapacity = 1;
	CraftingRoom.menderObtainiumUpgrades = 0;
	CraftingRoom.menderTimeUpgrades = 0;

	let refreshMenderButtons;

	/**
	 * Removes all child nodes of the parent.
	 *
	 * @private
	 * @param {HTMLElement} parent
	 */
	const clearChildren = (parent) => {
		while (parent.hasChildNodes()) {
			parent.removeChild(parent.childNodes[0]);
		}
	};

	/**
	 * Wipes all parts in the inventory.
	 *
	 * @private
	 */
	const wipeParts = () => {
		clearChildren(inv);
	};

	/**
	 * Apply an on-click listener and/or wrap with a tooltip, then append to the inventory.
	 *
	 * @private
	 * @param {Element} render
	 * @param {*} item - given to listener and tip
	 * @param {function(MouseEvent, *) : void} [listener] - fired when clicked
	 * @param {function(*) : string} [tip] - determines tooltip text
	 */
	const appendPart = (render, item, listener, tip) => {
		if (listener != null) {
			render.addEventListener("click", function(e) {
				listener(e, item);
			});
		}
		if (tip != null) {
			render = Util.liveTip(render, item, tip);
		}
		inv.appendChild(render);
	};

	/**
	 * Replace the current inventory display with parts
	 * May apply listeners or tooltips
	 *
	 * @private
	 * @param {function(MouseEvent, *) : void} [listener]
	 * @param {function(*) : string} [tip]
	 */
	const refreshParts = (listener, tip) => {
		wipeParts();
		let id = 1;
		for (let part of Game.partInventory) {
			let render;
			switch (part.type) {
				case "raw":
					render = MaterialGenerator.generate(part.material, id);
					break;
				case "gear-rim":
					render = GearGenerator.generate(part.material, voidMaterial, id);
					break;
				case "gear-core":
					render = GearGenerator.generate(voidMaterial, part.material, id);
					break;
			}
			appendPart(render, part, listener, tip);
			id++;
		}
	};

	/**
	 * Replace the current inventory display with gears
	 * May apply listeners or tooltips
	 *
	 * @private
	 * @param {function(MouseEvent, *) : void} [listener]
	 * @param {function(*) : string} [tip]
	 */
	const refreshPartsAsGears = (listener, tip) => {
		wipeParts();
		let id = 1;
		for (let gear of Game.gearInventory) {
			let render = GearGenerator.render(gear, id);
			appendPart(render, gear, listener, tip);
			id++;
		}
	};

	/**
	 * Refresh the display in the Assembly room
	 *
	 * @private
	 * @param rim
	 * @param core
	 */
	const setGearAssembleData = (rim, core) => {
		assembleData[0] = [rim, core];
		clearChildren(document.getElementById("assembly-gear-rim"));
		clearChildren(document.getElementById("assembly-gear-core"));
		if (rim != null) {
			let render = GearGenerator.generate(rim, voidMaterial, "ASMGR");
			document.getElementById("assembly-gear-rim").appendChild(render);
		}
		if (core != null) {
			let render = GearGenerator.generate(voidMaterial, core, "ASMGC");
			document.getElementById("assembly-gear-core").appendChild(render);
		}
		let lifetime = (rim != null ? rim.gear.duration : 0) + (core != null ? core.gear.coreBonus : 0);
		let allData = rim != null && core != null;
		let strData = [ // I'm sure this can be made better
			`Lifespan: ${Util.toTime(lifetime) + (allData ? "" : "?")}`,
			`Speed: ${rim != null ? Util.display(rim.gear.speed) : "???"}`,
			`Effect: ${core != null ? core.gear.effect[0] + " " + Util.roman(core.gear.effect[1]) : "???"}`
		];
		document.getElementById("assembly-gear-data").innerHTML = strData.join("<br>");
		document.getElementById("assembly-gear-build").disabled = !allData;
	};

	/**
	 * Refresh the display in the Polish room
	 *
	 * @private
	 * @param gear
	 */
	const setPolishData = gear => {
		selectedGear = gear;
		clearChildren(document.getElementById("polish-display"));
		if (gear == null) {
			document.getElementById("polish-button").textContent = `Polish ($${Scalers.PolishCost.getAtLevel(0)})`;
			document.getElementById("polish-button").disabled = true;
			return;
		}
		let polish = gear.polish || 0;
		let render = GearGenerator.render(gear, "POLISH");
		document.getElementById("polish-display").appendChild(render);
		let strData = [
			`Base Speed: ${Util.display(gear.getRots())}`,
			`Polish Count: ${polish}`,
			`Total Polish Multiplier: ${Util.display(Scalers.PolishPower.getAtLevel(polish))}`
		];
		document.getElementById("polish-data").innerHTML = strData.join("<br>");
		document.getElementById("polish-button").textContent = `Polish ($${Util.display(Scalers.PolishCost.getAtLevel(polish), true)})`;
		document.getElementById("polish-button").disabled = polish >= 5;
	};

	/**
	 * Refresh the display in the Scrap room
	 *
	 * @private
	 * @param [gear]
	 */
	const setScrapData = gear => {
		selectedGear = gear;
		clearChildren(document.getElementById("scrap-display"));
		clearChildren(document.getElementById("scrap-loot-display"));
		if (gear == null) {
			document.getElementById("scrap-button").disabled = true;
			scrapData = null;
			return;
		}
		let broken = gear.life === 0;
		let loot = [];
		let probs = [
			0.75, // high
			0.5, // mid
			0.25, // low
		];
		if (broken) {
			probs[0] *= 0.801;
			probs[1] *= 0.801;
			probs[2] *= 0.801;
		}
		if (Obtainium.upgrades.scrap) {
			probs[0] *= 1.201;
			probs[1] *= 1.201;
			probs[2] *= 1.201;
		}
		switch (gear.rim.material) {
			case "wood":
				loot.push([gear.rim, probs[0]]);
				loot.push([gear.rim, probs[2]]);
				break;
		}
		switch (gear.core.material) {
			case "wood":
				loot.push([gear.core, probs[1]]);
				break;
		}
		scrapData = loot;
		document.getElementById("scrap-display").appendChild(GearGenerator.render(gear, "SCRAP"));
		document.getElementById("scrap-button").disabled = false;
		for (let i = 0; i < loot.length; i++) {
			const lt = loot[i];
			const div = document.createElement("div");
			div.appendChild(MaterialGenerator.generate(lt[0], "L" + i));
			const p = document.createElement("p");
			p.textContent = `${Math.floor(lt[1]*100)}%`;
			div.appendChild(p);
			document.getElementById("scrap-loot-display").appendChild(div);
		}
	};


	/**
	 * @private
	 * @param {Gear} gear
	 * @return {number}
	 */
	const menderTimeLeft = gear => {
		let mendTime = gear.mendTime || 0;
		let timeLeft = gear.maxLife - gear.life + mendTime;
		let obtainiumFactor = Math.max(1, Math.pow(Game.obtainium, CraftingRoom.menderObtainiumUpgrades * 0.2));
		let timeFactor = 1 + CraftingRoom.menderTimeUpgrades * 0.05;

		return Math.pow(timeLeft * timeFactor / obtainiumFactor, 1 / timeFactor) - Math.pow(mendTime * timeFactor / obtainiumFactor, 1 / timeFactor);
	};

	/**
	 * @private
	 * @param {Gear} gear
	 * @return {string}
	 */
	const menderTip = gear => {
		return [
			'<pre>[' + '#'.repeat(10*gear.life/gear.maxLife).padEnd(10, ' ') + ']</pre>',
			`max: ${Util.toTime(gear.maxLife)}`,
			`cur: ${Util.toTime(gear.life)}`,
			`done: ${Util.toTime(menderTimeLeft(gear))}`
		].join("<br>");
	};

	/**
	 * @private
	 */
	const refreshMender = () => {
		let inv = document.getElementById("mending-inv");
		clearChildren(inv);
		for (let i = 0; i < CraftingRoom.menderCapacity; i++) {
			let render;
			if (CraftingRoom.menderGear[i] != null) {
				render = GearGenerator.render(CraftingRoom.menderGear[i], i);
				render.addEventListener("click", function(e) {
					let idx = -1;
					for (let i = 0; i < CraftingRoom.menderGear.length; i++) {
						if (inv.children[0].contains(e.currentTarget)) {
							idx = i;
							break;
						}
					}
					let gear = CraftingRoom.menderGear.splice(idx, 1)[0];
					Game.gearInventory.push(gear);
					document.getElementById("mending-machine-button").click();
				});
				render = Util.liveTip(render, CraftingRoom.menderGear[i], menderTip);
			}
			else {
				render = document.createElement("img");
				render.setAttribute("src", "fakegear.svg");
			}
			inv.appendChild(render);
		}
	};

	/**
	 * Ticks the mender through one second of calculation.
	 *
	 * @memberOf CraftingRoom
	 */
	CraftingRoom.tickMender = () => {
		let refresh = false;
		for (let gear of CraftingRoom.menderGear) {
			gear.mendTime++;
			gear.life += Math.max(1, Math.pow(Game.obtainium, CraftingRoom.menderObtainiumUpgrades * 0.2) * Math.pow(gear.mendTime, CraftingRoom.menderTimeUpgrades * 0.05));

			if (gear.life >= gear.maxLife) {
				gear.life = gear.maxLife;
				CraftingRoom.menderGear.splice(CraftingRoom.menderGear.indexOf(gear), 1);
				Game.gearInventory.push(gear);
				refresh = true;
			}
		}

		if (refresh && TabManager.activeTab[1] === 3) {
			document.getElementById("mending-machine-button").click();
		}

		refreshMenderButtons();
	};

	/**
	 * Refreshes all of the buttons in the Mending Machine.
	 *
	 * @private
	 */
	refreshMenderButtons = () => {
		document.getElementById("mending-capacity-qnt").innerText = CraftingRoom.menderCapacity;
		document.getElementById("mending-capacity-cost").innerText = Scalers.MenderCapacityCost.getAtLevel(CraftingRoom.menderCapacity-1);

		document.getElementById("mending-speed-qnt").innerText = CraftingRoom.menderObtainiumUpgrades * 0.2;
		document.getElementById("mending-speed-cost").innerText = Scalers.MenderObtainiumCost.getAtLevel(CraftingRoom.menderObtainiumUpgrades);

		document.getElementById("mending-time-qnt").innerText = CraftingRoom.menderTimeUpgrades * 0.05;
		document.getElementById("mending-time-cost").innerText = Scalers.MenderTimeCost.getAtLevel(CraftingRoom.menderTimeUpgrades);
	};

	/**
	 * Find all items in the part inventory that match the definition, up to the max given.
	 *
	 * @private
	 * @param {{material: material, type: string}} definition - definition to check again
	 * @param {number} max - at most get this many
	 * @return {number[]} - indexes, lowest to highest
	 */
	const findMaterials = (definition, max) => {
		let indexes = [];
		for (let i = 0; i < Game.partInventory.length; i++) {
			let part = Game.partInventory[i];
			if (part.type === definition.type && part.material === definition.material) {
				indexes.push(i);
				if (indexes.length >= max) {
					break;
				}
			}
		}
		return indexes;
	};

	/**
	 * Removes all given indexes.
	 * Removes highest-to-lowest, to prevent removal of the wrong things.
	 *
	 * @private
	 * @param indexes - indexes to remove, in any order
	 */
	const removeMaterials = indexes => {
		indexes.sort((a, b) => b - a); // sort highest to lowest
		for (let idx of indexes) {
			Game.partInventory.splice(idx, 1);
		}
	};

	/**
	 * Arranges the display of a material for places such as the Carpenter's.
	 *
	 * @private
	 * @param {material} material - material to display
	 * @param {HTMLElement} display - material render display
	 * @param {HTMLElement} stats - statistics display
	 * @param {HTMLElement[]} buttons - [buy, rim, core]
	 */
	const displayMaterial = (material, display, stats, buttons) => {
		selectedMaterial = material;
		clearChildren(display);
		display.appendChild(MaterialGenerator.generate(material, 0));

		let statData = [
			`Material: ${material.name} Wood`,
			"", // intentionally blank as a divider
			`Rim Lifespan: ${Util.toTime(material.gear.duration)}`,
			`Rim Speed: ${Util.display(material.gear.speed)}`,
			`Core Lifespan: ${Util.toTime(material.gear.coreBonus)}`,
			`Core Effect: ${material.gear.effect[0]} ${Util.roman(material.gear.effect[1])}`
		];
		stats.innerHTML = statData.join("<br>");

		let matCount = 0;
		for (let part of Game.partInventory) {
			if (part.type === "raw" && part.material === material) {
				matCount++;
			}
		}

		buttons[0].textContent = `Buy ($${material.cost})`;
		buttons[1].disabled = matCount < 2;
		buttons[2].disabled = matCount < 1;
	};

	/**
	 * Binds functions to all the buttons in a work station such as the Carpenter's
	 *
	 * @private
	 * @param {string} lock - the material set to exclusively observe
	 * @param {HTMLElement[]} buttons [buy, rim, core]
	 * @param {HTMLElement[]} group [display, stats] @see displayMaterial
	 */
	const setupButtons = (lock, buttons, group) => {
		buttons[0].addEventListener("click", function() { // buy button
			let mat = selectedMaterial;
			if (Game.trySpendMoney(mat.cost)) {
				Game.partInventory.push({
					type: "raw",
					material: mat
				});
			}
			refreshParts();
			displayMaterial(mat, group[0], group[1], buttons);
		});
		buttons[1].addEventListener("click", function() { // gear rim button
			if (selectedMaterial.material === lock) {
				let parts = findMaterials({
					type: "raw",
					material: selectedMaterial
				}, 2);
				if (parts.length === 2) {
					removeMaterials(parts);
					Game.partInventory.push({
						type: "gear-rim",
						material: selectedMaterial
					});
					refreshParts();
					displayMaterial(selectedMaterial, group[0], group[1], buttons);
				}
			}
		});
		buttons[2].addEventListener("click", function() { // gear core button
			if (selectedMaterial.material === lock) {
				let parts = findMaterials({
					type: "raw",
					material: selectedMaterial
				}, 1);
				if (parts.length === 1) {
					removeMaterials(parts);
					Game.partInventory.push({
						type: "gear-core",
						material: selectedMaterial
					});
					refreshParts();
					displayMaterial(selectedMaterial, group[0], group[1], buttons);
				}
			}
		});
	};

	TabManager.addTabOpenedListener(function() {
		document.getElementById("assembly-tab-button").click();
	}, 0, 3);
	TabManager.addTabClosedListener(wipeParts, 0, 3);

	// Assembly Room Listeners
	TabManager.addTabOpenedListener(function() {
		setGearAssembleData(null, null);
		refreshParts(function(e, part) {
			switch (part.type) {
				case "gear-rim":
					setGearAssembleData(part.material, assembleData[0][1]);
					break;
				case "gear-core":
					setGearAssembleData(assembleData[0][0], part.material);
					break;
			}
		}, function(part) {
			switch (part.type) {
				case "gear-rim":
					return Util.display(part.material.gear.speed) + " rots<br>" + Util.toTime(part.material.gear.duration);
				case "gear-core":
					return part.material.gear.effect[0] + " " + Util.roman(part.material.gear.effect[1]) + "<br>" + Util.toTime(part.material.gear.coreBonus);
			}
		});
	}, 1, 0);
	TabManager.addTabClosedListener(function() {
		setGearAssembleData(null, null);
	}, 1, 0);

	// Polish Shop Listeners
	TabManager.addTabOpenedListener(function() {
		refreshPartsAsGears(function(e, gear) {
			setPolishData(gear);
		}, function(gear) {
			return (gear.polish || 0) + " Polish";
		});
		setPolishData(null);
	}, 1, 1);
	TabManager.addTabClosedListener(function() {
		setPolishData(null);
	}, 1, 1);

	// Scrap Heap Listeners
	TabManager.addTabOpenedListener(function() {
		refreshPartsAsGears(function(e, gear) {
			setScrapData(gear);
		});
		setScrapData(null);
	}, 1, 2);
	TabManager.addTabClosedListener(function() {
		setScrapData(null);
	}, 1, 2);

	// Mending Machine
	TabManager.addTabOpenedListener(function() {
		refreshPartsAsGears(function(e, gear) {
			if (CraftingRoom.menderGear.length < CraftingRoom.menderCapacity) {
				let idx = Game.gearInventory.indexOf(gear);
				Game.gearInventory.splice(idx, 1);
				gear.mendTime = 0;
				CraftingRoom.menderGear.push(gear);
				document.getElementById("mending-machine-button").click();
			}
		}, menderTip);
		refreshMender();
	}, 1, 3);
	TabManager.addTabClosedListener(function() {
		clearChildren(document.getElementById("mending-inv"));
	}, 1, 3);

	// Carpenter's Shop Listeners
	TabManager.addTabOpenedListener(function() {
		displayMaterial(materials.Oak, carpenterDisplay, carpenterStats, carpenterButtons);
		refreshParts();
	}, 1, 4);
	TabManager.addTabClosedListener(function() {
		clearChildren(carpenterDisplay);
	}, 1, 4);

	// list setups
	for (let mat of Object.values(materials)) {
		let button = document.createElement("button");
		button.textContent = mat.name;
		switch (mat.material) {
			case "wood":
				button.addEventListener("click", function() { // jshint ignore:line
					displayMaterial(mat, carpenterDisplay, carpenterStats, carpenterButtons);
				});
				carpenterList.appendChild(button);
				break;
		}
	}

	setupButtons("wood", carpenterButtons, [carpenterDisplay, carpenterStats]);

	document.getElementById("assembly-gear-build").addEventListener("click", function() {
		let rim = assembleData[0][0];
		let core = assembleData[0][1];
		if (rim != null && core != null) {
			let rimPart = findMaterials({
				type: "gear-rim",
				material: rim
			}, 1)[0];
			let corePart = findMaterials({
				type: "gear-core",
				material: core
			}, 1)[0];
			if (rimPart != null && corePart != null) {
				removeMaterials([rimPart, corePart]);
				Game.gearInventory.push(new Gear(rim, core));
				document.getElementById("assembly-tab-button").click();
			}
		}
	});

	document.getElementById("polish-button").addEventListener("click", function() {
		if (selectedGear != null) {
			let polish = selectedGear.polish || 0;
			let cost = Scalers.PolishCost.getAtLevel(selectedGear.polish);
			if (Game.trySpendMoney(cost)) {
				polish++;
				selectedGear.polish = polish;
				setPolishData(selectedGear);
				refreshPartsAsGears(function(e, gear) {
					setPolishData(gear);
				}, function(gear) {
					return (gear.polish || 0) + " Polish";
				});
			}
		}
	});

	document.getElementById("scrap-button").addEventListener("click", function() {
		if (selectedGear != null && scrapData.length !== 0) {
			let idx = Game.gearInventory.indexOf(selectedGear);
			if (idx !== -1) {
				Game.gearInventory.splice(idx, 1);
				for (let loot of scrapData) {
					if (Math.random() < loot[1]) {
						Game.partInventory.push({
							type: "raw",
							material: loot[0]
						});
					}
				}
				refreshPartsAsGears(function(e, gear) {
					setScrapData(gear);
				});
				setScrapData(null);
			}
		}
	});

	document.getElementById("mending-capacity-button").addEventListener("click", function() {
		if (Game.trySpendObtainium(Scalers.MenderCapacityCost.getAtLevel(CraftingRoom.menderCapacity-1))) {
			CraftingRoom.menderCapacity++;
		}
		refreshMender();
	});

	document.getElementById("mending-speed-button").addEventListener("click", function() {
		if (Game.trySpendObtainium(Scalers.MenderObtainiumCost.getAtLevel(CraftingRoom.menderObtainiumUpgrades))) {
			CraftingRoom.menderObtainiumUpgrades++;
		}
		refreshMenderButtons();
	});

	document.getElementById("mending-time-button").addEventListener("click", function() {
		if (Game.trySpendObtainium(Scalers.MenderTimeCost.getAtLevel(CraftingRoom.menderTimeUpgrades))) {
			CraftingRoom.menderTimeUpgrades++;
		}
		refreshMenderButtons();
	});
}