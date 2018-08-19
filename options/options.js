/* eslint no-console: "off" */

const saveCheckboxOption = async (option) => {
	console.log(option);
	try {
		// objects get fully replaced, so having the optionSource be the key made it so every update
		// would wipe the contents of the optionSource - resolution is to get the contents of the optionSource
		// every time a change is desired, change the the contents accordingly, and then push the contents back up.
		// wasteful, but it helps maintain organization and it's not like there's lots of options nor will a user be
		// constantly changing them so i'm fine with it
		const options = await browser.storage.sync.get(option.target.dataset.optionSource);
		options[option.target.dataset.optionSource][option.target.name] = option.target.checked;
		await browser.storage.sync.set({
			[option.target.dataset.optionSource]: options[option.target.dataset.optionSource]
		});

		document.querySelector("#results").innerHTML = `${option.target.name}`
			+ ` was successfully saved to ${option.target.checked}`;
	} catch (e) {
		console.log("error while saving", e);
		document.querySelector("#results").innerHTML = `${option.target.name} was not successfully saved`;
	}
};

const restoreOptions = async (type, defaults, restoreOption) => {
	console.log(`restoring ${type} options`);

	try {
		const options = await browser.storage.sync.get(defaults);
		// this is to make sure the defaults are assigned in the first place,
		// but not override any settings that did get changed
		await browser.storage.sync.set(options);

		Object.entries(options).forEach((optionSource) => {
			Object.entries(optionSource[1]).forEach((option) => {
				restoreOption(optionSource[0], option[0], option[1]);
			});
		});

		document.querySelector("#results").innerHTML = `Successfully restored ${type} options from memory`;
	} catch (e) {
		console.log("error while restoring", e);
		document.querySelector("#results").innerHTML = `Didn't successfully restore ${type} options from memory`;
	}
};

const checkboxOptionsDefaults = {
	"extension": {
		"displaynotifications": true,
		"prettifycommentsbox": true,
	},
	"mal": {
		"autosubmit": false,
	},
};

const restoreCheckboxOption = (optionSource, option, checked) => {
	document.querySelector(`[data-option-source="${optionSource}"][name="${option}"]`).checked = checked;
};

document.addEventListener("DOMContentLoaded", () => {
	restoreOptions("checkbox", checkboxOptionsDefaults, restoreCheckboxOption);
});
document.querySelectorAll("input[type=checkbox]")
	.forEach((option) => option.addEventListener("change", saveCheckboxOption));
