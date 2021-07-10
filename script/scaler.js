"use strict"
let Scalers = {};

class Scaler {
	constructor(name, base, multiplier) {
		this.name = name;
		this.base = base;
		this.multiplier = multiplier;
		this.baseModifiers = {};
		this.multiplierModifiers = {};
		this.freeLevels = {};
	}

	setBaseModifier(id, effect) {
		if (effect === 0) {
			delete this.baseModifiers[id];
		}
		else {
			this.baseModifiers[id] = effect;
		}
	}

	setMultiplierModifiers(id, effect) {
		if (effect === 0) {
			delete this.multiplierModifiers[id];
		}
		else {
			this.multiplierModifiers[id] = effect;
		}
	}

	setFreeLevels(id, effect) {
		if (effect === 0) {
			delete this.freeLevels[id];
		}
		else {
			this.freeLevels[id] = effect;
		}
	}

	getBase() {
		let base = this.base;
		for (const mod in this.baseModifiers) {
			base *= this.baseModifiers[mod];
		}
		return base;
	}

	getMultiplier() {
		let mul = this.multiplier;
		for (const mod in this.multiplierModifiers) {
			mul += this.multiplierModifiers[mod];
		}
		return mul;
	}

	getFreeLevels() {
		let lvls = 0;
		for (const lvl in this.freeLevels) {
			lvls += this.freeLevels[lvl];
		}
		return lvls;
	}

	getCostAtLevel(level) {
		return this.getBase() * Math.pow(this.getMultiplier(), level + this.getFreeLevels());
	}
}