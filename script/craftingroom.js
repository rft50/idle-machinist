/* global TabManager, Scalers, Scaler, Util, Game, GearGenerator, MaterialGenerator, Obtainium,  materials, voidMaterial */
{
	Scalers.PolishCost = new Scaler("PolishCost", 100, 5);
	Scalers.PolishPower = new Scaler("PolishPower", 1, 2);
	
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

	/**
	 * @param {HTMLElement} parent
	 */
	const clearChildren = (parent) => {
		while (parent.hasChildNodes()) {
			parent.removeChild(parent.childNodes[0]);
		}
	};

	const wipeParts = () => {
		clearChildren(inv);
	};

	/**
	 * @param {Element} render
	 * @param {*} item
	 * @param {function(MouseEvent, *) : void} [listener]
	 * @param {function(*) : string} [tip]
	 */
	const appendPart = (render, item, listener, tip) => {
		if (listener != null) {
			render.addEventListener("click", function(e) {
				listener(e, item);
			});
		}
		if (tip != null) {
			render = Util.tip(render, tip(item));
		}
		inv.appendChild(render);
	};

	/**
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
	 * @param {function(MouseEvent, *) : void} [listener]
	 * @param {function(*) : string} [tip]
	 */
	const refreshPartsAsGears = (listener, tip) => {
		wipeParts();
		let id = 1;
		for (let gear of Game.gearInventory) {
			let render = GearGenerator.render(gear, id);
			appendPart(render, gear, listener, tip);
		}
	};

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
			`Lifespan: ${Util.lifetime(lifetime) + (allData ? "" : "?")}`,
			`Speed: ${rim != null ? Util.display(rim.gear.speed) : "???"}`,
			`Effect: ${core != null ? core.gear.effect[0] + " " + Util.roman(core.gear.effect[1]) : "???"}`
		];
		document.getElementById("assembly-gear-data").innerHTML = strData.join("<br>");
		document.getElementById("assembly-gear-build").disabled = !allData;
	};

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
			`Base Speed: ${Util.display(gear.primary.gear.speed)}`,
			`Polish Count: ${polish}`,
			`Adjusted Speed: ${Util.display(gear.primary.gear.speed*Scalers.PolishPower.getAtLevel(polish), true)}`
		];
		document.getElementById("polish-data").innerHTML = strData.join("<br>");
		document.getElementById("polish-button").textContent = `Polish ($${Util.display(Scalers.PolishCost.getAtLevel(polish), true)})`;
		document.getElementById("polish-button").disabled = polish >= 5;
	};

	/**
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
		let broken = gear.lifetime === 0;
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
		switch (gear.primary.material) {
			case "wood":
				loot.push([gear.primary, probs[0]]);
				loot.push([gear.primary, probs[2]]);
				break;
		}
		switch (gear.secondary.material) {
			case "wood":
				loot.push([gear.secondary, probs[1]]);
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

	// Finds all items in the part inventory that match the definition,
	// up to the max count.
	// Returns an array of indexes, lowest to highest.
	/**
	 * @param {{material: [material], type: string}} definition
	 * @param {number} max
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

	// Bulk-removes all indexes specifies.
	// Removes them highest to lowest index, so as to prevent data corruption.
	const removeMaterials = indexes => {
		indexes.sort((a, b) => b - a); // sort highest to lowest
		for (let idx of indexes) {
			Game.partInventory.splice(idx, 1);
		}
	};

	/**
	 * @param {material} material
	 * @param {HTMLElement} display
	 * @param {HTMLElement} stats
	 * @param {HTMLElement[]} buttons
	 */
	const displayMaterial = (material, display, stats, buttons) => {
		selectedMaterial = material;
		clearChildren(display);
		display.appendChild(MaterialGenerator.generate(material, 0));

		let statData = [
			`Material: ${material.name} Wood`,
			"", // intentionally blank as a divider
			`Rim Lifespan: ${Util.lifetime(material.gear.duration)}`,
			`Rim Speed: ${Util.display(material.gear.speed)}`,
			`Core Lifespan: ${Util.lifetime(material.gear.coreBonus)}`,
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
	 * @param {string} lock
	 * @param {HTMLElement[]} buttons
	 * @param {HTMLElement[]} group
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
					return Util.display(part.material.gear.speed) + " rots<br>" + Util.lifetime(part.material.gear.duration);
				case "gear-core":
					return part.material.gear.effect[0] + " " + Util.roman(part.material.gear.effect[1]) + "<br>" + Util.lifetime(part.material.gear.coreBonus);
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

	// Carpenter's Shop Listeners
	TabManager.addTabOpenedListener(function() {
		displayMaterial(materials.Oak, carpenterDisplay, carpenterStats, carpenterButtons);
		refreshParts();
	}, 1, 3);
	TabManager.addTabClosedListener(function() {
		clearChildren(carpenterDisplay);
	}, 1, 3);

	// list setups
	for (let mat of Object.values(materials)) {
		let button = document.createElement("button");
		button.textContent = mat.name;
		switch (mat.material) {
			case "wood":
				button.addEventListener("click", function() {
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
				Game.gearInventory.push({
					primary: rim,
					secondary: core,
					rots: rim.gear.speed,
					effect: core.gear.effect,
					lifetime: rim.gear.duration + core.gear.coreBonus
				});
				document.getElementById("assembly-tab-button").click();
			}
		}
	});

	document.getElementById("polish-button").addEventListener("click", function() {
		if (selectedGear != null) {
			let polish = selectedGear.polish || 0;
			let cost = 100 * Math.pow(5, polish);
			if (Game.trySpendMoney(cost)) {
				polish++;
				selectedGear.polish = polish;
				selectedGear.rots = selectedGear.primary.gear.speed * Math.pow(2, polish);
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
}