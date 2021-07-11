
let Scalers = {};

class Scaler {
	/**
	 * @param {string} name
	 * @param {number} base
	 * @param {number} multiplier
	 */
	constructor(name, base, multiplier) {
		this.name = name;
		this.base = base;
		this.multiplier = multiplier;
		this.baseModifiers = {};
		this.multiplierModifiers = {};
		this.freeLevels = {};
	}

	/**
	 * @param {string|number} id
	 * @param {number} effect
	 */
	setBaseModifier(id, effect) {
		if (effect === 0) {
			delete this.baseModifiers[id];
		}
		else {
			this.baseModifiers[id] = effect;
		}
	}

	/**
	 * @param {string|number} id
	 * @param {number} effect
	 */
	setMultiplierModifiers(id, effect) {
		if (effect === 0) {
			delete this.multiplierModifiers[id];
		}
		else {
			this.multiplierModifiers[id] = effect;
		}
	}

	/**
	 * @param {string|number} id
	 * @param {number} effect
	 */
	setFreeLevels(id, effect) {
		if (effect === 0) {
			delete this.freeLevels[id];
		}
		else {
			this.freeLevels[id] = effect;
		}
	}

	/**
	 * @return {number}
	 */
	getBase() {
		let base = this.base;
		for (const mod in this.baseModifiers) {
			base *= this.baseModifiers[mod];
		}
		return base;
	}

	/**
	 * @return {number}
	 */
	getMultiplier() {
		let mul = this.multiplier;
		for (const mod in this.multiplierModifiers) {
			mul += this.multiplierModifiers[mod];
		}
		return mul;
	}

	/**
	 * @return {number}
	 */
	getFreeLevels() {
		let lvls = 0;
		for (const lvl in this.freeLevels) {
			lvls += this.freeLevels[lvl];
		}
		return lvls;
	}

	/**
	 * @param {number} level
	 */
	getAtLevel(level) {
		return this.getBase() * Math.pow(this.getMultiplier(), level + this.getFreeLevels());
	}
}