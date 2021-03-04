"use strict"

{
	let dropdown = document.getElementById("material-polish-dropdown")
	let area = document.getElementById("material-polish-area")
	let selectedCore = ""

	function getCore(bypass) {
		if (selectedCore == "pure") {
			return bypass
		}
		return materials[selectedCore]
	}

	function refresh() {
		while (area.hasChildNodes()) {
			area.removeChild(area.firstChild)
		}
		selectedCore = dropdown.value
		for (var mater in materials) {
			var mat = materials[mater]
			var core = getCore(mat)
			var baseCost = mat.cost * 2 + core.cost
			var baseProduction = (mat.gear.duration + core.gear.coreBonus) * mat.gear.speed
			var ROIs = []
			var polishTally = 0
			for (var i = 0; i <= 5; i++) {
				ROIs[i] = (baseProduction * Math.pow(2, i)) /
						(baseCost + polishTally)
				polishTally += 100 * Math.pow(5, i)
			}
			var maxROI = ROIs.reduce((x, y) => Math.max(x, y))
			var maxROIi = ROIs.indexOf(maxROI)

			var div = document.createElement("div")
			var temp = GenerateGear(mat, core, mater, maxROIi)
			div.appendChild(temp)
			temp = document.createElement("div")
			temp.innerHTML = `
				${mater}/${core.name}
				<br>
				Base Cost: ${baseCost}
				<br>
				Base Production: ${baseProduction}
				<br>
				Optimal Polish: ${maxROIi}
				<br>
				Optimal Polish ROI: ${(maxROI*100).toFixed(2)}%
			`
			div.appendChild(temp)
			area.appendChild(div)
		}
	}

	for (var mater in materials) {
		var option = document.createElement("option")
		option.value = mater
		option.textContent = mater
		dropdown.appendChild(option)
	}

	dropdown.addEventListener("change", refresh)
}