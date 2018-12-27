/* eslint no-console: "off" */

browser.runtime.onMessage.addListener(async (message, sender) => {
	console.log("in search script");
	if (sender.id === browser.runtime.id) {
		if (Object.keys(message).length === 0) {
			console.log("script already exists");
			return true;
		}

		console.log(message.text);

		let urlData = false;
		let userConfirms = false;

		const removeModal = () => {
			const modal = document.querySelector("#ptw-extender-modal");
			modal.remove();
		};

		// create and display base modal
		const createModal = () => {
			const surroundingDiv = document.createElement("div");
			surroundingDiv.setAttribute("id", "ptw-extender-modal");

			const surroundingIframe = document.createElement("div");
			const mybody = document.createElement("body");
			surroundingIframe.appendChild(mybody);
			surroundingDiv.appendChild(surroundingIframe);

			const interiorDiv = document.createElement("div");
			interiorDiv.setAttribute("id", "ptw-extender-modal-content");
			mybody.appendChild(interiorDiv);

			const closeButton = document.createElement("div");
			closeButton.setAttribute("id", "ptw-extender-close-button");
			closeButton.textContent = "×"; // times symbol not x
			closeButton.addEventListener("click", removeModal);
			closeButton.addEventListener("click", () => { urlData = false; userConfirms = true; });
			interiorDiv.appendChild(closeButton);

			const changingDiv = document.createElement("div");
			changingDiv.setAttribute("id", "ptw-extender-changing");
			interiorDiv.appendChild(changingDiv);

			const source = document.createElement("p");
			source.textContent = "Thanks to AniList for having an API";
			interiorDiv.appendChild(source);

			const body = document.querySelector("body");
			body.insertAdjacentElement("afterbegin", surroundingDiv);
		};
		createModal();

		const search = async (type, text) => {
			const emptyDiv = (div) => {
				while (div.firstChild) {
					div.removeChild(div.firstChild);
				}
			};

			const displayLoading = () => {
				const div = document.querySelector("#ptw-extender-changing");
				emptyDiv(div);

				div.appendChild(document.createTextNode("Loading... please wait."));
			};
			displayLoading();

			const query = {
				"query": `
				query search($type: MediaType, $search: String) {
					Media(type: $type, search: $search) {
						id
						type
						title {
							romaji
						}
						coverImage {
							extraLarge
						}
						siteUrl
					}
				}`,
				"variables": {
					"type": type.toUpperCase(),
					"search": text,
				},
				"operationName": "search",
			};

			try {
				// eslint-disable-next-line no-undef
				const [data, errors] = await sendAniListQuery(null, query);

				console.log(data);

				const createSearchArea = () => {
					const area = document.createElement("div");

					const radioAnime = document.createElement("label");
					const rAInput = document.createElement("input");
					rAInput.setAttribute("type", "radio");
					rAInput.setAttribute("name", "ptw_extender_search_type");
					rAInput.setAttribute("value", "anime");
					radioAnime.appendChild(rAInput);
					radioAnime.appendChild(document.createTextNode("Anime"));
					area.appendChild(radioAnime);
					const radioManga = document.createElement("label");
					const rMInput = document.createElement("input");
					rMInput.setAttribute("type", "radio");
					rMInput.setAttribute("name", "ptw_extender_search_type");
					rMInput.setAttribute("value", "manga");
					radioManga.appendChild(rMInput);
					radioManga.appendChild(document.createTextNode("Manga"));
					area.appendChild(radioManga);
					if (type === "anime") {
						rAInput.setAttribute("checked", "");
					} else {
						rMInput.setAttribute("checked", "");
					}

					const textSearch = document.createElement("input");
					textSearch.setAttribute("type", "text");
					textSearch.setAttribute("name", "ptw_extender_search_name");
					textSearch.setAttribute("placeholder", "Search for title");
					textSearch.setAttribute("spellcheck", false);
					textSearch.setAttribute("value", text);
					area.appendChild(textSearch);

					const searchButton = document.createElement("input");
					searchButton.setAttribute("type", "button");
					searchButton.setAttribute("name", "ptw_extender_search_button");
					searchButton.setAttribute("value", "Search");
					searchButton.addEventListener("click", () => {
						search(document.querySelector("input[name='ptw_extender_search_type']:checked").value,
							document.querySelector("input[name='ptw_extender_search_name']").value);
					});
					area.appendChild(searchButton);

					return area;
				};

				if (errors) {
					urlData = false;
					const displayNoResults = () => {
						const div = document.querySelector("#ptw-extender-changing");
						emptyDiv(div);

						div.appendChild(createSearchArea());

						const p = document.createElement("p");
						p.appendChild(document.createTextNode(`No results found for ${type === "anime"
							? "an anime" : "a manga"} called ${text}`));
						div.appendChild(p);
					};
					displayNoResults();
				} else {
					urlData = data;
					const displayTheResult = () => {
						const div = document.querySelector("#ptw-extender-changing");
						emptyDiv(div);

						div.appendChild(createSearchArea());

						const results = document.createElement("div");

						const img = document.createElement("img");
						img.setAttribute("src", data.Media.coverImage.extraLarge);
						img.setAttribute("alt", `Cover image for the ${type} called ${text}`);
						results.appendChild(img);

						const link = document.createElement("a");
						link.setAttribute("href", data.Media.siteUrl);
						link.textContent = data.Media.title.romaji;
						results.appendChild(link);

						div.appendChild(results);

						const approvalButton = document.createElement("input");
						approvalButton.setAttribute("type", "button");
						approvalButton.setAttribute("name", "ptw_extender_approval_button");
						approvalButton.setAttribute("value", "Add to list");
						approvalButton.addEventListener("click", () => {
							urlData = { "anilist": { "id": data.Media.id, "type": data.Media.type } };
							userConfirms = true;
						});
						div.appendChild(approvalButton);
					};
					displayTheResult();
				}
			} catch (e) {
				console.log("unsuccessfully made request", e);
				urlData = false;
				userConfirms = true;
			}
		};
		search(message.type, message.text);

		const waitingOnUserConfirmation = () => new Promise((resolve) => {
			const refreshRate = 50;
			(function waiting() {
				if (userConfirms === true) {
					return resolve();
				}
				return setTimeout(waiting, refreshRate);
			}());
		});
		await waitingOnUserConfirmation();

		removeModal();

		return urlData;
	}

	return false;
});
