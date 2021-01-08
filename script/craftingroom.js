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

	function clearChildren(parent) {
		while (parent.hasChildNodes()) {
			parent.removeChild(parent.childNodes[0])
		}
	}

	function wipeParts() {
		clearChildren(inv)
	}

	function refreshParts() {
		wipeParts()
		let id = 1
		for (let part of partInventory) {
			let render
			switch (part.type) {
				case "raw":
					render = GenerateMaterial(part.material, id)
			}
			inv.appendChild(render)
			id++
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

	function setupButtons(buttons, group) {
		buttons[0].addEventListener("click", function() {
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
	}

	AddTabOpenedListener(refreshParts, 0, 3)
	AddTabClosedListener(wipeParts, 0, 3)

	// Carpenter's Shop Listeners
	AddTabOpenedListener(function() {
		displayMaterial(materials.Oak, carpenterDisplay, carpenterStats, carpenterButtons)
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

	setupButtons(carpenterButtons, [carpenterDisplay, carpenterStats])
}