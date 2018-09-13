/* eslint no-console: off */

browser.runtime.onMessage.addListener((message, sender) => {
	console.log("in buttons script");
	console.log(`${message}`);
	console.log(`${sender.id}\n${browser.runtime.id}`);
	if (sender.id === browser.runtime.id && message.id && message.id === "buttons") {
		if (document.querySelector("#myanimelist")) {
			if (message.submitButton) {
				console.log("Pressing submit button");
				const button = document.querySelector(".inputButton.main_submit");
				button.click();
			} else {
				switch (message.options.behaviorPostAutosubmit) {
				case "viewList": {
					console.log("clicking view list");
					const viewlist = document.querySelector("a[target='_parent']");
					viewlist.click();
					break;
				}
				case "titlePage": {
					console.log("clicking title page");
					const titlepage = document.querySelector("a[target='_top']");
					titlepage.click();
					break;
				}
				default:
					console.log("doing nothing cause option was", message.options.behaviorPostAutosubmit);
					break;
				}
			}
			return Promise.resolve(true);
		}
	}
	return Promise.resolve(false);
});
