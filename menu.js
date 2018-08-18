/* eslint no-console: "off" */

const menuId = "ptw";
console.log("removing context menus");
const remove = browser.contextMenus.removeAll();
remove.then(() => {
	console.log("creating context menu");
	browser.contextMenus.create({
		"id": menuId,
		"title": "Add to MAL PTW list",
		"contexts": ["link"],
	});
}).catch((e) => {
	console.log("error while deleting context menus", e);
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

const createNotification = (notification) => {
	browser.notifications.create({
		"type": "basic",
		"iconUrl": browser.extension.getURL("./icons/icon_48.png"),
		"title": notification.title,
		"message": notification.message,
	});
};

browser.contextMenus.onClicked.addListener(async (info, tab) => {
	console.log("hello");
	if (info.menuItemId === menuId) {
		console.log(`Link URL: ${info.linkUrl}`);
		console.log(`Tab URL: ${tab.url}`);
		const urlData = validateAndMineURL(info.linkUrl);
		if (urlData.source === Sites.mal) {
			// eslint-disable-next-line no-undef
			createNotification(await handleMAL(tab, urlData));
		} else {
			console.log("Match fail");
		}
		console.log("world");
	}
});
