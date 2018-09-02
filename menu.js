/* eslint no-console: "off" */

const menuId = "ptw";
console.log("removing context menus");
browser.contextMenus.removeAll().then(() => {
	console.log("creating context menu");
	browser.contextMenus.create({
		"id": menuId,
		"title": "Add to MAL PTW list",
		"contexts": ["link"],
	});
}).catch((e) => {
	console.log("error while deleting context menus", e);
	throw e;
}).then(async () => {
	let optionsWithVersioning = {};
	const optionsVersion = "v1";
	let options = {};
	try {
		await browser.storage.sync.get().then((o) => {
			optionsWithVersioning = o;
			options = optionsWithVersioning[optionsVersion];
		});
	} catch (e) {
		console.log("error while getting options", e);
		throw e;
	}

	browser.storage.onChanged.addListener((changes, _areaName) => {
		console.log("option was changed", changes);
		Object.entries(changes).forEach((change) => {
			optionsWithVersioning[change[0]] = change[1].newValue;
		});
		options = optionsWithVersioning[optionsVersion];
	});

	const Sites = Object.freeze({ "mal": Symbol("MyAnimeList") });

	const validateAndMineURL = (url, notIgnoring) => {
		const matchFuncs = {
			"mal": matchOnMAL, // eslint-disable-line no-undef
		};

		// eslint-disable-next-line no-restricted-syntax
		for (const site of Object.keys(matchFuncs)) {
			const match = matchFuncs[site](url);
			if (match) {
				match.source = Sites[site];
				match.notIgnoring = notIgnoring[site];
				return match;
			}
		}

		return false;
	};

	const createNotification = (notification) => {
		if (options.checkbox.extension_displayNotifications) {
			browser.notifications.create({
				"type": "basic",
				"iconUrl": browser.extension.getURL("./icons/icon_48.png"),
				"title": notification.title,
				"message": notification.message,
			});
		}
	};

	browser.contextMenus.onClicked.addListener(async (info, tab) => {
		console.log("hello");
		if (info.menuItemId === menuId) {
			console.log(`Link URL: ${info.linkUrl}`);
			console.log(`Tab URL: ${tab.url}`);
			const notIgnoring = {
				"mal": options.checkbox.mal_mal,
			};
			const urlData = validateAndMineURL(info.linkUrl, notIgnoring);
			if (urlData && !urlData.notIgnoring) {
				console.log("Match ignored");
				createNotification({
					"title": "Ignoring list site",
					"message": `PTW Extender is currently set to ignore ${urlData.source.toString().slice(7, -1)}`,
				}, options.checkbox.extension_displayNotifications);
			} else if (urlData && urlData.source === Sites.mal) {
				// eslint-disable-next-line no-undef
				createNotification(await handleMAL(tab, urlData,
					{ "prettifyCommentsBox": options.checkbox.extension_prettifyCommentsBox }));
			} else {
				console.log("Match fail");
				createNotification({
					"title": "Unknown list site",
					"message": "PTW Extender isn't compatible with that site",
				});
			}
			console.log("world");
		}
	});
});
