/* global Game, MachineShop, materials */
let Options = {};

{
	const removeMaterialReferences = tbl => {
		if (typeof tbl !== "object") {
			return tbl;
		}
		let ret = {};
		for (let idx in tbl) {
			let val = tbl[idx];
			if (val.name != null) {
				ret[idx] = val.name;
			}
			else {
				ret[idx] = removeMaterialReferences(val);
			}
		}
		return ret;
	};

	const parseMaterial = mat => materials[mat];

	/**
	 * @param {Object.<String>} tbl
	 * @return {*}
	 */
	const refreshGear = tbl => {
		tbl.rots = parseInt(tbl.rots);
		tbl.lifetime = parseInt(tbl.lifetime);
		tbl.effect[1] = parseInt(tbl.effect[1]);

		tbl.primary = parseMaterial(tbl.primary);
		tbl.secondary = parseMaterial(tbl.secondary);

		return tbl;
	};

	const saveFile = () => {
		MachineShop.recalculateGears();
		let file = {};

		// inventories
		file.money = Game.money;
		file.gearInventory = removeMaterialReferences(Game.gearInventory);
		file.partInventory = removeMaterialReferences(Game.partInventory);

		// upgrades
		file.markup = Game.markup;

		// misc
		file.activeGearbox = removeMaterialReferences(Game.activeGearbox);

		return file;
	};

	const loadFile = file => {
		// inventories
		Game.money = parseFloat(file.money) || 0;

		// upgrades
		Game.markup = parseInt(file.markup) || 0;
		Game.gearInventory = [];
		for (let gear of Object.values(file.gearInventory)) {
			Game.gearInventory.push(refreshGear(gear));
		}
		Game.partInventory = [];
		for (let part of Object.values(file.partInventory)) {
			Game.partInventory.push({
				material: parseMaterial(part.material),
				type: part.type
			});
		}

		// misc
		Game.activeGearbox = {};
		Game.activeGearbox.baseMax = parseInt(file.activeGearbox.baseMax);
		Game.activeGearbox.bonus = parseFloat(file.activeGearbox.bonus);
		Game.activeGearbox.opeationMin = parseFloat(file.activeGearbox.operationMin);
		Game.activeGearbox.upgrades = {
			lubricate: parseInt(file.activeGearbox.upgrades.lubricate),
			carve: parseInt(file.activeGearbox.upgrades.carve)
		};
		Game.activeGearbox.gears = [];
		for (let gear of Object.values(file.activeGearbox.gears)) {
			let g = refreshGear(gear);
			g.placed = Math.floor(Date.now()/1000);
			Game.activeGearbox.gears.push(g);
		}

		MachineShop.recalculateGears();
	};

	const download = (filename, text) => {
		let element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	  };

	Options.save = function() {
		localStorage.setItem("saveFile", JSON.stringify(saveFile()));
	};
	Options.load = function() {
		loadFile(JSON.parse(localStorage.getItem("saveFile") || "{}"));
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