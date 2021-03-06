let Util = {};

// 5 -> 005
// turn any number into a string of the specified length, padding with 0s on the left
/**
 * @param {number} num
 * @param {number} pf
 * @return {string}
 */
Util.puff = function(num, pf) {
	return num.padStart(pf, "0");
};

// 1234.5 -> 1,234.50
// commas every third number, two decimal places if dec is true
/**
 *
 * @param num
 * @param dec
 * @return {string}
 */
Util.display = function(num, dec) {
	return num.toLocaleString('en-US', {minimumFractionDigits: dec ? 2 : 0});
};

// roman numerals!
// currently only goes up to 5 because it is hardcoded
/**
 * @param {number} x
 * @return {string}
 */
Util.roman = function(x) {
	return ["I", "II", "III", "IV", "V"][x-1];
};

// 330 -> 3m 30s
// turn times into d h m s
/**
 * @param {number} t
 * @return {string}
 */
Util.lifetime = function(t) {
	if (t === 0)
	{
		return "0s";
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