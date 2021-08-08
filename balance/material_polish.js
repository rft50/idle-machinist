/* global materials, GearGenerator */

{
	let dropdown = document.getElementById("material-polish-dropdown");
	let area = document.getElementById("material-polish-area");
	let selectedCore = "";

	const getCore = bypass => {
		if (selectedCore === "pure") {
			return bypass;
		}
		return materials[selectedCore];
	};

	const refresh = () => {
		while (area.hasChildNodes()) {
			area.removeChild(area.firstChild);
		}
		selectedCore = dropdown.value;
		for (let mater in materials) {
			let mat = materials[mater];
			let core = getCore(mat);
			let baseCost = mat.cost * 2 + core.cost;
			let baseProduction = (mat.gear.duration + core.gear.coreBonus) * mat.gear.speed;
			if (core.gear.effect[0] === "perseverance") {
				baseProduction *= 1 + 0.2 * core.gear.effect[1];
			}
			let ROIs = [];
			let polishTally = 0;
			for (let i = 0; i <= 5; i++) {
				ROIs[i] = baseProduction * Math.pow(2, i) /
						(baseCost + polishTally);
				polishTally += 100 * Math.pow(5, i);
			}
			let maxROI = ROIs.reduce((x, y) => Math.max(x, y));
			let maxROIi = ROIs.indexOf(maxROI);

			let div = document.createElement("div");
			let temp = GearGenerator.generate(mat, core, mater, maxROIi);
			div.appendChild(temp);
			temp = document.createElement("div");
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
			`;
			div.appendChild(temp);
			area.appendChild(div);
		}
	};

	for (let mater in materials) {
		let option = document.createElement("option");
		option.value = mater;
		option.textContent = mater;
		dropdown.appendChild(option);
	}

	dropdown.addEventListener("change", refresh);
}