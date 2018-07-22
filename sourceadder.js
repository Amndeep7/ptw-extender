/* eslint no-console: off */

browser.runtime.onMessage.addListener((message, sender, _sendResponse) => {
	console.log("in content script");
	console.log(`${message}`);
	console.log(`${sender.id}\n${browser.runtime.id}`);
	if (sender.id === browser.runtime.id) {
		const advanced = document.querySelector(".advanced");
		advanced.style = "";
		console.log("displaying advanced section");
		const comments = document.querySelector(`#add_${message.type}_comments`);
		console.log(`${comments.value.length}`);
		console.log(`${comments.value.length === 0}`);
		if (comments.value.length === 0) {
			console.log(`${""}${message.taburl}`);
			comments.value += `${""}${message.taburl}`;
		} else {
			console.log(`${"\n"}${message.taburl}`);
			comments.value += `${"\n"}${message.taburl}`;
		}
		console.log("text added");
		const status = document.querySelector(`#add_${message.type}_status`);
		console.log(status);
		console.log(status.id);
		console.log(status.value);
		console.log(status.options);
		status.value = 6;
		console.log("status changed");
	}
});
