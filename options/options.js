/* eslint no-console: "off" */
/* eslint no-param-reassign: "off" */

const fillFieldsetWithOptions = (name, options, checked) => {
	const set = document.querySelector(`fieldset[name="${name}"]`);
	options.forEach((option, index) => {
		const input = document.createElement("input");
		input.setAttribute("type", "checkbox");
		input.setAttribute("name", name);
		input.setAttribute("value", option);
		if (checked[index]) {
			input.checked = true;
		}

		const label = document.createElement("label");
		label.appendChild(input);
		label.appendChild(document.createTextNode(option));

		set.appendChild(label);
	});
};

const restoreCheckboxOption = (option, checked) => {
	document.querySelector(`input[type=checkbox][name="${option}"]`).checked = checked;
};

const restoreMultipleCheckboxOption = (option, values) => {
	if (document.querySelector(`input[type=checkbox][name="${option}"]`) === null) {
		fillFieldsetWithOptions(option, Object.keys(values), Object.values(values));
	}

	Object.entries(values).forEach((value) => {
		// eslint-disable-next-line prefer-destructuring
		document.querySelector(`input[type=checkbox][name="${option}"][value="${value[0]}"]`).checked = value[1];
	});
};

const restoreRadioOption = (option, value) => {
	document.querySelector("form").elements[option].value = value;
};

const restoreOptions = (options, type, restoreOption) => {
	console.log(`restoring ${type} options`);
	try {
		Object.entries(options[type]).forEach((option) => {
			restoreOption(option[0], option[1]);
		});

		document.querySelector("#results").innerHTML = `Successfully restored ${type} options from memory`;
	} catch (e) {
		console.log("error while restoring", e);
		document.querySelector("#results").innerHTML = `Didn't successfully restore ${type} options from memory`;
	}
};

const saveOption = async (option, modifiers) => {
	console.log(option);
	try {
		// objects get fully replaced, so having the optionSource be the key made it so every update
		// would wipe the contents of the optionSource - resolution is to get the contents of the optionSource
		// every time a change is desired, change the the contents accordingly, and then push the contents back up.
		// wasteful, but it helps maintain organization and it's not like there's lots of options nor will a user be
		// constantly changing them so i'm fine with it
		const options = await browser.storage.sync.get(modifiers.version);
		options[modifiers.version][modifiers.type][option.target.name] = modifiers.isProperty
			? option.target[modifiers.property] : modifiers.property;
		await browser.storage.sync.set({
			[modifiers.version]: options[modifiers.version],
		});

		if (modifiers.isProperty) {
			document.querySelector("#results").innerHTML = `${option.target.name}`
				+ ` was successfully saved to ${option.target[modifiers.property]}`;
		} else {
			document.querySelector("#results").innerHTML = `${option.target.name}`
				+ ` was successfully saved regarding ${option.target.value}`;
		}
	} catch (e) {
		console.log("error while saving", e);
		document.querySelector("#results").innerHTML = `${option.target.name} was not successfully saved`;
	}
};

const setupSavingCheckboxOptions = (optionsVersion) => {
	document.querySelectorAll("input[type=checkbox]:not([value])")
		.forEach((option) => option.addEventListener("change", (o) => {
			saveOption(o, {
				"version": optionsVersion,
				"type": "checkbox",
				"isProperty": true,
				"property": "checked",
			});
		}));
};

// pass the object along as the property for saveOption
const setupSavingMultipleCheckboxOptions = (optionsVersion) => {
	document.querySelectorAll("fieldset[name]").forEach((fieldset) => fieldset.addEventListener("change", (o) => {
		const values = {};
		document.querySelectorAll(`input[type=checkbox][name="${fieldset.name}"]`).forEach((input) => {
			values[input.value] = input.checked;
		});
		saveOption(o, {
			"version": optionsVersion,
			"type": "multipleCheckbox",
			"isProperty": false,
			"property": values,
		});
	}));
};

