"use strict"

{
	let inv = document.getElementById("machine-inv")
	let content = document.getElementById("machine-content")
	let upgrades = document.getElementById("machine-upgrades")

	let rotDisplay = document.getElementById("machine-rots")
	let lubeDisplay = document.getElementById("machine-lubricate")
	let lubeButton = document.getElementById("machine-lubricate-button")
	let carveDisplay = document.getElementById("machine-carve")
	let carveButton = document.getElementById("machine-carve-button")

	let trim = function(num) {
		return Number.parseFloat(num).toFixed(2)
	}

	let recalculate = function() {
		let rots = 0
		for (let gear of activeGearbox.gears) {
			rots += gear.rots
		}

		let lubeMul = Math.pow(1.1, activeGearbox.upgrades.lubricate)
		rots *= lubeMul

		activeGearbox.rots = rots
		rotDisplay.textContent = `This gearbox is producing ${trim(rots)} rot/s, worth $${trim(rots)} total`
		lubeDisplay.textContent = `This gearbox has been lubricated ${activeGearbox.upgrades.lubricate} times, so its production is multiplied by ${trim(lubeMul)}`
		lubeButton.textContent = `Lubricate ($${trim(100*Math.pow(1.5, activeGearbox.upgrades.lubricate))}, 1.1x)`
		
	}

	let equipGear = function(event) {
		let idx = -1
		for (let i = 0; i < inv.childElementCount; i++) {
			if (inv.children[i] == event.currentTarget) {
				idx = i
				break
			}
		}
		let gear = gearInventory.splice(idx, 1)[0]
		activeGearbox.gears.push(gear)
		refreshGears()
		recalculate()
	}

	let wipeGears = function() {
		while (inv.hasChildNodes()) {
			inv.removeChild(inv.childNodes[0]);
		}
		while (content.hasChildNodes()) {
			content.removeChild(content.childNodes[0]);
		}
	}

	let refreshGears = function() {
		wipeGears()
		let id = 1;
		let addEquip = activeGearbox.gears.length < activeGearbox.baseMax
		for (let gear of gearInventory) {
			let render = GenerateGear(gear.primary, gear.secondary, id)
			if (addEquip) {
				render.addEventListener("click", equipGear)
			}
			inv.appendChild(render)
			id++
		}
		for (let i = 0; i < activeGearbox.baseMax; i++) {
			let render
			if (activeGearbox.gears[i] != null) {
				render = GenerateGear(activeGearbox.gears[i].primary, activeGearbox.gears[i].secondary, id)
				id++
			} else {
				render = document.createElement("img")
				render.setAttribute("src", "fakegear.svg")
			}
			content.appendChild(render)
		}
	}

	lubeButton.addEventListener("click", function() {
		let cost = Math.pow(1.5, activeGearbox.upgrades.lubricate) * 100
		if (TrySpendMoney(cost)) {
			activeGearbox.upgrades.lubricate++
			recalculate()
		}
	})

	AddTabOpenedListener(refreshGears, 0, 2)
	AddTabClosedListener(wipeGears, 0, 2)
}