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
const handleMAL = (tab, urlData, options) => {
	const generatedURL = {
		"add": `https://myanimelist.net/ownlist/${urlData.type}/add`
		+ `?selected_${urlData.type === "anime" ? "series" : "manga"}_id=${urlData.id}`,
		"edit": `https://myanimelist.net/ownlist/${urlData.type}/${urlData.id}/edit`,
	};

	let urlChanged = null;
	let scriptRun = null;

	const promisedTabHandlerGenerator = (urlVariation) => (malTab) => {
		console.log("in handler generator");
		console.log(`${tab.url}`);
		console.log(`${urlVariation}`);

		const handleCreatedTab = async (tabId, changeInfo) => {
			if (tabId === malTab.id) {
				if (changeInfo.url) {
					const removeTab = async () => {
						try {
							await browser.tabs.remove(malTab.id);
							console.log("Tab closed");
						} catch (e) {
							console.log("Error in closing tab:", e);
						}
					};

					if (changeInfo.url === urlVariation) {
						console.log("Tab successfully created");
						browser.tabs.onUpdated.removeListener(handleCreatedTab);
						urlChanged = true;

						try {
							console.log("running polyfill");
							await browser.tabs.executeScript(tabId, { "file": "./lib/browser-polyfill.js" });

							console.log("running linkify");
							await browser.tabs.executeScript(tabId, { "file": "./lib/linkify.js" });
							await browser.tabs.executeScript(tabId, { "file": "./lib/linkify-element.js" });

							console.log("running generics");
							await browser.tabs.executeScript(tabId, { "file": "./generic/generic.js" });

							console.log("running sourceadder");
							await browser.tabs.executeScript(tabId, { "file": "./mal/sourceadder.js" });

							console.log("sending message");
							scriptRun = await browser.tabs.sendMessage(malTab.id, {
								"id": "sourceadder",
								"taburl": tab.url,
								"type": urlData.type,
								"options": { "prettifyCommentsBox": options.prettifyCommentsBox },
							});

							console.log("scriptRun val", scriptRun);
							if (!scriptRun) {
								removeTab();
							} else if (options.autosubmit) {
								console.log("auto press submit");
								const buttonPress = () => {
									const bp = async (details) => {
										if (details.tabId === tabId && details.frameId === 0) {
											console.log("running listener");
											browser.webNavigation.onCompleted.removeListener(bp);

											switch (options.behaviorPostAutosubmit) {
											case "closeTab":
												removeTab();
												break;
											case "viewList":
											case "titlePage": {
												console.log("sending message for second press");
												await browser.tabs.executeScript(tabId,
													{ "file": "./lib/browser-polyfill.js" });
												await browser.tabs.executeScript(tabId, { "file": "./mal/buttons.js" });
												await browser.tabs.sendMessage(tabId, {
													"id": "buttons",
													"submitButton": false,
													"options": {
														"behaviorPostAutosubmit": options.behaviorPostAutosubmit,
													},
												});
												break;
											}
											default:
												break;
											}
										}
									};
									return bp;
								};
								browser.webNavigation.onCompleted.addListener(buttonPress());

								await browser.tabs.executeScript(tabId, { "file": "./mal/buttons.js" });
								await browser.tabs.sendMessage(tabId, {
									"id": "buttons",
									"submitButton": true,
								});
							}
						} catch (e) {
							console.log("failed running script due to err: ", e);
							removeTab();
						}
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

	const waitingOnURLChangeResult = (timeout) => new Promise((resolve, reject) => {
		let timeOut = timeout;
		const refreshRate = 50;
		(function waiting() {
			if (urlChanged === true) {
				if (scriptRun) {
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
			timeOut -= refreshRate;
			if (timeOut < 0) {
				urlChanged = null;
				scriptRun = null;
				return reject(new Error("timeout"));
			}
			return setTimeout(waiting, refreshRate);
		}());
	});

	const createMALTab = (variation, catchFunc) => async () => {
		try {
			console.log("creating tab");
			const maltab = await browser.tabs.create({ "index": tab.index + 1, "url": variation });
			console.log("making tab handler");
			promisedTabHandlerGenerator(variation)(maltab);
			console.log("waiting");
			await waitingOnURLChangeResult(10000);
			return { "title": "Success", "message": `Added ${scriptRun} to your MAL PTW list` };
		} catch (e) {
			console.log("Creating MAL tab", variation, "failed due to err:", e);
			return catchFunc();
		}
	};

	return createMALTab(generatedURL.add,
		createMALTab(generatedURL.edit, () => {
			console.log("Probably need to log into MAL");
			return { "title": "Failure", "message": "Failed to add title to your MAL PTW list - are you logged in?" };
		}))();
};
