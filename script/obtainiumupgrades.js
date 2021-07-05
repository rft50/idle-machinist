"use strict"
let ObtainiumPrestige
let CheckObtainium
let ObtainiumUpgrades = {}
{
	function determineObtainiumReward(cash) {
		let cashOrder = Math.log10(cash)
		let baseOrder = 6 // 1,000,000
		let deltaOrder = Math.log10(1.5)

		if (cashOrder >= baseOrder) {
			cashOrder -= baseOrder
			return Math.floor(cashOrder/deltaOrder) + 1
		}
		return 0
	}

	function checkObtainium() {
		var newObtainium = determineObtainiumReward(money)
		document.getElementById("obtainium-prestige-reward").innerText = newObtainium + " Obtainium"
		if (newObtainium > 0) {
			document.getElementById("obtainium-prestige").hidden = false
		}
	}

	function obtainiumPrestige() {
		var newObtainium = determineObtainiumReward(money)
		if (newObtainium > 0) {
			gearInventory = []
			partInventory = []
			activeGearbox = {
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
			markup = 0
			

			GainObtainium(newObtainium)
			RecalculateGears()
			document.getElementById("obtainium-display").hidden = false
			document.getElementById("obtainium-tab").hidden = false
			money = 30
		}
	}

	document.getElementById("cheaper-lubrication").addEventListener("click", function() {
		if (!ObtainiumUpgrades.lubricate) {
			if (TrySpendObtainium(1)) {
				ObtainiumUpgrades.lubricate = true;
				document.getElementById("cheaper-lubrication").classList.add("purchased")
				RecalculateGear()
			}
		}
	})

	document.getElementById("persistence-boost").addEventListener("click", function() {
		if (!ObtainiumUpgrades.persistence) {
			if (TrySpendObtainium(1)) {
				ObtainiumUpgrades.persistence = true;
				document.getElementById("persistence-boost").classList.add("purchased")
			}
		}
	})

	document.getElementById("scrap-boost").addEventListener("click", function() {
		if (!ObtainiumUpgrades.scrap) {
			if (TrySpendObtainium(1)) {
				ObtainiumUpgrades.scrap = true;
				document.getElementById("scrap-boost").classList.add("purchased")
			}
		}
	})

	CheckObtainium = checkObtainium;
	ObtainiumPrestige = obtainiumPrestige;
}