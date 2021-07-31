/** @namespace Options */
let Options = {};
Options.autoSave = false;

{
	/**
	 * @private
	 */
	const updateAutoSaveButton = () => {
		document.getElementById("auto-save-state").textContent = Options.autoSave ? 'On' : 'Off';
	};

	/**
	 * Trims out any references to known materials.
	 *
	 * @private
	 * @param {*} tbl
	 * @return {*}
	 */
	const removeMaterialReferences = tbl => {
		if (Array.isArray(tbl)) {
			let ret = [];
			for (let idx in tbl) {
				let val = tbl[idx];
				if (typeof val === "object" && val.name != null) {
					ret[idx] = val.name;
				}
				else {
					ret[idx] = removeMaterialReferences(val);
				}
			}
			return ret;
		}
		else if (typeof tbl === "object") {
			let ret = {};
			for (let idx in tbl) {
				let val = tbl[idx];
				if (typeof val === "object" && val.name != null) {
					ret[idx] = val.name;
				}
				else {
					ret[idx] = removeMaterialReferences(val);
				}
			}
			return ret;
		}
		return tbl;
	};

	/**
	 * Reinsert references to known materials
	 *
	 * @private
	 * @param {string} mat
	 * @return {material}
	 */
	const parseMaterial = mat => materials[mat];

	/**
	 * Parse a gear's stats to the correct types
	 *
	 * @private
	 * @param {Object.<String>} tbl
	 * @return {*}
	 */
	const refreshGear = tbl => {
		let gear = new Gear(parseMaterial(tbl.rim), parseMaterial(tbl.core));

		gear.life = tbl.life;
		gear.polish = tbl.polish;
		gear.mendTime = tbl.mendTime;

		return gear;
	};

	/**
	 * Save the current state of the game
	 *
	 * @private
	 * @return {Object}
	 */
	const saveFile = () => {
		let file = {};

		// inventories
		file.money = Game.money;
		file.gearInventory = removeMaterialReferences(Game.gearInventory);
		file.partInventory = removeMaterialReferences(Game.partInventory);

		// upgrades
		file.markup = Game.markup;

		// obtainium
		file.obtainium = Game.obtainium;
		file.obtainiumUpgrades = Obtainium.upgrades;

		// mending machine
		file.menderCapacity = CraftingRoom.menderCapacity;
		file.menderObtainiumUpgrades = CraftingRoom.menderObtainiumUpgrades;
		file.menderTimeUpgrades = CraftingRoom.menderTimeUpgrades;
		file.menderGears = removeMaterialReferences(CraftingRoom.menderGear);

		// misc
		file.activeGearbox = removeMaterialReferences(Game.activeGearbox);

		file.autoSave = Options.autoSave;

		return file;
	};

	/**
	 * Load a state from a previously created file
	 *
	 * @private
	 * @param {Object} file
	 */
	const loadFile = file => {
		// inventories
		Game.money = parseFloat(file.money) || 0;

		// upgrades
		Game.markup = parseInt(file.markup) || 0;
		Game.gearInventory = [];
		for (let gear of Object.values(file.gearInventory || {})) {
			Game.gearInventory.push(refreshGear(gear));
		}
		Game.partInventory = [];
		for (let part of Object.values(file.partInventory || {})) {
			Game.partInventory.push({
				material: parseMaterial(part.material),
				type: part.type
			});
		}

		// obtainium
		Game.obtainium = file.obtainium || 0;
		Obtainium.upgrades = file.obtainiumUpgrades || {};
		Scalers.LubeCost.setBaseModifier("cheaper-lubrication", Obtainium.upgrades.lubricate ? 0.5 : 0);
		document.getElementById("cheaper-lubrication").className = Obtainium.upgrades.lubricate ? "obtainium purchased" : "obtainium";
		document.getElementById("persistence-boost").className = Obtainium.upgrades.persistence ? "obtainium purchased" : "obtainium";
		document.getElementById("scrap-boost").className = Obtainium.upgrades.scrap ? "obtainium purchased" : "obtainium";
		document.getElementById("wood-haggling").className = Obtainium.upgrades.woodHaggling ? "obtainium purchased" : "obtainium";
		Scalers.MarkupCost.setMultiplierModifier("obtainiumMarkup", -1);
		document.getElementById("obtainium-markup").className = Obtainium.upgrades.markup ? "obtainium purchased" : "obtainium";
		document.getElementById("mending-machine-button").hidden = false;
		document.getElementById("mending-machine-unlock").className = Obtainium.upgrades.menderUnlock ? "obtainium purchased" : "obtainium";

		let hasObtainium = Game.obtainium > 0 || Object.keys(Obtainium.upgrades).length !== 0;
		document.getElementById("obtainium-prestige").hidden = !hasObtainium;
		document.getElementById("obtainium-display").hidden = !hasObtainium;
		document.getElementById("obtainium-tab").hidden = !hasObtainium;

		Game.gainObtainium(0);

		// mending machine
		CraftingRoom.menderCapacity = file.menderCapacity || 1;
		CraftingRoom.menderObtainiumUpgrades = file.menderObtainiumUpgrades || 0;
		CraftingRoom.menderTimeUpgrades = file.menderTimeUpgrades || 0;
		CraftingRoom.menderGears = [];
		if (file.menderGears != null) {
			for (let i = 0; i < file.menderGears.length; i++) {
				let fg = file.menderGears[i];
				CraftingRoom.menderGears.push(refreshGear(fg));
			}
		}

		// misc
		file.activeGearbox = file.activeGearbox || {};
		file.activeGearbox.upgrades = file.activeGearbox.upgrades || {};

		Game.activeGearbox = {};
		Game.activeGearbox.baseMax = parseInt(file.activeGearbox.baseMax || 10);
		Game.activeGearbox.bonus = parseFloat(file.activeGearbox.bonus || 0);
		Game.activeGearbox.opeationMin = parseFloat(file.activeGearbox.operationMin || 0);
		Game.activeGearbox.upgrades = {
			lubricate: parseInt(file.activeGearbox.upgrades.lubricate || 0),
			carve: parseInt(file.activeGearbox.upgrades.carve || 0)
		};
		Game.activeGearbox.gears = [];
		for (let gear of Object.values(file.activeGearbox.gears || {})) {
			let g = refreshGear(gear);
			g.placed = Math.floor(Date.now()/1000);
			Game.activeGearbox.gears.push(g);
		}

		Options.autoSave = file.autoSave || false; // Default to false if null
		updateAutoSaveButton();
	};

	/**
	 * Download a file to the client
	 *
	 * @private
	 * @param filename
	 * @param text - contents
	 */
	const download = (filename, text) => {
		let element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	};

	/**
	 * Save the game locally.
	 *
	 * @memberOf Options
	 */
	Options.save = function() {
		localStorage.setItem("saveFile", JSON.stringify(saveFile()));
	};

	/**
	 * Load the local save game.
	 *
	 * @memberOf Options
	 */
	Options.load = function() {
		loadFile(JSON.parse(localStorage.getItem("saveFile") || "{}"));
	};

	/**
	 * Toggle automatic saving.
	 *
	 * @memberOf Options
	 */
	Options.toggleAutoSave = function() {
		Options.autoSave = !Options.autoSave;
		updateAutoSaveButton();
	};
	document.getElementById("save-file").addEventListener("click", function() {
		download("Idle Machinist Save.txt", JSON.stringify(saveFile()));
	});
	document.getElementById("load-file").addEventListener("change", function(e) {
		let file = e.target.files[0];
		let reader = new FileReader();
		reader.addEventListener("load", (event) => {
			loadFile(JSON.parse(event.target.result));
		});
		reader.readAsText(file);
	});
}

window.setInterval(function() {
	if (Options.autoSave) {
		Options.save();
	}
}, 60 * 1000); // Auto save every minute

window.onbeforeunload = function(){
	if (Options.autoSave) {
		Options.save();
	}
};