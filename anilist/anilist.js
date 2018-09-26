/* eslint no-console: "off" */

// eslint-disable-next-line no-unused-vars
const matchOnAniList = (url) => {
	const matchAniList = url.match(/^https?:\/\/(?:www\.)?anilist\.co\/(anime|manga)\/(\d+).*$/);
	if (matchAniList) {
		const urlData = {
			"type": matchAniList[1],
			"id": matchAniList[2],
		};
		console.log("AniList match success");
		console.log(`${urlData.type} ${urlData.id}`);
		return urlData;
	}
	return false;
};

// eslint-disable-next-line no-unused-vars
const handleAniList = async (tab, urlData, options) => {
	const queryRetrieveNotes = {
		"query": `
		query retrieveNotes($type: MediaType, $id: Int) {
			Media(type: $type, id: $id) {
				title {
					userPreferred
				}
				mediaListEntry {
					notes
					customLists(asArray:false)
					user {
						id
					}
				}
			}
		}`,
		"variables": {
			"type": urlData.type.toUpperCase(),
			"id": urlData.id,
		},
		"operationName": "retrieveNotes",
	};

	const queryReplaceNotes = {
		"query": `
		mutation replaceNotes($id: Int, $status: MediaListStatus, $notes: String, $customLists: [String],
			$private: Boolean, $hiddenFromStatusLists: Boolean) {
			SaveMediaListEntry(mediaId: $id, status: $status, notes: $notes, customLists: $customLists,
			private: $private, hiddenFromStatusLists: $hiddenFromStatusLists) {
				status
				notes
				customLists(asArray: false)
				private
				hiddenFromStatusLists
			}
		}`,
		"operationName": "replaceNotes",
	};

	let data = null;
	let errors = null;
	try {
		// eslint-disable-next-line no-undef
		[data, errors] = await sendAniListQuery(options.accessToken, queryRetrieveNotes);
	} catch (e) {
		console.log("Unsuccessfully made request", e);
		return {
			"title": "Failure",
			"message": "Failed to add title to your AniList PTW list - is your internet working?",
		};
	}

	if (errors) {
		return {
			"title": "Failure",
			"message": "Failed to add title to your AniList PTW list - did you authenticate yourself?",
		};
	}

	const title = data.Media.title.userPreferred;

	const oldnotes = data.Media.mediaListEntry && data.Media.mediaListEntry.notes
		? data.Media.mediaListEntry.notes : "";
	const notes = `${new Date().toLocaleString()} -> ${tab.url}`;

	const variables = { "id": urlData.id };

	if (data.Media.mediaListEntry === null) {
		variables.notes = notes;
		variables.status = "PLANNING";
		variables.private = options.private;
		variables.hiddenFromStatusLists = options.hiddenFromStatusLists;
	} else {
		variables.notes = `${oldnotes}\n${notes}`;
		// presumably user has everything else how they like it except for the customlist
	}
	const newCustomLists = urlData.type === "anime" ? options.customListsAnime : options.customListsManga;
	const newCustomListsArray = Object.keys(newCustomLists).filter((list) => newCustomLists[list]);
	const oldCustomLists = data.Media.mediaListEntry && data.Media.mediaListEntry.customLists
		? data.Media.mediaListEntry.customLists : {};
	const oldCustomListsArray = Object.keys(oldCustomLists).filter((list) => oldCustomLists[list]);
	variables.customLists = newCustomListsArray.concat(oldCustomListsArray);
	console.log(variables);

	queryReplaceNotes.variables = variables;
	try {
		// eslint-disable-next-line no-undef
		[data, errors] = await sendAniListQuery(options.accessToken, queryReplaceNotes);
	} catch (e) {
		console.log("Unsuccessfully made request", e);
		return {
			"title": "Failure",
			"message": "Failed to add title to your AniList PTW list - is your internet working?",
		};
	}

	if (errors) {
		return {
			"title": "Failure",
			"message": "Failed to add title to your AniList PTW list - did you authenticate yourself?",
		};
	}

	console.log("Successfully made requests");
	return { "title": "Success", "message": `Added ${title} to your AniList PTW list` };
};
