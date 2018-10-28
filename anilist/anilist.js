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
const matchOnAniListFromMAL = async (urlData) => {
	const query = {
		"query": `
		query matchFromMAL($type: MediaType, $id: Int) {
			Media(type: $type, idMal: $id) {
				id
				type
			}
		}`,
		"variables": {
			"type": urlData.type.toUpperCase(),
			"id": urlData.id,
		},
		"operationName": "matchFromMAL",
	};

	let data = null;
	let errors = null;
	try {
		// eslint-disable-next-line no-undef
		[data, errors] = await sendAniListQuery(null, query);
	} catch (e) {
		console.log("Unsuccessfully made request", e);
		return false;
	}

	if (errors) {
		return false;
	}

	return { "type": data.Media.type, "id": data.Media.id };
};

// eslint-disable-next-line no-unused-vars
const matchOnMALFromAniList = async (urlData) => {
	const query = {
		"query": `
		query matchOnMAL($type: MediaType, $id: Int) {
			Media(type: $type, id: $id) {
				idMal
				type
			}
		}`,
		"variables": {
			"type": urlData.type.toUpperCase(),
			"id": urlData.id,
		},
		"operationName": "matchOnMAL",
	};

	let data = null;
	let errors = null;
	try {
		// eslint-disable-next-line no-undef
		[data, errors] = await sendAniListQuery(null, query);
	} catch (e) {
		console.log("Unsuccessfully made request", e);
		return false;
	}

	if (errors) {
		return false;
	}

	return { "type": data.Media.type.toLowerCase(), "id": data.Media.idMal };
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
			"title": "AniList Failure",
			"message": "Is your internet working?",
		};
	}

	if (errors) {
		return {
			"title": "AniList Failure",
			"message": errors[0].message,
		};
	}

	const title = data.Media.title.userPreferred;

	const oldnotes = data.Media.mediaListEntry && data.Media.mediaListEntry.notes
		? data.Media.mediaListEntry.notes : "";
	// eslint-disable-next-line no-undef
	const notes = `${generateNote(tab.url)}`;

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
			"title": "AniList Failure",
			"message": "Is your internet working?",
		};
	}

	if (errors) {
		return {
			"title": "AniList Failure",
			"message": errors[0].message,
		};
	}

	console.log("Successfully made requests");
	return { "title": "AniList Success", "message": `Added ${title}` };
};
