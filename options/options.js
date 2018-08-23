/* eslint no-console: "off" */

// names have to be unique, but I wanna allow the possibility of the same name for different option sources
// so instead of being able to use an html data attribute or something, I gotta stick the source in the name
const optionsDefaults = {
	"checkbox": {
		"extension_displayNotifications": true,
		"extension_prettifyCommentsBox": true,
		"mal_mal": true,
		"mal_autosubmit": false,
	},
	"radio": {
		"mal_behaviorPostAutosubmit": "titlePage",
	},
};

const restoreCheckboxOption = (option, checked) => {
	document.querySelector(`[name="${option}"]`).checked = checked;
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

const saveOption = async (option, type) => {
	console.log(option);
	try {
		// objects get fully replaced, so having the optionSource be the key made it so every update
		// would wipe the contents of the optionSource - resolution is to get the contents of the optionSource
		// every time a change is desired, change the the contents accordingly, and then push the contents back up.
		// wasteful, but it helps maintain organization and it's not like there's lots of options nor will a user be
		// constantly changing them so i'm fine with it
		const options = await browser.storage.sync.get(type.type);
		options[type.type][option.target.name] = option.target[type.property];
		await browser.storage.sync.set({
			[type.type]: options[type.type],
		});

		document.querySelector("#results").innerHTML = `${option.target.name}`
			+ ` was successfully saved to ${option.target[type.property]}`;
	} catch (e) {
		console.log("error while saving", e);
		document.querySelector("#results").innerHTML = `${option.target.name} was not successfully saved`;
	}
};

const setupSavingCheckboxOptions = () => {
	document.querySelectorAll("input[type=checkbox]")
		.forEach((option) => option.addEventListener("change", (o) => {
			saveOption(o, { "type": "checkbox", "property": "checked" });
		}));
};

const setupSavingRadioOptions = () => {
	document.querySelectorAll("input[type=radio]")
		.forEach((option) => option.addEventListener("change", (o) => {
			saveOption(o, { "type": "radio", "property": "value" });
		}));
};

const setupDisablingDependentOptions = () => {
	// dependent class and associated attributes should only be applied to wrapping divs
	document.querySelectorAll(".dependent")
		.forEach((dependency) => {
			console.log("dependency", dependency);
			// might need to come back to add more tags other than input
			dependency.querySelectorAll("input").forEach((input) => {
				console.log("input", input);
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
				})(dependency.dataset.dependentPropertyValue);

				if (input.dependencies === undefined) {
					// eslint-disable-next-line no-param-reassign
					input.dependencies = {};
				}
				const option = document.querySelector(`input[name="${dependency.dataset.dependentOn}"]`);
				console.log("option", option);
				const update = (o) => {
					console.log(input, o, input.dependencies);
					// eslint-disable-next-line no-param-reassign
					input.dependencies[dependency.dataset.dependentOn] = o[dependency.dataset.dependentProperty]
						=== value;
					// eslint-disable-next-line no-param-reassign
					input.disabled = Object.values(input.dependencies).reduce((acc, cur) => acc || cur);
				};
				update(option);
				option.addEventListener("change", (o) => {
					console.log("o", o);
					update(o.target);
				});
			});
		});
};

document.addEventListener("DOMContentLoaded", async () => {
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

	restoreOptions(options, "checkbox", restoreCheckboxOption);
	restoreOptions(options, "radio", restoreRadioOption);

	setupSavingCheckboxOptions();
	setupSavingRadioOptions();

	setupDisablingDependentOptions();
});
