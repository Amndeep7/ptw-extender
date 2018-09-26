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
			"anilist_anilist": true,
			"anilist_private": false,
			"anilist_hiddenFromStatusLists": false,
		},
		"multipleCheckbox": {
			// objects should consist of key/value pairs of the form value:checked
			// empty objects are to be replaced by values acquired from the user
			"anilist_customListsAnime": {},
			"anilist_customListsManga": {},
		},
		"radio": {
			"mal_behaviorPostAutosubmit": "titlePage",
		},
	},
};

const optionsDefaultsLocal = {
	"v1": {
		"authentication": {
			"anilist": {
				"clientId_firefox": 1124,
				"clientId_chrome": 1125,
				"accessToken": null,
			},
		},
		"browser": {
			"type": browser.runtime.getBrowserInfo === undefined ? "chrome" : "firefox",
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
		console.log("error while restoring from sync defaults", e);
		document.querySelector("#results").innerHTML = "Didn't successfully assign default/unchanged sync options";
		throw e;
	}

	try {
		options = await browser.storage.local.get(optionsDefaultsLocal);
		await browser.storage.local.set(optionsDefaultsLocal);
	} catch (e) {
		console.log("error while restoring from local defaults", e);
		document.querySelector("#results").innerHTML = "Didn't successfully assign default/unchanged local options";
		throw e;
	}
})();
