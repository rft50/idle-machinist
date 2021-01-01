"use strict"
let gearInventory = [
	{
		primary: materials.Oak,
		secondary: materials.Oak,
		rots: 1,
		effect: "persistent",
		lifetime: 1200
	}
]
let money = 0

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
	GainMoney(rots)
}, 1000)