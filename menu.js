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

			const validateAndMineURL = async (url) => {
				let match = matchOnMAL(url); // eslint-disable-line no-undef
				if (match) {
					const urlData = { "mal": match };
					urlData.anilist = await matchOnAniListFromMAL(urlData.mal); // eslint-disable-line no-undef
					urlData.kitsu = await matchOnKitsuFromMAL(urlData.mal); // eslint-disable-line no-undef
					return urlData;
				}
				match = matchOnAniList(url); // eslint-disable-line no-undef
				if (match) {
					const urlData = { "anilist": match };
					urlData.mal = await matchOnMALFromAniList(urlData.anilist); // eslint-disable-line no-undef
					urlData.kitsu = urlData.mal ? await matchOnKitsuFromMAL(urlData.mal) : false; // eslint-disable-line no-undef
					return urlData;
				}
				match = matchOnKitsu(url); // eslint-disable-line no-undef
				if (match) {
					const urlData = { "kitsu": match };
					urlData.mal = await matchOnMALFromKitsu(urlData.kitsu); // eslint-disable-line no-undef
					urlData.anilist = urlData.mal ? await matchOnAniListFromMAL(urlData.mal) : false; // eslint-disable-line no-undef
					return urlData;
				}
				return false;
			};

			const createNotification = async (notification) => {
				if (options.checkbox.extension_displayNotifications) {
					await browser.notifications.create({
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
				const urlData = await validateAndMineURL(info.linkUrl);
				if (urlData) {
					const notIgnoring = {
						"mal": options.checkbox.mal_mal,
						"anilist": options.checkbox.anilist_anilist,
						"kitsu": options.checkbox.kitsu_kitsu,
					};

					let message = "";

					if (!notIgnoring.mal) {
						message = message.concat("MAL Ignored: Turned off\n");
					} else if (!urlData.mal) {
						message = message.concat("MAL Failure: Title not found\n");
					} else {
						// eslint-disable-next-line no-undef
						const handled = await handleMAL(tab, urlData.mal, {
							"prettifyCommentsBox": options.checkbox.extension_prettifyCommentsBox,
							"autosubmit": options.checkbox.mal_autosubmit,
							"behaviorPostAutosubmit": options.radio.mal_behaviorPostAutosubmit,
							"priority": options.radio.mal_priority,
							"tags": options.textarea.mal_tags,
						});
						message = message.concat(handled.title, ": ", handled.message, "\n");
					}
					if (!notIgnoring.anilist) {
						message = message.concat("AniList Ignored: Turned off\n");
					} else if (!urlData.anilist) {
						message = message.concat("AniList Failure: Title not found\n");
					} else {
						// eslint-disable-next-line no-undef
						const handled = await handleAniList(tab, urlData.anilist, {
							"accessToken": optionsLocal.authentication.anilist.accessToken,
							"private": options.checkbox.anilist_private,
							"hiddenFromStatusLists": options.checkbox.anilist_hiddenFromStatusLists,
							"customListsAnime": options.multipleCheckbox.anilist_customListsAnime,
							"customListsManga": options.multipleCheckbox.anilist_customListsManga,
						});
						message = message.concat(handled.title, ": ", handled.message, "\n");
					}
					if (!notIgnoring.kitsu) {
						message = message.concat("Kitsu Ignored: Turned off\n");
					} else if (!urlData.kitsu) {
						message = message.concat("Kitsu Failure: Title not found\n");
					} else {
						// eslint-disable-next-line no-undef
						const handled = await handleKitsu(tab, urlData.kitsu, {
							"accessToken": optionsLocal.authentication.kitsu.accessToken,
							"private": options.checkbox.kitsu_private,
						});
						message = message.concat(handled.title, ": ", handled.message, "\n");
					}

					createNotification({ "title": "PTW extending results", "message": message });
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
