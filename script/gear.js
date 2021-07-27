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
     * @param {material} rim
     * @param {material} core
     */
    constructor(rim, core) {
        this.rim = rim;
        this.core = core;

        this.baseRots = rim.gear.speed;
        this.polish = 0;
        this.effect = core.gear.effect;
        this.maxLife = this.life = rim.gear.duration + core.gear.coreBonus;
    }

    /**
     * @return {number}
     */
    getRots() {
        return this.baseRots * Scalers.PolishPower.getAtLevel(this.polish);
    }
}