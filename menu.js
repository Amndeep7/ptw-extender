/* eslint no-console: "off" */
browser.menus.create({
	"id": "ptw",
	"title": "Add to MAL PTW list",
	"contexts": ["link"],
	"icons": {
		"16": "icons/icon.svg",
		"32": "icons/icon.svg",
	},
	"onclick": (info, tab) => {
		console.log("hello");
		console.log(`Link URL: ${info.linkUrl}`);
		console.log(`Tab URL: ${tab.url}`);
		const match = info.linkUrl.match(/^https?:\/\/myanimelist\.net\/(anime|manga)\/(\d+).*$/);
		if (match) {
			const type = match[1];
			const id = match[2];
			console.log("Match success");
			console.log(`${type} ${id}`);
			const generatedurl = {
				"anime": [`https://myanimelist.net/panel.php?go=add&selected_series_id=${id}`,
					`https://myanimelist.net/editlist.php?type=anime&id=${id}`],
				"manga": [`https://myanimelist.net/panel.php?go=addmanga&selected_manga_id=${id}`,
					`https://myanimelist.net/panel.php?go=editmanga&id=${id}`],
			};
			const maxattempts = 2;
			const trytabs = (a) => {
				if (a >= maxattempts) {
					console.log("Probably need to log into MAL");
					return;
				}
				console.log(`${a}`);
				const malpromise = browser.tabs.create({ "index": tab.index + 1, "url": generatedurl[type][a] });
				malpromise.then((maltab) => {
					console.log(`${maltab.url}`);
					console.log(`${generatedurl[type][a]}`);
					let correctChange = false;
					browser.tabs.onUpdated.addListener((tabId, changeInfo, _tabInfo) => {
						if (tabId === maltab.id && !correctChange && changeInfo.url) {
							correctChange = true;
							if (changeInfo.url === generatedurl[type][a]) {
								console.log("success");
								const scriptpromise = browser.tabs.executeScript({
									"file": "sourceadder.js",
								});
								scriptpromise.then((_result) => {
									console.log("sending message");
									browser.tabs.sendMessage(maltab.id, {
										"taburl": tab.url,
									});
								}, (err) => {
									console.log(`failed running script due to err: ${err}`);
								});
							} else {
								console.log("failure");
								const removepromise = browser.tabs.remove(maltab.id);
								removepromise.then(() => {
									console.log("Tab closed");
									trytabs(a + 1);
								}, (e) => {
									console.log(`Error in closing tab: ${e}`);
								});
							}
						} else if (correctChange) {
							console.log("changes are irrelevant now");
						} else {
							console.log("tab url hasn't changed yet");
						}
					});
				}, (error) => {
					console.log(`Error in #${a + 1} tab: ${error}`);
				});
			};
			trytabs(0);
		} else {
			console.log("Match fail");
		}
		console.log("world");
	},
});
