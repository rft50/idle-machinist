/** @namespace Obtainium */
let Obtainium = {};

Obtainium.upgrades = {};
{
	/**
	 * Determines the amount of obtainium that should be obtained from a given amount of cash.
	 *
	 * @private
	 * @param {number} cash - cash to calculate with
	 * @return {number}
	 */
	const determineObtainiumReward = cash => {
		let cashOrder = Math.log10(cash);
		let baseOrder = 6; // 1,000,000
		let deltaOrder = Math.log10(1.5);

		if (cashOrder >= baseOrder) {
			cashOrder -= baseOrder;
			return Math.floor(cashOrder/deltaOrder) + 1;
		}
		return 0;
	};

	/**
	 * Updates and displays current obtainium prestige reward.
	 *
	 * @memberOf Obtainium
	 */
	Obtainium.checkObtainium = () => {
		let newObtainium = determineObtainiumReward(Game.money);
		document.getElementById("obtainium-prestige-reward").innerText = newObtainium + " Obtainium";
		if (newObtainium > 0) {
			document.getElementById("obtainium-prestige").hidden = false;
		}
	};

	/**
	 * Reset Machine Shop and Crafting Room content for Obtainium
	 *
	 * @memberOf Obtainium
	 */
	Obtainium.prestige = () => {
		let newObtainium = determineObtainiumReward(Game.money);
		if (newObtainium > 0) {
			Game.gearInventory = [];
			Game.partInventory = [];
			Game.activeGearbox = {
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
			};
			Game.markup = 0;

			CraftingRoom.menderGear = [];

			Game.gainObtainium(newObtainium);
			MachineShop.tickGears();
			document.getElementById("obtainium-display").hidden = false;
			document.getElementById("obtainium-tab").hidden = false;
			document.getElementById("obtainium-tab").click();
			Game.money = 30;
		}
	};

	document.getElementById("cheaper-lubrication").addEventListener("click", function() {
		if (!Obtainium.upgrades.lubricate) {
			if (Game.trySpendObtainium(1)) {
				Obtainium.upgrades.lubricate = true;
				Scalers.LubeCost.setBaseModifier("cheaper-lubrication", 0.5);
				document.getElementById("cheaper-lubrication").classList.add("purchased");
				MachineShop.tickGears();
			}
		}
	});

	document.getElementById("persistence-boost").addEventListener("click", function() {
		if (!Obtainium.upgrades.persistence) {
			if (Game.trySpendObtainium(1)) {
				Obtainium.upgrades.persistence = true;
				document.getElementById("persistence-boost").classList.add("purchased");
			}
		}
	});

	document.getElementById("scrap-boost").addEventListener("click", function() {
		if (!Obtainium.upgrades.scrap) {
			if (Game.trySpendObtainium(1)) {
				Obtainium.upgrades.scrap = true;
				document.getElementById("scrap-boost").classList.add("purchased");
			}
		}
	});

	document.getElementById("wood-haggling").addEventListener("click", function() {
		if (!Obtainium.upgrades.woodHaggling) {
			if (Game.trySpendObtainium(5)) {
				Obtainium.upgrades.woodHaggling = true;
				document.getElementById("wood-haggling").classList.add("purchased");
			}
		}
	});

	document.getElementById("obtainium-markup").addEventListener("click", function() {
		if (!Obtainium.upgrades.markup) {
			if (Game.trySpendObtainium(15)) {
				Obtainium.upgrades.markup = true;
				Scalers.MarkupCost.setMultiplierModifier("obtainiumMarkup", -1);
				document.getElementById("obtainium-markup").classList.add("purchased");
			}
		}
	});

	document.getElementById("mending-machine-unlock").addEventListener("click", function() {
		if (!Obtainium.upgrades.menderUnlock) {
			if (Game.trySpendObtainium(30)) {
				Obtainium.upgrades.menderUnlock = true;
				document.getElementById("mending-machine-button").hidden = false;
				document.getElementById("mending-machine-unlock").classList.add("purchased");
			}
		}
	});
}