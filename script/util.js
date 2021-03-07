"use strict"
var Util = {}
Util.displayMode = "Normal"

// 5 -> 005
// turn any number into a string of the specified length, padding with 0s on the left
Util.puff = function(num, pf) {
	var str = "" + num
	while (str.length < pf) {
		str = "0" + str
	}
	return str
}

// 1234.5 -> 1,234.50
// commas every third number, two decimal places if dec is true
Util.display = function(num, dec) {
	switch (Util.displayMode) {
		case "Normal":
		{
			var str = ""
			var x = Math.floor(num)
			while (x >= 1) {
				if (Math.abs(x - num) > 1)
				{
					str = "," + str
				}
				if (x >= 1000) {
					str = Util.puff(x % 1000, 3) + str
				}
				else {
					str = (x % 1000) + str
				}
				x = Math.floor(x / 1000)
			}
			if (str == "") {
				str = "0"
			}
			if (dec) {
				str += "." + Util.puff(Math.floor((num % 1) * 100), 2)
			}
			return str
		}
	}
	return num // just in case
}

// roman numerals!
// currently only goes up to 5 because it is hardcoded
Util.roman = function(x) {
	return ["I", "II", "III", "IV", "V"][x-1]
}

// 330 -> 3m 30s
// turn times into d h m s
Util.lifetime = function(t) {
	if (t == 0)
	{
		return "0s"
	}
	var neg = false
	if (t < 0) {
		t = -t
		neg = true
	}
	var str = []
	if (t >= 86400) // days
	{
		str.push(Math.floor(t / 86400) + "d")
		t %= 86400
	}
	if (t >= 3600) // hours
	{
		str.push(Math.floor(t / 3600) + "h")
		t %= 3600
	}
	if (t >= 60) // minutes
	{
		str.push(Math.floor(t / 60) + "m")
		t %= 60
	}
	if (t > 0) // seconds
	{
		str.push(t + "s")
	}
	return (neg ? "-" : "") + str.join(" ")
}