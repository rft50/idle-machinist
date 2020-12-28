"use strict";

let tabSet = [];

// discovery

{
	let i = 0;
	let j = 0;
	let elem;
	while (true) {
		if (document.getElementById(`Tab${i}_0`) == null) { // keep searching until a tab set does not exist
			break;
		}

		tabSet[i] = [];
		j = 0;
		while (true) {
			elem = document.getElementById(`Tab${i}_${j}`);
			if (elem == null) { // stop hunting when you don't see a new tab to put in the list
				break;
			}
			tabSet[i][j] = elem;

			j++; // keep hunting for tabs in a group
		}

		i++; // keep hunting for tab groups
	}
}

// hide all but the firsts

for (var i = 0; i < tabSet.length; i++) {
	for (var j = 0; j < tabSet[i].length; j++) {
		tabSet[i][j].hidden = j != 0;
	}
}

// define the listener

function SwitchTab(tabGroup, tabId) {
	let tabs = tabSet[tabGroup];

	for (let i = 0; i < tabs.length; i++) {
		tabs[i].hidden = i != tabId; // hides all tabs, aside from the selected one
	}
}