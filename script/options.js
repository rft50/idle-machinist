"use strict"

let Save
let Load
{
	function removeMaterialReferences(tbl) {
		if (typeof(tbl) != "object") {
			return tbl
		}
		var ret = {}
		for (var idx in tbl) {
			var val = tbl[idx]
			if (val.name != null) {
				ret[idx] = val.name
			}
			else {
				ret[idx] = removeMaterialReferences(val)
			}
		}
		return ret
	}

	function parseMaterial(mat) {
		return materials[mat]
	}

	function refreshGear(tbl) {
		tbl.rots = parseInt(tbl.rots)
		tbl.lifetime = parseInt(tbl.lifetime)
		tbl.effect[1] = parseInt(tbl.effect[1])

		tbl.primary = parseMaterial(tbl.primary)
		tbl.secondary = parseMaterial(tbl.secondary)

		return tbl
	}

	function saveFile() {
		RecalculateGears()
		var file = {}

		// inventories
		file.money = money
		file.gearInventory = removeMaterialReferences(gearInventory)
		file.partInventory = removeMaterialReferences(partInventory)

		// upgrades
		file.markup = markup

		// misc
		file.activeGearbox = removeMaterialReferences(activeGearbox)

		console.log(file)
		return file
	}

	function loadFile(file) {
		// inventories
		money = parseFloat(file.money) ?? 0

		// upgrades
		markup = parseInt(file.markup) ?? 0
		gearInventory = []
		for (var gear of Object.values(file.gearInventory)) {
			gearInventory.push(refreshGear(gear))
		}
		partInventory = []
		for (var part of Object.values(file.partInventory)) {
			partInventory.push({
				material: parseMaterial(part.material),
				type: part.type
			})
		}

		// misc
		activeGearbox = {}
		activeGearbox.baseMax = parseInt(file.activeGearbox.baseMax)
		activeGearbox.bonus = parseFloat(file.activeGearbox.bonus)
		activeGearbox.opeationMin = parseFloat(file.activeGearbox.operationMin)
		activeGearbox.upgrades = {
			lubricate: parseInt(file.activeGearbox.upgrades.lubricate),
			carve: parseInt(file.activeGearbox.upgrades.carve)
		}
		activeGearbox.gears = []
		for (var gear of Object.values(file.activeGearbox.gears)) {
			var g = refreshGear(gear)
			g.placed = Math.floor(Date.now()/1000)
			activeGearbox.gears.push(g)
		}

		RecalculateGears()
	}

	function download(filename, text) {
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);
	  
		element.style.display = 'none';
		document.body.appendChild(element);
	  
		element.click();
	  
		document.body.removeChild(element);
	  }

	Save = function() {
		localStorage.setItem("saveFile", JSON.stringify(saveFile()))
	}
	Load = function() {
		loadFile(JSON.parse(localStorage.getItem("saveFile") ?? "{}"))
	}
	document.getElementById("save-file").addEventListener("click", function() {
		download("Idle Machinist Save.txt", JSON.stringify(saveFile()))
	})
	document.getElementById("load-file").addEventListener("change", function(e) {
		var file = e.target.files[0]
		var reader = new FileReader()
		reader.addEventListener("load", (event) => {
			loadFile(JSON.parse(event.target.result))
		})
		reader.readAsText(file)
	})
}