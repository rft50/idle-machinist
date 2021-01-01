/*
A material has the following properties:
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

var materials = {
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
	}
}

var voidMaterial = {
	material: "void",
	color: [0, 0, 0, 0]
}