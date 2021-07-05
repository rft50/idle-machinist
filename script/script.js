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
let obtainium = 0

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
let obtainiumDisplay = document.getElementById("obtainium")

function GainMoney(qnt) {
	money += qnt
	moneyDisplay.textContent = "$" + Util.display(money, true)
}

function SpendMoney(qnt) {
	money -= qnt
	moneyDisplay.textContent = "$" + Util.display(money, true)
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

function GainObtainium(qnt) {
	obtainium += qnt
	obtainiumDisplay.textContent = Util.display(obtainium, false) + " Obtainium"
}

function SpendObtainium(qnt) {
	obtainium -= qnt
	obtainiumDisplay.textContent = Util.display(obtainium, false) + " Obtainium"
}

function TrySpendObtainium(qnt, func) {
	if (qnt <= money) {
		SpendObtainium(qnt)
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
	CheckObtainium()
	if (Date.now()/1000 >= activeGearbox.nextUpdate) {
		RecalculateGears()
	}
}, 1000)