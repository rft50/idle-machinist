"use strict"

{
	let inv = document.getElementById("craft-inv")
	let carpenterStats = document.getElementById("carpenter-stats")
	let carpenterDisplay = document.getElementById("carpenter-display")
	let carpenterList = document.getElementById("carpenter-list")
	let carpenterButtons = [
		document.getElementById("carpenter-buy"),
		document.getElementById("carpenter-gear-rim"),
		document.getElementById("carpenter-gear-core")
	]

	let selectedMaterial = null
	let assembleData = [[]]

	function clearChildren(parent) {
		while (parent.hasChildNodes()) {
			parent.removeChild(parent.childNodes[0])
		}
	}

	function wipeParts() {
		clearChildren(inv)
	}

	function refreshParts(listener) {
		wipeParts()
		let id = 1
		for (let part of partInventory) {
			let render
			switch (part.type) {
				case "raw":
					render = GenerateMaterial(part.material, id)
					break;
				case "gear-rim":
					render = GenerateGear(part.material, voidMaterial, id)
					break;
				case "gear-core":
					render = GenerateGear(voidMaterial, part.material, id)
					break;
			}
			if (listener != null) {
				render.addEventListener("click", function(e) {
					listener(e, part)
				})
			}
			inv.appendChild(render)
			id++
		}
	}

	function setGearAssembleData(rim, core) {
		assembleData[0] = [rim, core]
		clearChildren(document.getElementById("assembly-gear-rim"))
		clearChildren(document.getElementById("assembly-gear-core"))
		if (rim != null) {
			let render = GenerateGear(rim, voidMaterial, "ASMGR")
			document.getElementById("assembly-gear-rim").appendChild(render)
		}
		if (core != null) {
			let render = GenerateGear(voidMaterial, core, "ASMGC")
			document.getElementById("assembly-gear-core").appendChild(render)
		}
		let lifetime = (rim != null ? rim.gear.duration : 0) + (core != null ? core.gear.coreBonus : 0)
		let allData = rim != null && core != null
		let strData = [ // I'm sure this can be made better
			`Lifespan: ${lifetime + (allData ? "" : "?")}`,
			`Speed: ${rim != null ? rim.gear.speed : "???"}`,
			`Effect: ${core != null ? (core.gear.effect.join(" ")) : "???"}`
		]
		document.getElementById("assembly-gear-data").innerHTML = strData.join("<br>")
		document.getElementById("assembly-gear-build").disabled = !allData
	}

	// Finds all items in the part inventory that match the definition,
	// up to the max count.
	// Returns an array of indexes, lowest to highest.
	function findMaterials(definition, max) {
		let indexes = []
		for (let i = 0; i < partInventory.length; i++) {
			let part = partInventory[i]
			if (part.type == definition.type && part.material == definition.material) {
				indexes.push(i)
				if (indexes.length >= max) {
					break
				}
			}
		}
		return indexes
	}

	// Bulk-removes all indexes specifies.
	// Removes them highest to lowest index, so as to prevent data corruption.
	function removeMaterials(indexes) {
		indexes.sort((a, b) => b - a) // sort highest to lowest
		for (let idx of indexes) {
			partInventory.splice(idx, 1)
		}
	}

	function displayMaterial(material, display, stats, buttons) {
		selectedMaterial = material
		clearChildren(display)
		display.appendChild(GenerateMaterial(material, 0))

		let statData = [
			`Material: ${material.name} Wood`,
			"", // intentionally blank as a divider
			`Rim Lifespan: ${material.gear.duration}`,
			`Rim Speed: ${material.gear.speed}`,
			`Core Lifespan: ${material.gear.coreBonus}`,
			`Core Effect: ${material.gear.effect[0]} ${material.gear.effect[1]}`
		]
		stats.innerHTML = statData.join("<br>")

		let matCount = 0
		for (let part of partInventory) {
			if (part.type == "raw" && part.material == material) {
				matCount++
			}
		}

		buttons[0].textContent = `Buy ($${material.cost})`
		buttons[1].disabled = matCount < 2
		buttons[2].disabled = matCount < 1
	}

	function setupButtons(lock, buttons, group) {
		buttons[0].addEventListener("click", function() { // buy button
			let mat = selectedMaterial
			if (TrySpendMoney(mat.cost)) {
				partInventory.push({
					type: "raw",
					material: mat
				})
			}
			refreshParts()
			displayMaterial(mat, group[0], group[1], buttons)
		})
		buttons[1].addEventListener("click", function() { // gear rim button
			if (selectedMaterial.material == lock) {
				var parts = findMaterials({
					type: "raw",
					material: selectedMaterial
				}, 2)
				if (parts.length == 2) {
					removeMaterials(parts)
					partInventory.push({
						type: "gear-rim",
						material: selectedMaterial
					})
					refreshParts()
					displayMaterial(selectedMaterial, group[0], group[1], buttons)
				}
			}
		})
		buttons[2].addEventListener("click", function() { // gear core button
			if (selectedMaterial.material == lock) {
				var parts = findMaterials({
					type: "raw",
					material: selectedMaterial
				}, 1)
				if (parts.length == 1) {
					removeMaterials(parts)
					partInventory.push({
						type: "gear-core",
						material: selectedMaterial
					})
					refreshParts()
					displayMaterial(selectedMaterial, group[0], group[1], buttons)
				}
			}
		})
	}

	AddTabOpenedListener(function() {
		document.getElementById("assembly-tab-button").click()
	}, 0, 3)
	AddTabClosedListener(wipeParts, 0, 3)

	// Assembly Room Listeners
	AddTabOpenedListener(function() {
		setGearAssembleData(null, null)
		refreshParts(function(e, part) {
			switch (part.type) {
				case "gear-rim":
					setGearAssembleData(part.material, assembleData[0][1])
					break
				case "gear-core":
					setGearAssembleData(assembleData[0][0], part.material)
					break
			}
		})
	}, 1, 0)
	AddTabClosedListener(function() {
		setGearAssembleData(null, null)
	}, 1, 0)

	// Carpenter's Shop Listeners
	AddTabOpenedListener(function() {
		displayMaterial(materials.Oak, carpenterDisplay, carpenterStats, carpenterButtons)
		refreshParts()
	}, 1, 1)
	AddTabClosedListener(function() {
		clearChildren(carpenterDisplay)
	}, 1, 1)

	// list setups
	for (let mat of Object.values(materials)) {
		let button = document.createElement("button")
		button.textContent = mat.name
		switch (mat.material) {
			case "wood":
				button.addEventListener("click", function() {
					displayMaterial(mat, carpenterDisplay, carpenterStats, carpenterButtons)
				})
				carpenterList.appendChild(button)
				break;
		}
	}

	setupButtons("wood", carpenterButtons, [carpenterDisplay, carpenterStats])

	document.getElementById("assembly-gear-build").addEventListener("click", function() {
		let rim = assembleData[0][0]
		let core = assembleData[0][1]
		if (rim != null && core != null) {
			let rimPart = findMaterials({
				type: "gear-rim",
				material: rim
			}, 1)[0]
			let corePart = findMaterials({
				type: "gear-core",
				material: core
			}, 1)[0]
			if (rimPart != null && corePart != null) {
				removeMaterials([rimPart, corePart])
				gearInventory.push({
					primary: rim,
					secondary: core,
					rots: rim.gear.speed,
					effect: core.gear.effect,
					lifetime: rim.gear.duration + core.gear.coreBonus
				})
				document.getElementById("assembly-tab-button").click()
			}
		}
	})
}