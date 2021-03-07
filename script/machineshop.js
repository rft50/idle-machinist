"use strict"

let RecalculateGears
{
	let inv = document.getElementById("machine-inv")
	let content = document.getElementById("machine-content")
	let upgrades = document.getElementById("machine-upgrades")

	let globRotDisplay = document.getElementById("machine-global-rots")
	let globMarkupDisplay = document.getElementById("machine-global-markup")
	let globMarkupButton = document.getElementById("machine-global-markup-button")

	let rotDisplay = document.getElementById("machine-rots")
	let lubeDisplay = document.getElementById("machine-lubricate")
	let lubeButton = document.getElementById("machine-lubricate-button")
	let carveDisplay = document.getElementById("machine-carve")
	let carveButton = document.getElementById("machine-carve-button")

	let trim = function(num) {
		return Util.display(num, true)
	}

	let markupVal = function() {
		return 1 + markup * 0.25
	}

	let gearCap = function() {
		return activeGearbox.baseMax + activeGearbox.upgrades.carve
	}

	let now = function() {
		return Math.floor(Date.now()/1000)
	}

	let recalculateGlobal = function() {
		let rots = 0
		// replace this with a loop iterating over all gearboxes at some point
		rots = activeGearbox.rots

		globRotDisplay.textContent = `You are producing a total of ${trim(rots)} rot/s, worth $${trim(rots*markupVal())} total`
		globMarkupDisplay.textContent = `You have marked up the value of rots ${markup} times, so they are worth $${markupVal()} each`
		globMarkupButton.textContent = `Markup ($${trim(1000*Math.pow(10, markup))}, +0.25 $/rot)`
	}

	let recalculate = function() {
		let rots = 0
		let nw = now()
		let nextUpdate = Infinity
		for (let gear of activeGearbox.gears) {
			gear.lifetime = Math.max(gear.placed + gear.lifetime - nw, 0)
			gear.placed = nw
			if (gear.lifetime > 0) {
				rots += gear.rots
				if (gear.lifetime + nw < nextUpdate) {
					nextUpdate = gear.lifetime + nw
				}
			}
			else {
				if (gear.effect[0] == "persistent") {
					rots += gear.rots * gear.effect[1]/10
				}
			}
		}

		let lubeMul = Math.pow(1.1, activeGearbox.upgrades.lubricate)
		rots *= lubeMul

		activeGearbox.rots = rots
		activeGearbox.nextUpdate = nextUpdate
		rotDisplay.textContent = `This gearbox is producing ${trim(rots)} rot/s, worth $${trim(rots*markupVal())} total`
		lubeDisplay.textContent = `This gearbox has been lubricated ${activeGearbox.upgrades.lubricate} times, so its production is multiplied by ${trim(lubeMul)}`
		lubeButton.textContent = `Lubricate ($${trim(100*Math.pow(1.5, activeGearbox.upgrades.lubricate))}, 1.1x)`
		carveDisplay.textContent = `This gearbox has been carved ${activeGearbox.upgrades.carve} times, so it can hold ${activeGearbox.baseMax+activeGearbox.upgrades.carve} gears`
		carveButton.textContent = `Carve ($${trim(1000*Math.pow(5, activeGearbox.upgrades.carve))}, +1 gear)`
		
		carveButton.disabled = activeGearbox.baseMax * 2 == gearCap()

		recalculateGlobal()
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
		gear.placed = now()
		activeGearbox.gears.push(gear)
		refreshGears()
		recalculate()
	}

	let unequipGearGenerator = function(id) {
		return function() {
			let gear = activeGearbox.gears.splice(id, 1)[0];
			gear.lifetime = Math.max(gear.placed + gear.lifetime - now(), 0)
			delete gear.placed
			gearInventory.push(gear);
			refreshGears();
			recalculate();
		}
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
		let addEquip = activeGearbox.gears.length < gearCap()
		for (let gear of gearInventory) {
			let render = RenderGear(gear, id)
			if (addEquip) {
				render.addEventListener("click", equipGear)
			}
			inv.appendChild(render)
			id++
		}
		for (let i = 0; i < gearCap(); i++) {
			let render
			if (activeGearbox.gears[i] != null) {
				render = RenderGear(activeGearbox.gears[i], id)
				render.addEventListener("click", unequipGearGenerator(i));
				id++
			} else {
				render = document.createElement("img")
				render.setAttribute("src", "fakegear.svg")
			}
			content.appendChild(render)
		}
	}

	// button code
	globMarkupButton.addEventListener("click", function() {
		let cost = Math.pow(10, markup) * 1000
		if (TrySpendMoney(cost)) {
			markup++
			recalculate()
		}
	})

	lubeButton.addEventListener("click", function() {
		let cost = Math.pow(1.5, activeGearbox.upgrades.lubricate) * 100
		if (TrySpendMoney(cost)) {
			activeGearbox.upgrades.lubricate++
			recalculate()
		}
	})

	carveButton.addEventListener("click", function() {
		let cost = Math.pow(5, activeGearbox.upgrades.carve) * 1000
		let gearCount = gearCap()
		let limit = activeGearbox.baseMax * 2
		if (gearCount < limit && TrySpendMoney(cost))
		{
			activeGearbox.upgrades.carve++
			recalculate()
			refreshGears()
		}
	})

	AddTabOpenedListener(refreshGears, 0, 2)
	AddTabClosedListener(wipeGears, 0, 2)

	RecalculateGears = function() {
		recalculate()
		if (activeTab[0] == 2) {
			refreshGears()
		}
	}
}