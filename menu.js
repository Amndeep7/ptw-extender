/* eslint no-console: "off" */

let menuId = null;
browser.runtime.onInstalled.addListener(() => {
	menuId = browser.contextMenus.create({
		"id": "ptw",
		"title": "Add to MAL PTW list",
		"contexts": ["link"],
	});
});

const Sites = Object.freeze({ "mal": Symbol("mal") });

const validateAndMineURL = (url) => {
	// eslint-disable-next-line no-undef
	const matchMAL = matchOnMAL(url);
	if (matchMAL) {
		matchMAL.source = Sites.mal;
		return matchMAL;
	}
	return false;
};

browser.contextMenus.onClicked.addListener((info, tab) => {
	console.log("hello");
	if (info.menuItemId === menuId) {
		console.log(`Link URL: ${info.linkUrl}`);
		console.log(`Tab URL: ${tab.url}`);
		const urlData = validateAndMineURL(info.linkUrl);
		if (urlData.source === Sites.mal) {
			// eslint-disable-next-line no-undef
			handleMAL(tab, urlData);
		} else {
			console.log("Match fail");
		}
		console.log("world");
	}
});
