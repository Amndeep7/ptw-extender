/* eslint no-console: off */

browser.runtime.onMessage.addListener((message, sender) => {
	console.log("in sourceadder script");
	console.log(`${message}`);
	console.log(`${sender.id}\n${browser.runtime.id}`);
	if (sender.id === browser.runtime.id && message.id && message.id === "sourceadder") {
		if (document.querySelector("#myanimelist")) {
			const showAdvancedButton = document.querySelector("#show-advanced-button");
			if (showAdvancedButton.style.length === 0) {
				const advanced = document.querySelector("#advanced-button");
				advanced.click();
			}
			console.log("displaying advanced section");

			const tags = document.querySelector(`#add_${message.type}_tags`);
			if (tags.value.length === 0) {
				tags.value = message.options.tags;
			} else {
				tags.value += `${"\n"}${message.options.tags}`;
			}
			console.log("tags added");

			const comments = document.querySelector(`#add_${message.type}_comments`);
			// eslint-disable-next-line no-undef
			const comment = `${generateNote(message.taburl)}`;
			if (comments.value.length === 0) {
				comments.value = comment;
			} else {
				comments.value += `${"\n"}${comment}`;
			}
			console.log("text added");

			let wasntstarted = false;
			const status = document.querySelector(`#add_${message.type}_status`);
			console.log(status);
			console.log(status.id);
			console.log(status.value);
			console.log(status.options);
			// only change status if it's watching/reading cause watching/reading is the default status
			if (status.value === "1") {
				console.log("status is watching");
				// only change status if the count is at 0 which presumably means that user hasn't started it
				const haventstarted = ["", 0, "0"];
				switch (message.type) {
				case "anime":
					if (haventstarted.includes(document.querySelector("#add_anime_num_watched_episodes").value)) {
						status.value = 6;
						console.log("status changed");

						wasntstarted = true;
					}
					break;
				case "manga":
					if (haventstarted.includes(document.querySelector("#add_manga_num_read_volumes").value)
						&& haventstarted.includes(document.querySelector("#add_manga_num_read_chapters").value)) {
						status.value = 6;
						console.log("status changed");

						wasntstarted = true;
					}
					break;
				default:
					console.log("message.type is unknown", message.type);
					return Promise.resolve(false);
				}
			}

			const priority = document.querySelector(`#add_${message.type}_priority`);
			console.log(priority);
			// only override if the value is the default of low and wasn't started
			if (priority.value === "0" && wasntstarted) {
				console.log("priority is low");
				switch (message.options.priority) {
				case "medium":
					priority.value = 1;
					break;
				case "high":
					priority.value = 2;
					break;
				default:
					priority.value = 1;
				}
			}

			const title = document.querySelectorAll("#main-form > table > tbody > tr")[0].children[1]
				.textContent.trim();
			return Promise.resolve(title);
		}
	}
	return Promise.resolve(false);
});
