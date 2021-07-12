/* global materials */
{
	let matList = document.getElementById("materialsList");
	let effList = document.getElementById("effectsList");
	let button = document.getElementById("materialsButton");
	let effectSet = new Set();
	let allValid = true;
	let valid;
	let tip;

	const verify = (arr, props) => {
		let x = arr;
		for (let i = 0; i < props.length; i++) {
			x = x[props[i]];
			if (typeof x === "undefined") {
				tip += "\nNo " + props.join(".");
				valid = false;
				allValid = false;
				return false;
			}
		}
		return true;
	};

	const verifyPlus = (prop, rule, msg) => {
		if (!rule(prop)) {
			tip += "\n" + msg;
			valid = false;
			allValid = false;
			return false;
		}
		return true;
	};

	let color = x => x >= 0 && x <= 255;
	let material = x => x === "wood" || x === "metal" || x === "crystal";

	for (let m in materials) {
		valid = true;
		tip = "Problems:";
		let x = document.createElement("div");
		let mat = materials[m];

		// general properties
		if (verify(mat, ["material"])) {
			verifyPlus(mat.material, material, "Invalid material");
		}
		verify(mat, ["cost"]);
		if (verify(mat, ["color"])) {
			if (verifyPlus(mat.color, x => x.length === 3, "color is not 3 numbers")) {
				verifyPlus(mat.color[0], color, "color's Red isn't valid");
				verifyPlus(mat.color[1], color, "color's Green isn't valid");
				verifyPlus(mat.color[2], color, "color's Blue isn't valid");
			}
		}

		// gear properties
		verify(mat, ["gear", "duration"]);
		verify(mat, ["gear", "speed"]);
		verify(mat, ["gear", "coreBonus"]);
		if (verify(mat, ["gear", "effect"])) {
			if (verifyPlus(mat.gear.effect, x => x.length === 2, "gear.effect is not [string, number]")) {
				effectSet.add(mat.gear.effect[0]);
			}
		}

		// displaying
		x.innerText = m;
		x.classList.add(valid ? "valid" : "invalid");
		if (!valid) {
			x.setAttribute("title", tip);
		}
		matList.appendChild(x);
	}
	for (let eff of effectSet) {
		// later this verification code will be replaced with seeing if it's an actual effect or not
		let x = document.createElement("div");
		valid = eff === eff.toLowerCase() && eff === eff.trim();

		x.innerText = eff;
		x.classList.add(valid ? "valid" : "invalid");
		allValid = allValid && valid;
		effList.appendChild(x);
	}
	button.classList.add(allValid ? "valid" : "invalid");
}