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
	 * Base modifiers are multiplicative.
	 * Setting the modifier to 0 removes it.
	 *
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
	 * Multiplier modifiers are additive.
	 * Setting the modifier to 0 removes it.
	 *
	 * @param {string|number} id
	 * @param {number} effect
	 */
	setMultiplierModifier(id, effect) {
		if (effect === 0) {
			delete this.multiplierModifiers[id];
		}
		else {
			this.multiplierModifiers[id] = effect;
		}
	}

	/**
	 * Free levels are added to the exponent during @see getAtLevel calculation.
	 * Setting the bonus to 0 removes it.
	 *
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
	 * Computes the current effective base, accounting for all modifiers.
	 *
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
	 * Computes the current effective multiplier, accounting for all modifiers.
	 *
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
	 * Computes the current amount of bonus levels, accounting for all modifiers.
	 *
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
	 * Computes the current value of this Scaler.
	 *
	 * @param {number} level
	 */
	getAtLevel(level) {
		return this.getBase() * Math.pow(this.getMultiplier(), level + this.getFreeLevels());
	}
}