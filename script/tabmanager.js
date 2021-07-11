let TabManager = {};

TabManager.tabSet = [];
TabManager.activeTab = [];
TabManager.tabOpenListeners = [];
TabManager.tabCloseListeners = [];

// discovery

{
	let i = 0;
	let j = 0;
	let elem;
	while (true) {
		if (document.getElementById(`Tab${i}_0`) == null) { // keep searching until a tab set does not exist
			break;
		}

		TabManager.tabSet[i] = [];
		TabManager.activeTab[i] = 0;
		j = 0;
		while (true) {
			elem = document.getElementById(`Tab${i}_${j}`);
			if (elem == null) { // stop hunting when you don't see a new tab to put in the list
				break;
			}
			TabManager.tabSet[i][j] = elem;

			j++; // keep hunting for tabs in a group
		}

		i++; // keep hunting for tab groups
	}
}

// hide all but the firsts

for (let i = 0; i < TabManager.tabSet.length; i++) {
	for (let j = 0; j < TabManager.tabSet[i].length; j++) {
		TabManager.tabSet[i][j].hidden = j !== 0;
	}
}

// define the listener

class TabListener {
	constructor(payload, tabSetId, tabId) {
		this.payload = payload;
		this.tabSetId = tabSetId;
		this.tabId = tabId;
	}
}

/**
 * @param {number} tabSetId
 * @param {number} newTabId
 */
TabManager.switchTab = function(tabSetId, newTabId) {
	let tabs = TabManager.tabSet[tabSetId];
	let currentTabId = TabManager.activeTab[tabSetId];

	TabManager.tabCloseListeners
		.filter(l => l.tabSetId === tabSetId)
		.filter(l => l.tabId === currentTabId)
		.forEach(l => l.payload());

	for (let i = 0; i < tabs.length; i++) {
		tabs[i].hidden = i !== newTabId; // hides all tabs, aside from the selected one
	}
	TabManager.activeTab[tabSetId] = newTabId;

	TabManager.tabOpenListeners
		.filter(l => l.tabSetId === tabSetId)
		.filter(l => l.tabId === newTabId)
		.forEach(l => l.payload());
};

// define adding and removing tab change listeners

/**
 * @param {function() : void} payload
 * @param {number} tabSetId
 * @param {number} tabId
 */
TabManager.addTabOpenedListener = function(payload, tabSetId, tabId) {
	TabManager.tabOpenListeners.push(new TabListener(payload, tabSetId, tabId));
};

/**
 * @param {function() : void} payload
 * @param {number} tabSetId
 */
TabManager.removeTabOpenedListener = function(payload, tabSetId) {
	TabManager.tabOpenListeners.splice(TabManager.tabOpenListeners.findIndex(l => l.payload === payload && l.tabSetId === tabSetId), 1);
};

/**
 * @param {function() : void} payload
 * @param {number} tabSetId
 * @param {number} tabId
 */
TabManager.addTabClosedListener = function(payload, tabSetId, tabId) {
	TabManager.tabCloseListeners.push(new TabListener(payload, tabSetId, tabId));
};

/**
 * @param {function() : void} payload
 * @param {number} tabSetId
 */
TabManager.removeTabClosedListener = function(payload, tabSetId) {
	TabManager.tabCloseListeners.splice(TabManager.tabCloseListeners.findIndex(l => l.payload === payload && l.tabSetId === tabSetId), 1);
};