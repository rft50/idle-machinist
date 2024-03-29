/*
A material has the following properties:
name: (autogenerated to be the name in the dictionary)
material: "wood", "metal", or "crystal"
cost: int
color: [R, G, B]
gear: {
	duration: int (how long it lasts, in seconds)
	speed: number
	coreBonus: int (how much time is added or removed as a core, in seconds)
	effect: [String, int] (The effect as a core, along with what tier the effect is)
}

Please try to keep this file grouped by material and sorted cheapest to most expensive.
*/

/**
 * @typedef material
 * @property {string} name
 * @property {string} material -- wood, metal, or gem
 * @property {number} cost
 * @property {[number, number, number, ?number]} color - r g b [a]
 * @property {gearData} gear
 */

/**
 * @typedef gearData
 * @property {number} duration
 * @property {number} speed
 * @property {number} coreBonus
 * @property {[string, number]} effect
 */

/**
 * @type {Object.<material>}
 */
let materials = {
	// Wood
	Oak: {
		material: "wood",
		cost: 10,
		color: [185, 149, 89],
		gear: {
			duration: 600,
			speed: 1,
			coreBonus: 600,
			effect: ["persistent", 1]
		}
	},
	Pine: {
		material: "wood",
		cost: 100,
		color: [122, 100, 62],
		gear: {
			duration: 300,
			speed: 3,
			coreBonus: 150,
			effect: ["persistent", 1]
		}
	},
	Ash: {
		material: "wood",
		cost: 5000,
		color: [223, 170, 95],
		gear: {
			duration: 7200,
			speed: 2,
			coreBonus: 0,
			effect: ["perseverance", 1]
		}
	},
	Cedar: {
		material: "wood",
		cost: 20000,
		color: [208, 133, 121],
		gear: {
			duration: 600,
			speed: 10,
			coreBonus: -300,
			effect: ["persistent", 2]
		}
	},
	Alder: {
		material: "wood",
		cost: 400000,
		color: [125, 71, 66],
		gear: {
			duration: 14400,
			speed: 4,
			coreBonus: -600,
			effect: ["perseverance", 2]
		}
	},
	Rowan: {
		material: "wood",
		cost: 1e6,
		color: [150, 129, 63],
		gear: {
			duration: 1200,
			speed: 15,
			coreBonus: -300,
			effect: ["persistent", 2]
		}
	},
	Mahogany: {
		material: "wood",
		cost: 1e8,
		color: [155, 91, 86],
		gear: {
			duration: 14400,
			speed: 10,
			coreBonus: 0,
			effect: ["persistent", 2]
		}
	}
};

for (let idx in materials) {
	materials[idx].name = idx;
}

let voidMaterial = {
	material: "void",
	color: [0, 0, 0, 0]
};