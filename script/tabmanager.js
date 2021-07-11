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


class TabListener {
	constructor(payload, tabSetId, tabId) {
		this.payload = payload
		this.tabSetId = tabSetId
		this.tabId = tabId
	}
}


// define the listener

function SwitchTab(tabSetId, newTabId) {
	let tabs = tabSet[tabSetId];
	let currentTabId = activeTab[tabSetId];

	let triggeredCloseListeners = tabCloseListeners
		.filter(l => l.tabSetId == tabSetId)
		.filter(l => l.tabId == currentTabId)
	for (const tabListener of triggeredCloseListeners) {
		tabListener.payload();
	}

	for (let i = 0; i < tabs.length; i++) {
		tabs[i].hidden = i != newTabId; // hides all tabs, aside from the selected one
	}
	activeTab[tabSetId] = newTabId

	let triggeredOpenListeners = tabOpenListeners
		.filter(l => l.tabSetId == tabSetId)
		.filter(l => l.tabId == newTabId)
	for (const tabListener of triggeredOpenListeners) {
		tabListener.payload();
	}
}

// define adding and removing tab change listeners


function AddTabOpenedListener(payload, tabSetId, tabId) {
	tabOpenListeners.push(new TabListener(payload, tabSetId, tabId))
}

function RemoveTabOpenedListener(payload, tabSetId) {
	tabOpenListeners.splice(a.findIndex(l => l.payload === payload && l.tabSetId == tabSetId), 1)
}

function AddTabClosedListener(payload, tabSetId, tabId) {
	tabCloseListeners.push(new TabListener(payload, tabSetId, tabId))
}

function RemoveTabClosedListener(payload, tabSetId) {
	tabCloseListeners.splice(a.findIndex(l => l.payload === payload && l.tabSetId == tabSetId), 1)
}