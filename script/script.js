"use strict"
// inventories
let gearInventory = [
	{
		primary: materials.Oak,
		secondary: materials.Oak,
		rots: 1,
		effect: ["persistent", 1],
		lifetime: 1200
	}
]
let partInventory = [
	{
		type: "raw",
		material: materials.Oak
	}
]
let money = 0

// gamestate
let activeGearbox = {
	bonus: 0,
	baseMax: 10,
	operationMin: 0,
	upgrades: {
		lubricate: 0,
		carve: 0
	},
	gears: [],
	rots: 0,
	nextUpdate: Infinity
}
let markup = 0

// gameplay
let moneyDisplay = document.getElementById("money")

function GainMoney(qnt) {
	money += qnt
	moneyDisplay.textContent = "$" + Number.parseFloat(money).toFixed(2)
}

function SpendMoney(qnt) {
	money -= qnt
	moneyDisplay.textContent = "$" + Number.parseFloat(money).toFixed(2)
}

function TrySpendMoney(qnt, func) {
	if (qnt <= money) {
		SpendMoney(qnt)
		if (func != null) {
			func()
		}
		return true
	}
	return false
}

window.setInterval(function() {
	var rots = activeGearbox.rots
	var cashMul = 1 + markup / 4
	GainMoney(rots * cashMul)
}, 1000)