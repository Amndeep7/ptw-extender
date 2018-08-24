/* eslint no-console: off */

browser.runtime.onMessage.addListener((message, sender) => {
	console.log("in content script");
	console.log(`${message}`);
	console.log(`${sender.id}\n${browser.runtime.id}`);
	if (sender.id === browser.runtime.id) {
		if (document.querySelector("#myanimelist")) {
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
					}
					break;
				case "manga":
					if (haventstarted.includes(document.querySelector("#add_manga_num_read_volumes").value)
						&& haventstarted.includes(document.querySelector("#add_manga_num_read_chapters").value)) {
						status.value = 6;
						console.log("status changed");
					}
					break;
				default:
					console.log("message.type is unknown", message.type);
					return Promise.resolve(false);
				}
			}
			return Promise.resolve(true);
		}
	}
	return Promise.resolve(false);
});
