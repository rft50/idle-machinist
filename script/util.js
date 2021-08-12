/** @namespace Util */
let Util = {};

/**
 * Left-pad a number with zeroes until the string is the desired length.
 *
 * 5 -> 005
 *
 * @memberOf Util
 * @param {number} num
 * @param {number} pf
 * @return {string}
 */
Util.puff = function(num, pf) {
	return num.padStart(pf, "0");
};

/**
 * Format a string with commas.
 *
 * 1234.5 -> 1,234.50
 *
 * @memberOf Util
 * @param {number} num
 * @param {boolean} dec=false - if decimals are wanted or not
 * @return {string}
 */
Util.display = function(num, dec = false) {
	return num.toLocaleString('en-US', {minimumFractionDigits: dec ? 2 : 0});
};

/**
 * Convert a number to roman numerals.
 *
 * Currently only implemented to go to 5.
 *
 * @memberOf Util
 * @param {number} x
 * @return {string}
 */
Util.roman = function(x) {
	return ["I", "II", "III", "IV", "V"][x-1];
};

/**
 * Converts a time into a "d h m s" format.
 *
 * 86400 -> 1d
 * 3600 -> 1h
 * 60 -> 1m
 * 1 -> 1s
 *
 * @memberOf Util
 * @param {number} t
 * @return {string}
 */
Util.toTime = function(t) {
	t = Math.floor(t);
	if (t === 0) {
		return "0s";
	}
	else if (!isFinite(t)) {
		return "Forever";
	}
	let neg = false;
	if (t < 0) {
		t = -t;
		neg = true;
	}
	let str = [];
	if (t >= 86400) // days
	{
		str.push(Math.floor(t / 86400) + "d");
		t %= 86400;
	}
	if (t >= 3600) // hours
	{
		str.push(Math.floor(t / 3600) + "h");
		t %= 3600;
	}
	if (t >= 60) // minutes
	{
		str.push(Math.floor(t / 60) + "m");
		t %= 60;
	}
	if (t > 0) // seconds
	{
		str.push(t + "s");
	}
	return (neg ? "-" : "") + str.join(" ");
};

/**
 * Encapsulate an object with a tooltip.
 * It should be noted using this method will not return the original Element, if it is given text.
 * It will, however, .contains() it.
 *
 * @memberOf Util
 * @param {Element} obj
 * @param {string} text
 * @return {HTMLElement}
 */
Util.tip = function(obj, text) {
	if (text == null) {
		return obj;
	}
	const div = document.createElement("div");
	div.classList.add("tooltip");
	const tip = document.createElement("span");
	tip.classList.add("tooltiptext");
	tip.innerHTML = text;
	div.appendChild(obj);
	div.appendChild(tip);
	return div;
};

/**
 * Encapsulate an object with a tooltip that updates on hover.
 *
 * @memberOf Util
 * @param {Element} obj
 * @param {Gear} data
 * @param {function(Gear) : string} func
 * @return {HTMLElement}
 */
Util.liveTip = function(obj, data, func) {
	if (func == null) {
		return obj;
	}
	const div = document.createElement("div");
	div.classList.add("tooltip");
	const tip = document.createElement("span");
	tip.classList.add("tooltiptext");
	obj.addEventListener("mouseover", function() {
		tip.innerHTML = func(data);
	});
	tip.innerHTML = func(data);
	div.appendChild(obj);
	div.appendChild(tip);
	return div;
};