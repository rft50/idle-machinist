/* global Options: true */
let Game = {};

// inventories
Game.gearInventory = [];
Game.partInventory = [];
Game.money = 0;
Game.obtainium = 0;

// gamestate
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

// gameplay
{
	let moneyDisplay = document.getElementById("money");
	let obtainiumDisplay = document.getElementById("obtainium");

	/**
	 * @param {number} qnt
	 */
	Game.gainMoney = qnt => {
		Game.money += qnt;
		moneyDisplay.textContent = "$" + Util.display(Game.money, true);
	};

	/**
	 * @param {number} qnt
	 */
	Game.spendMoney = qnt => {
		Game.money -= qnt;
		moneyDisplay.textContent = "$" + Util.display(Game.money, true);
	};

	/**
	 * @param {number} qnt
	 * @param {function} [func]
	 * @return {boolean}
	 */
	Game.trySpendMoney = (qnt, func) => {
		if (qnt <= Game.money) {
			Game.spendMoney(qnt);
			if (func != null) {
				func();
			}
			return true;
		}
		return false;
	};

	/**
	 * @param {number} qnt
	 */
	Game.gainObtainium = qnt => {
		Game.obtainium += qnt;
		obtainiumDisplay.textContent = Util.display(Game.obtainium, false) + " Obtainium";
	};

	/**
	 * @param {number} qnt
	 */
	Game.spendObtainium = qnt => {
		Game.obtainium -= qnt;
		obtainiumDisplay.textContent = Util.display(Game.obtainium, false) + " Obtainium";
	};

	/**
	 * @param {number} qnt
	 * @param {function} [func]
	 * @return {boolean}
	 */
	Game.trySpendObtainium = (qnt, func) => {
		if (qnt <= Game.obtainium) {
			Game.spendObtainium(qnt);
			if (func != null) {
				func();
			}
			return true;
		}
		return false;
	};
}

window.setInterval(function() {
	let rots = MachineShop.tickGears(true) || 0;
	if (Game.crank) {
		rots++;
	}
	let cashMul = 1 + Game.markup / 4;
	Game.gainMoney(rots * cashMul);
	Obtainium.checkObtainium();
	CraftingRoom.tickMender();
}, 1000);

window.setInterval(function() {
	Game.rotation = (Game.rotation + 1) % 60 || 0;
	if (!Options.gearSpin) {
		Game.rotation = 0;
	}
	let gears = document.getElementById("machine-content").children;
	for (let i = 0; i < gears.length; i++) {
		if (gears[i].tagName !== "IMG") {
			gears[i].children[0].setAttribute("transform", `rotate(${Game.rotation*6})`);
		}
	}
}, 100);