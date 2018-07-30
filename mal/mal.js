/* eslint no-console: "off" */

// eslint-disable-next-line no-unused-vars
const matchOnMAL = (url) => {
	const matchMAL = url.match(/^https?:\/\/(?:www\.)?myanimelist\.net\/(anime|manga)\/(\d+).*$/);
	if (matchMAL) {
		const urlData = {
			"type": matchMAL[1],
			"id": matchMAL[2],
		};
		console.log("MAL match success");
		console.log(`${urlData.type} ${urlData.id}`);
		return urlData;
	}
	return false;
};

// eslint-disable-next-line no-unused-vars
const handleMAL = (tab, urlData) => {
	const generatedURL = {
		"add": `https://myanimelist.net/ownlist/${urlData.type}/add`
		+ `?selected_${urlData.type === "anime" ? "series" : "manga"}_id=${urlData.id}`,
		"edit": `https://myanimelist.net/ownlist/${urlData.type}/${urlData.id}/edit`,
	};

	let urlChanged = null;
	let scriptRun = null;

	const promisedTabHandlerGenerator = (urlVariation) => (malTab) => {
		console.log(`${tab.url}`);
		console.log(`${urlVariation}`);

		const handleCreatedTab = (tabId, changeInfo) => {
			if (tabId === malTab.id) {
				if (changeInfo.url) {
					const removeTab = () => {
						const removepromise = browser.tabs.remove(malTab.id);
						removepromise.then(() => {
							console.log("Tab closed");
						}, (e) => {
							console.log(`Error in closing tab: ${e}`);
						});
					};

					if (changeInfo.url === urlVariation) {
						console.log("Tab successfully created");
						browser.tabs.onUpdated.removeListener(handleCreatedTab);
						urlChanged = true;

						browser.tabs.executeScript(tabId, { "file": "./lib/browser-polyfill.js" });
						browser.tabs.executeScript(tabId, { "file": "./mal/sourceadder.js" }).then(async () => {
							console.log("sending message");
							scriptRun = await browser.tabs.sendMessage(malTab.id, {
								"taburl": tab.url,
								"type": urlData.type,
							});
							console.log("scriptRun val", scriptRun);
							if (!scriptRun) {
								removeTab();
							}
						}, (err) => {
							console.log("failed running script due to err: ", err);
							removeTab();
						});
					} else {
						console.log("Tab unsuccessfully created");
						browser.tabs.onUpdated.removeListener(handleCreatedTab);
						urlChanged = false;
						removeTab();
					}
				} else {
					console.log("Irrelevant change to the tab we created");
				}
			} else {
				console.log("Irrelevant change to a tab that wasn't the one we created");
			}
		};
		browser.tabs.onUpdated.addListener(handleCreatedTab);
	};

	const waitingOnURLChangeResult = () => new Promise((resolve, reject) => {
		(function waiting() {
			if (urlChanged === true) {
				if (scriptRun === true) {
					return resolve();
				}
				if (scriptRun === false) {
					scriptRun = null;
					return reject();
				}
			}
			if (urlChanged === false) {
				urlChanged = null;
				return reject();
			}
			return setTimeout(waiting, 50);
		}());
	});

	const createMALTab = (variation, catchFunc) => () => {
		browser.tabs.create({ "index": tab.index + 1, "url": variation })
			.then(promisedTabHandlerGenerator(variation))
			.then(async () => {
				console.log("waiting");
				const waits = await waitingOnURLChangeResult();
				return waits;
			})
			.catch(catchFunc);
	};

	createMALTab(generatedURL.add,
		createMALTab(generatedURL.edit, () => { console.log("Probably need to log into MAL"); }))();
};