const setupSavingRadioOptions = (optionsVersion) => {
	document.querySelectorAll("input[type=radio]")
		.forEach((option) => option.addEventListener("change", (o) => {
			saveOption(o, {
				"version": optionsVersion,
				"type": "radio",
				"isProperty": true,
				"property": "value",
			});
		}));
};

const runSteps = (steps, args) => {
	steps.forEach((step) => {
		step(...args);
	});
};

const setupAnilistCustomLists = async (optionsVersion, accessToken) => {
	const queryRetrieveCustomLists = {
		"query": `
			query retrieveCustomLists {
				Viewer {
					mediaListOptions {
						animeList {
							customLists
						}
						mangaList {
							customLists
						}
					}
				}
			}`,
		"operationName": "retrieveCustomLists",
	};

	let data = null;
	let errors = null;
	try {
		// eslint-disable-next-line no-undef
		[data, errors] = await sendAniListQuery(accessToken, queryRetrieveCustomLists);
	} catch (e) {
		console.log("Unsuccessfully made request", e);
		document.querySelector("#results").innerHTML = "Request to retrieve AniList custom lists failed";
	}

	if (errors) {
		console.log("Unsuccessfully made request", errors);
		document.querySelector("#results").innerHTML = "Failed to retrieve AniList custom lists"
			+ " - authentication failed";
	}

	const animelists = data.Viewer.mediaListOptions.animeList.customLists;
	fillFieldsetWithOptions("anilist_customListsAnime", animelists, Array(animelists.length).fill(false));
	const mangalists = data.Viewer.mediaListOptions.mangaList.customLists;
	fillFieldsetWithOptions("anilist_customListsManga", mangalists, Array(mangalists.length).fill(false));

	const reducer = (customLists, list) => { customLists[list] = false; return customLists; };
	const optionsSync = await browser.storage.sync.get(optionsVersion);
	optionsSync[optionsVersion].multipleCheckbox.anilist_customListsAnime = animelists.reduce(reducer, {});
	optionsSync[optionsVersion].multipleCheckbox.anilist_customListsManga = mangalists.reduce(reducer, {});
	await browser.storage.sync.set({ [optionsVersion]: optionsSync[optionsVersion] });
};

const restoreAniListLoginButton = (options) => {
	console.log("restoring anilist button");
	try {
		document.querySelector("input[name='anilist_login']").value = options.authentication.anilist.accessToken
			=== null ? "Login to AniList" : "Logout of AniList";
		document.querySelector("#results").innerHTML = "Successfully restored AniList button";
	} catch (e) {
		console.log("error while restoring", e);
		document.querySelector("#results").innerHTML = "Didn't successfully restore AniList button";
	}
};

