let Game = {};

// inventories
Game.gearInventory = [
	{
		primary: materials.Oak,
		secondary: materials.Oak,
		rots: 1,
		effect: ["persistent", 1],
		lifetime: 1200
	}
];
Game.partInventory = [
	{
		type: "raw",
		material: materials.Oak
	}
];
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
	let rots = Game.activeGearbox.rots;
	let cashMul = 1 + Game.markup / 4;
	Game.gainMoney(rots * cashMul);
	Obtainium.checkObtainium();
	if (Date.now()/1000 >= Game.activeGearbox.nextUpdate) {
		MachineShop.recalculateGears();
	}
}, 1000);