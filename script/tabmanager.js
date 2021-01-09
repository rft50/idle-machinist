"use strict";

let tabSet = [];
let activeTab = [];
let tabOpenListeners = [];
let tabCloseListeners = [];

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
		activeTab[i] = 0;
		tabOpenListeners[i] = [];
		tabCloseListeners[i] = [];
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
	let opens = tabOpenListeners[tabGroup];
	let closes = tabCloseListeners[tabGroup];

	for (let i = 0; i < closes.length; i++) {
		if (closes[i][1] == activeTab[tabGroup]) {
			closes[i][0]()
		}
	}
	for (let i = 0; i < tabs.length; i++) {
		tabs[i].hidden = i != tabId; // hides all tabs, aside from the selected one
	}
	activeTab[tabGroup] = tabId
	for (let i = 0; i < opens.length; i++) {
		if (opens[i][1] == tabId) {
			opens[i][0]()
		}
	}
}

// define adding and removing tab change listeners

function AddTabOpenedListener(listener, tabSetId, tabId) {
	tabOpenListeners[tabSetId].push([listener, tabId]);
}

function RemoveTabOpenedListener(listener, tabSetId) {
	for (let i = 0; i < tabOpenListeners[tabSetId].length; i++) {
		if (tabOpenListeners[tabSetId][0] === listener) {
			tabOpenListeners[tabSetId].splice(i, 1)
			return;
		}
	}
	return;
}

function AddTabClosedListener(listener, tabSetId, tabId) {
	tabCloseListeners[tabSetId].push([listener, tabId]);
}

function RemoveTabClosedListener(listener, tabSetId) {
	for (let i = 0; i < tabCloseListeners[tabSetId].length; i++) {
		if (tabCloseListeners[tabSetId][0] === listener) {
			tabCloseListeners[tabSetId].splice(i, 1)
			return;
		}
	}
	return;
}