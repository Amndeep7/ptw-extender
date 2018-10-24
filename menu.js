/* eslint no-console: "off" */

const menuId = "ptw";
console.log("removing context menus");
browser.contextMenus.removeAll()
	.catch((e) => {
		console.log("error while deleting context menus", e);
		throw e;
	})
	.then(() => {
		console.log("creating context menu");
		browser.contextMenus.create({
			"id": menuId,
			"title": "Add to PTW list",
			"contexts": ["link"],
		});
	})
	.then(async () => {
		const intervalId = setInterval(async () => {
			// eslint-disable-next-line no-undef
			if (optionsLock) {
				return;
			}
			clearInterval(intervalId);

			let optionsWithVersioning = {};
			let options = {};
			try {
				// eslint-disable-next-line no-undef
				optionsWithVersioning = await browser.storage.sync.get();
				// eslint-disable-next-line no-undef
				options = optionsWithVersioning[optionsVersion];
			} catch (e) {
				console.log("error while getting options", e);
				throw e;
			}

			let optionsWithVersioningLocal = {};
			let optionsLocal = {};
			try {
				// eslint-disable-next-line no-undef
				optionsWithVersioningLocal = await browser.storage.local.get();
				// eslint-disable-next-line no-undef
				optionsLocal = optionsWithVersioningLocal[optionsVersion];
			} catch (e) {
				console.log("error while getting options", e);
				throw e;
			}

			browser.storage.onChanged.addListener((changes, areaName) => {
				console.log("option was changed", changes);
				switch (areaName) {
				case "sync":
					Object.entries(changes).forEach((change) => {
						optionsWithVersioning[change[0]] = change[1].newValue;
					});
					// eslint-disable-next-line no-undef
					options = optionsWithVersioning[optionsVersion];
					break;
				case "local":
					Object.entries(changes).forEach((change) => {
						optionsWithVersioningLocal[change[0]] = change[1].newValue;
					});
					// eslint-disable-next-line no-undef
					optionsLocal = optionsWithVersioningLocal[optionsVersion];
					break;
				default:
					console.log("Storage change in unknown location");
					break;
				}
			});

			const Sites = Object.freeze({
				"mal": Symbol("MyAnimeList"),
				"anilist": Symbol("AniList"),
				"kitsu": Symbol("Kitsu"),
			});

			const validateAndMineURL = (url, notIgnoring) => {
				const matchFuncs = {
					"mal": matchOnMAL, // eslint-disable-line no-undef
					"anilist": matchOnAniList, // eslint-disable-line no-undef
					"kitsu": matchOnKitsu, // eslint-disable-line no-undef
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
				if (!([menuId].includes(info.menuItemId))) {
					return;
				}
				console.log(`Link URL: ${info.linkUrl}`);
				console.log(`Tab URL: ${tab.url}`);
				const notIgnoring = {
					"mal": options.checkbox.mal_mal,
					"anilist": options.checkbox.anilist_anilist,
					"kitsu": options.checkbox.kitsu_kitsu,
				};
				const urlData = validateAndMineURL(info.linkUrl, notIgnoring);
				if (urlData && !urlData.notIgnoring) {
					console.log("Match ignored");
					createNotification({
						"title": "Ignoring list site",
						"message": `PTW Extender is currently set to ignore ${urlData.source
							.toString().slice(7, -1)}`,
					});
				} else if (urlData && urlData.source === Sites.mal) {
					// eslint-disable-next-line no-undef
					createNotification(await handleMAL(tab, urlData, {
						"prettifyCommentsBox": options.checkbox.extension_prettifyCommentsBox,
						"autosubmit": options.checkbox.mal_autosubmit,
						"behaviorPostAutosubmit": options.radio.mal_behaviorPostAutosubmit,
						"priority": options.radio.mal_priority,
						"tags": options.textarea.mal_tags,
					}));
				} else if (urlData && urlData.source === Sites.anilist) {
					// eslint-disable-next-line no-undef
					createNotification(await handleAniList(tab, urlData, {
						"accessToken": optionsLocal.authentication.anilist.accessToken,
						"private": options.checkbox.anilist_private,
						"hiddenFromStatusLists": options.checkbox.anilist_hiddenFromStatusLists,
						"customListsAnime": options.multipleCheckbox.anilist_customListsAnime,
						"customListsManga": options.multipleCheckbox.anilist_customListsManga,
					}));
				} else if (urlData && urlData.source === Sites.kitsu) {
					// eslint-disable-next-line no-undef
					createNotification(await handleKitsu(tab, urlData, {
						"accessToken": optionsLocal.authentication.kitsu.accessToken,
						"private": options.checkbox.kitsu_private,
					}));
				} else {
					console.log("Match fail");
					createNotification({
						"title": "Unknown list site",
						"message": "PTW Extender isn't compatible with that site",
					});
				}
				console.log("world");
			});
		}, 50);
	});

browser.runtime.onInstalled.addListener((details) => {
	if (["install", "update"].includes(details.reason)) {
		browser.runtime.openOptionsPage();
	}
});
