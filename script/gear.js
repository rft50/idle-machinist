/**
 * @property {material} rim
 * @property {material} core
 * @property {number} baseRots
 * @property {number} polish
 * @property {[string, number]} effect
 * @property {number} maxLife
 * @property {number} life
 * @property {number} mendTime
 */
class Gear {

    // rim;
    // core;
    // baseRots;
    // polish;
    // effect;
    // maxLife;
    // life;
    // mendTime;

    /**
     * @param {?material} rim
     * @param {?material} core
     */
    constructor(rim, core) {
        if (rim == null || core == null) {
            return;
        }
        this.rim = rim;
        this.core = core;

        this.baseRots = rim.gear.speed;
        this.polish = 0;
        this.effect = core.gear.effect;
        this.maxLife = this.life = rim.gear.duration + core.gear.coreBonus;

        if (this.effect[0] === "perseverance") {
            this.maxLife *= 1 + 0.2 * this.effect[1];
        }
    }

    /**
     * @return {number}
     */
    getRots() {
        return this.baseRots * Scalers.PolishPower.getAtLevel(this.polish);
    }

    /**
     * @return {boolean}
     */
    isScappable() {
        return true;
    }

    /**
     * @return {boolean}
     */
    isPolishable() {
        return true;
    }

    /**
     * @return {boolean}
     */
    isMendable() {
        return true;
    }
}

Gear.ObtainiumGear = class extends Gear {

    constructor() {
        super(null, null);
        this.rim = this.core = {
            name: "Obtainium",
            material: "metal",
            color: [0, 200, 0]
        };
        this.maxLife = this.life = Infinity;
        this.effect = ["obtainium", 1];
    }

    getRots() {
        return Math.sqrt(Game.obtainium + 1);
    }

    isScappable() {
        return false;
    }

    isPolishable() {
        return false;
    }

    isMendable() {
        return false;
    }
};