const setupSavingAniListLoginButton = (optionsVersion, postAuthentication) => {
	try {
		document.querySelector("input[name='anilist_login']").addEventListener("click", async (event) => {
			const options = await browser.storage.local.get(optionsVersion);

			if (options[optionsVersion].authentication.anilist.accessToken === null) {
				event.target.value = "Logout of AniList";

				const clientId = options[optionsVersion].authentication
					.anilist[`clientId_${options[optionsVersion].browser.type}`];
				const redirectRequestUrl = "https://anilist.co/api/v2/oauth/authorize?response_type=token&"
					+ `client_id=${clientId}`;
				let redirectUrl = null;
				try {
					redirectUrl = await browser.identity.launchWebAuthFlow({
						"url": redirectRequestUrl,
						"interactive": true,
					});
				} catch (e2) {
					event.target.value = "Login to AniList";
					console.log("couldn't log into anilist", e2.message);
					document.querySelector("#results").innerHTML = `Couldn't log into AniList because: "${e2.message}"`;
					return;
				}
				const accessToken = redirectUrl.match(/#access_token=(.*?)&/)[1];
				options[optionsVersion].authentication.anilist.accessToken = accessToken;
				await browser.storage.local.set({ [optionsVersion]: options[optionsVersion] });
				document.querySelector("#results").innerHTML = "Logged into AniList";

				postAuthentication.args.unshift(accessToken);
				postAuthentication.args.unshift(optionsVersion);
				runSteps(postAuthentication.funcs, postAuthentication.args);
			} else {
				event.target.value = "Login to AniList";

				options[optionsVersion].authentication.anilist.accessToken = null;
				await browser.storage.local.set({ [optionsVersion]: options[optionsVersion] });
				document.querySelector("#results").innerHTML = "Logged out of AniList";

				const emptyNode = (node) => {
					while (node.lastElementChild && node.firstElementChild !== node.lastElementChild) {
						node.removeChild(node.lastElementChild);
					}
				};
				emptyNode(document.querySelector("fieldset[name='anilist_customListsAnime']"));
				emptyNode(document.querySelector("fieldset[name='anilist_customListsManga']"));

				const optionsSync = await browser.storage.sync.get(optionsVersion);
				optionsSync[optionsVersion].multipleCheckbox.anilist_customListsAnime = {};
				optionsSync[optionsVersion].multipleCheckbox.anilist_customListsManga = {};
				await browser.storage.sync.set({ [optionsVersion]: optionsSync[optionsVersion] });
			}
		});
	} catch (e) {
		console.log("failed using anilist button:", e);
		document.querySelector("#results").innerHTML = "Failed using AniList button";
	}
};

const setupDisablingDependentOptions = () => {
	// dependent class and associated attributes should only be applied to wrapping divs
	document.querySelectorAll(".dependent")
		.forEach((dependent) => {
			// might need to come back to add more tags other than input
			dependent.querySelectorAll("input").forEach((input) => {
				const value = ((v) => {
					// https://stackoverflow.com/a/23752239/645647 - example on how to use empty + custom data attributes
					// undefined means attribute not there, "" means attribute there using empty attribute syntax or
					// explicitly set to that, anything else will be the value there - so to have true, the restriction
					// will be that value will have to have nonempty strings if you want anything in there besides a bool
					switch (v) {
					case undefined:
						return false;
					case "":
						return true;
					default:
						return v;
					}
				})(dependent.dataset.dependentPropertyValue);

				if (input.dependencies === undefined) {
					input.dependencies = {};
				}
				const option = document.querySelector(`input[name="${dependent.dataset.dependentOn}"]`);
				const update = (o) => {
					input.dependencies[dependent.dataset.dependentOn] = o[dependent.dataset.dependentProperty]
						=== value;
					input.disabled = Object.values(input.dependencies).reduce((acc, cur) => acc || cur);
				};
				update(option);
				option.addEventListener("change", (o) => {
					update(o.target);
				});
			});
		});
};

document.addEventListener("DOMContentLoaded", async () => {
	const optionsVersion = "v1";

	let options = null;
	try {
		// eslint-disable-next-line no-undef
		options = await browser.storage.local.get();
	} catch (e) {
		console.log("error while restoring while in listener", e);
		document.querySelector("#results").innerHTML = "Didn't successfully assign default/unchanged options";
		throw e;
	}

	restoreAniListLoginButton(options[optionsVersion]);
	setupSavingAniListLoginButton(optionsVersion, {
		"funcs": [
			setupAnilistCustomLists,
		],
		"args": [],
	});

	options = null;
	try {
		// eslint-disable-next-line no-undef
		options = await browser.storage.sync.get();
	} catch (e) {
		console.log("error while restoring while in listener", e);
		document.querySelector("#results").innerHTML = "Didn't successfully assign default/unchanged options";
		throw e;
	}

	restoreOptions(options[optionsVersion], "checkbox", restoreCheckboxOption);
	restoreOptions(options[optionsVersion], "radio", restoreRadioOption);
	restoreOptions(options[optionsVersion], "multipleCheckbox", restoreMultipleCheckboxOption);

	setupSavingCheckboxOptions(optionsVersion);
	setupSavingMultipleCheckboxOptions(optionsVersion);
	setupSavingRadioOptions(optionsVersion);

	setupDisablingDependentOptions();
});
