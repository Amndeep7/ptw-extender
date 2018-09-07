/* eslint no-console: "off" */

// - names have to be unique - can't use a custom data attribute to divide between elements with the same name so
// that's why the options have prefixes
// - versioning has been added, but not any transitioning between versions so that's a TODO whenever I make a new
// version of the options
const optionsDefaults = {
	"v1": {
		"checkbox": {
			"extension_displayNotifications": true,
			"extension_prettifyCommentsBox": true,
			"mal_mal": true,
			"mal_autosubmit": false,
		},
		"radio": {
			"mal_behaviorPostAutosubmit": "titlePage",
		},
	},
};

(async () => {
	console.log("options being set");
	// make sure the defaults are assigned, but don't override any changed settings
	let options = null;
	try {
		options = await browser.storage.sync.get(optionsDefaults);
		await browser.storage.sync.set(options);
	} catch (e) {
		console.log("error while restoring while in listener", e);
		document.querySelector("#results").innerHTML = "Didn't successfully assign default/unchanged options";
		throw e;
	}
})();
