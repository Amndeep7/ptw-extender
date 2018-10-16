/* eslint no-console: "off" */
/* eslint no-param-reassign: "off" */

// doesn't completely empty the node - leaves the first element child in there
const emptyNode = (node) => {
	while (node.lastElementChild && node.firstElementChild !== node.lastElementChild) {
		node.removeChild(node.lastElementChild);
	}
};

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
	const fieldset = document.querySelector(`fieldset[name="${option}"]`);
	emptyNode(fieldset);
	fillFieldsetWithOptions(option, Object.keys(values), Object.values(values));
};

const restoreRadioOption = (option, value) => {
	document.querySelector("form").elements[option].value = value;
};

const restoreTextareaOption = (option, value) => {
	document.querySelector(`textarea[name="${option}"]`).value = value;
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
		// eslint-disable-next-line no-undef
		const options = await browser.storage.sync.get(optionsVersion);
		// eslint-disable-next-line no-undef
		options[optionsVersion][modifiers.type][option.target.name] = modifiers.isProperty
			? option.target[modifiers.property] : modifiers.property;
		await browser.storage.sync.set({
			// eslint-disable-next-line no-undef
			[optionsVersion]: options[optionsVersion],
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

const setupSavingCheckboxOptions = () => {
	document.querySelectorAll("input[type=checkbox]:not([value])")
		.forEach((option) => option.addEventListener("change", (o) => {
			saveOption(o, {
				"type": "checkbox",
				"isProperty": true,
				"property": "checked",
			});
		}));
};

// pass the object along as the property for saveOption
const setupSavingMultipleCheckboxOptions = () => {
	document.querySelectorAll("fieldset[name]").forEach((fieldset) => fieldset.addEventListener("change", (o) => {
		const values = {};
		document.querySelectorAll(`input[type=checkbox][name="${fieldset.name}"]`).forEach((input) => {
			values[input.value] = input.checked;
		});
		saveOption(o, {
			"type": "multipleCheckbox",
			"isProperty": false,
			"property": values,
		});
	}));
};

const setupSavingRadioOptions = () => {
	document.querySelectorAll("input[type=radio]")
		.forEach((option) => option.addEventListener("change", (o) => {
			saveOption(o, {
				"type": "radio",
				"isProperty": true,
				"property": "value",
			});
		}));
};

const setupSavingTextareaOptions = () => {
	document.querySelectorAll("textarea")
		.forEach((option) => option.addEventListener("input", (o) => {
			saveOption(o, {
				"type": "textarea",
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

const setupAniListCustomLists = async (accessToken) => {
	// eslint-disable-next-line no-undef
	const optionsSync = await browser.storage.sync.get(optionsVersion);

	if (accessToken === null) {
		// eslint-disable-next-line no-undef
		optionsSync[optionsVersion].multipleCheckbox.anilist_customListsAnime = {};
		// eslint-disable-next-line no-undef
		optionsSync[optionsVersion].multipleCheckbox.anilist_customListsManga = {};
		// eslint-disable-next-line no-undef
		await browser.storage.sync.set({ [optionsVersion]: optionsSync[optionsVersion] });
		return;
	}

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
	// eslint-disable-next-line no-undef
	optionsSync[optionsVersion].multipleCheckbox.anilist_customListsAnime = animelists.reduce(reducer, {});
	// eslint-disable-next-line no-undef
	optionsSync[optionsVersion].multipleCheckbox.anilist_customListsManga = mangalists.reduce(reducer, {});
	// eslint-disable-next-line no-undef
	await browser.storage.sync.set({ [optionsVersion]: optionsSync[optionsVersion] });
};

const restoreLoginButton = (site, options) => {
	console.log(`restoring ${site.raw} button`);
	try {
		document.querySelector(`input[name='${site.raw}_login']`).value = options.authentication[site.raw].accessToken
			=== null ? `Login to ${site.proper}` : `Logout of ${site.proper}`;
		document.querySelector("#results").innerHTML = `Successfully restored ${site.proper} button`;
	} catch (e) {
		console.log("error while restoring", e);
		document.querySelector("#results").innerHTML = `Didn't successfully restore ${site.proper} button`;
	}
};

const setupSavingAniListLoginButton = (postAuthentication) => {
	document.querySelector("input[name='anilist_login']").addEventListener("click", async (event) => {
		try {
			// eslint-disable-next-line no-undef
			const options = await browser.storage.local.get(optionsVersion);

			// eslint-disable-next-line no-undef
			if (options[optionsVersion].authentication.anilist.accessToken === null) {
				event.target.value = "Logout of AniList";

				// eslint-disable-next-line no-undef
				const clientId = extensionConstants[extensionConstantsVersion].authentication
					// eslint-disable-next-line no-undef
					.anilist[`clientId_${extensionConstants[extensionConstantsVersion].browser.type}`];
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
					console.log("couldn't log into anilist", e2);
					document.querySelector("#results").innerHTML = `Couldn't log into AniList because: "${e2.message}"`;
					return;
				}
				const accessToken = redirectUrl.match(/#access_token=(.*?)&/)[1];
				// eslint-disable-next-line no-undef
				options[optionsVersion].authentication.anilist.accessToken = accessToken;
				// eslint-disable-next-line no-undef
				await browser.storage.local.set({ [optionsVersion]: options[optionsVersion] });
				document.querySelector("#results").innerHTML = "Logged into AniList";

				postAuthentication.args.unshift(accessToken);
				runSteps(postAuthentication.funcs, postAuthentication.args);
			} else {
				event.target.value = "Login to AniList";

				// eslint-disable-next-line no-undef
				options[optionsVersion].authentication.anilist.accessToken = null;
				// eslint-disable-next-line no-undef
				await browser.storage.local.set({ [optionsVersion]: options[optionsVersion] });
				document.querySelector("#results").innerHTML = "Logged out of AniList";

				emptyNode(document.querySelector("fieldset[name='anilist_customListsAnime']"));
				emptyNode(document.querySelector("fieldset[name='anilist_customListsManga']"));

				// eslint-disable-next-line no-undef
				const optionsSync = await browser.storage.sync.get(optionsVersion);
				// eslint-disable-next-line no-undef
				optionsSync[optionsVersion].multipleCheckbox.anilist_customListsAnime = {};
				// eslint-disable-next-line no-undef
				optionsSync[optionsVersion].multipleCheckbox.anilist_customListsManga = {};
				// eslint-disable-next-line no-undef
				await browser.storage.sync.set({ [optionsVersion]: optionsSync[optionsVersion] });
			}
		} catch (e) {
			console.log("failed using anilist button:", e);
			document.querySelector("#results").innerHTML = "Failed using AniList button";
		}
	});
};

const setupSavingKitsuLoginButton = () => {
	document.querySelector("input[name='kitsu_login']").addEventListener("click", async (event) => {
		try {
			// eslint-disable-next-line no-undef
			const options = await browser.storage.local.get(optionsVersion);

			// eslint-disable-next-line no-undef
			if (options[optionsVersion].authentication.kitsu.accessToken === null) {
				event.target.value = "Logout of Kitsu";

				const url = "https://kitsu.io/api/oauth/token";
				const urlOptions = {
					"method": "POST",
					"headers": {
						"Accept": "application/json",
						"Content-Type": "application/json",
					},
					"body": {
						// kitsu doesn't really have their oauth/security situation figured out yet
						"client_id": "dd031b32d2f56c990b1425efe6c42ad847e7fe3ab46bf1299f05ecd856bdb7dd",
						"grant_type": "password",
						"username": document.querySelector("input[name='kitsu_username']").value,
						"password": document.querySelector("input[name='kitsu_password']").value,
					},
				};
				urlOptions.body = JSON.stringify(urlOptions.body);

				try {
					const retrieve = await fetch(url, urlOptions);
					const { "access_token": accessToken, error } = await retrieve.json();
					if (accessToken) {
						// eslint-disable-next-line no-undef
						options[optionsVersion].authentication.kitsu.accessToken = accessToken;
						// eslint-disable-next-line no-undef
						await browser.storage.local.set({ [optionsVersion]: options[optionsVersion] });
						document.querySelector("#results").innerHTML = "Logged into Kitsu";
					} else {
						event.target.value = "Login to Kitsu";
						console.log("couldn't log into kitsu cause username/password wrong", error);
						document.querySelector("#results").innerHTML = "Couldn't log into Kitsu probably due"
							+ " to incorrect credentials";
					}
				} catch (e2) {
					event.target.value = "Login to Kitsu";
					console.log("couldn't log into kitsu", e2);
					document.querySelector("#results").innerHTML = `Couldn't log into Kitsu because: "${e2.message}"`;
				}
			} else {
				event.target.value = "Login to Kitsu";

				// eslint-disable-next-line no-undef
				options[optionsVersion].authentication.kitsu.accessToken = null;
				// eslint-disable-next-line no-undef
				await browser.storage.local.set({ [optionsVersion]: options[optionsVersion] });
				document.querySelector("#results").innerHTML = "Logged out of Kitsu";
			}
		} catch (e) {
			console.log("failed using kitsu button:", e);
			document.querySelector("#results").innerHTML = "Failed using Kitsu button";
		}
	});
};

const setupDisablingDependentOptions = () => {
	// dependent class and associated attributes should only be applied to wrapping divs
	document.querySelectorAll(".dependent")
		.forEach((dependent) => {
			// might need to come back to add more tags other than input and textarea
			dependent.querySelectorAll("input, textarea").forEach((input) => {
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

const markdownToHTML = async (url, id) => {
	const raw = await fetch(browser.runtime.getURL(url));
	const markdown = await raw.text();
	// eslint-disable-next-line no-undef
	const converter = new showdown.Converter();
	const html = converter.makeHtml(markdown);
	// eslint-disable-next-line no-undef
	const clean = DOMPurify.sanitize(html, { "RETURN_DOM": true });
	document.querySelector(id).appendChild(clean);
};

document.addEventListener("DOMContentLoaded", async () => {
	markdownToHTML("readme/permissions_explanation.md", "#permissionsExplanation");
	markdownToHTML("CHANGELOG.md", "#changelog");

	const intervalId = setInterval(async () => {
		// eslint-disable-next-line no-undef
		if (optionsLock) {
			return;
		}
		clearInterval(intervalId);

		let options = null;
		try {
			options = await browser.storage.local.get();
		} catch (e) {
			console.log("error while restoring while in listener", e);
			document.querySelector("#results").innerHTML = "Didn't successfully assign default/unchanged options";
			throw e;
		}

		// eslint-disable-next-line no-undef
		const reviewLoc = extensionConstants[extensionConstantsVersion].browser.type === "firefox"
			? "https://addons.mozilla.org/en-US/firefox/addon/ptw-extender/"
			: "https://chrome.google.com/webstore/detail/ptw-extender/cbllkljhggikogmnnfiihcbgenkmjanh/reviews";
		document.querySelector("#review").setAttribute("href", reviewLoc);

		// eslint-disable-next-line no-undef
		restoreLoginButton({ "raw": "anilist", "proper": "AniList" }, options[optionsVersion]);
		setupSavingAniListLoginButton({
			"funcs": [
				setupAniListCustomLists,
			],
			"args": [],
		});

		// eslint-disable-next-line no-undef
		restoreLoginButton({ "raw": "kitsu", "proper": "Kitsu" }, options[optionsVersion]);
		setupSavingKitsuLoginButton();

		options = null;
		try {
			options = await browser.storage.sync.get();
		} catch (e) {
			console.log("error while restoring while in listener", e);
			document.querySelector("#results").innerHTML = "Didn't successfully assign default/unchanged options";
			throw e;
		}

		// eslint-disable-next-line no-undef
		restoreOptions(options[optionsVersion], "checkbox", restoreCheckboxOption);
		// eslint-disable-next-line no-undef
		restoreOptions(options[optionsVersion], "radio", restoreRadioOption);
		// eslint-disable-next-line no-undef
		restoreOptions(options[optionsVersion], "multipleCheckbox", restoreMultipleCheckboxOption);
		// eslint-disable-next-line no-undef
		restoreOptions(options[optionsVersion], "textarea", restoreTextareaOption);

		setupSavingCheckboxOptions();
		setupSavingMultipleCheckboxOptions();
		setupSavingRadioOptions();
		setupSavingTextareaOptions();

		setupDisablingDependentOptions();
	}, 50);
});
