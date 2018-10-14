/* eslint no-console: "off" */

// eslint-disable-next-line no-unused-vars
const matchOnKitsu = (url) => {
	const matchKitsu = url.match(/^https?:\/\/(?:www\.)?kitsu\.io\/(anime|manga)\/(.*)$/);
	if (matchKitsu) {
		const urlData = {
			"type": matchKitsu[1],
			"name": matchKitsu[2],
		};
		console.log("Kitsu match success");
		console.log(`${urlData.type} ${urlData.name}`);
		return urlData;
	}
	return false;
};

const sendKitsuQuery = async (accessToken, method, query, body) => {
	const url = `https://kitsu.io/api/edge/${query}`;
	const urlOptions = {
		"method": method,
		"headers": {
			"Authorization": `Bearer ${accessToken}`,
			"Content-Type": "application/vnd.api+json",
			"Accept": "application/vnd.api+json",
		},
	};
	if (body) {
		urlOptions.body = JSON.stringify(body);
	}
	const retrieve = await fetch(url, urlOptions);
	const { data, meta, errors } = await retrieve.json();
	console.log("retrieve", retrieve, data, meta, errors);

	if (errors) {
		/*
		 * generally means mistake in query formation, error in input (url fits format but doesn't exist),
		 * error in authentication, etc.
		*/
		console.log("Unsuccessfully made query", errors);
	}

	return [data, meta, errors];
};

// eslint-disable-next-line no-unused-vars
const handleKitsu = async (tab, urlData, options) => {
	if (options.accessToken === null) {
		return {
			"title": "Failure",
			"message": "Failed to add title to your Kitsu PTW list - did you authenticate yourself?",
		};
	}

	let data = null;
	let meta = null;
	let errors = null;
	try {
		[data, meta, errors] = await sendKitsuQuery(options.accessToken, "GET",
			`${urlData.type}?filter[slug]=${urlData.name}`);
	} catch (e) {
		console.log("Unsuccessfully made request", e);
		return {
			"title": "Failure",
			"message": "Failed to add title to your Kitsu PTW list - is your internet working?",
		};
	}

	if (errors) {
		return {
			"title": "Failure",
			"message": "Failed to add title to your Kitsu PTW list - did you authenticate yourself?",
		};
	}

	const { "id": titleId, "type": mediaType } = data[0];
	const { "canonicalTitle": title } = data[0].attributes;

	try {
		[data, meta, errors] = await sendKitsuQuery(options.accessToken, "GET", "users?filter[self]=true");
	} catch (e) {
		console.log("Unsuccessfully made request", e);
		return {
			"title": "Failure",
			"message": "Failed to add title to your Kitsu PTW list - is your internet working?",
		};
	}

	if (errors) {
		return {
			"title": "Failure",
			"message": "Failed to add title to your Kitsu PTW list - did you authenticate yourself?",
		};
	}

	const { "id": userId } = data[0];

	try {
		[data, meta, errors] = await sendKitsuQuery(options.accessToken, "GET",
			`library-entries?filter[userId]=${userId}&filter[${mediaType}Id]=${titleId}`);
	} catch (e) {
		console.log("Unsuccessfully made request", e);
		return {
			"title": "Failure",
			"message": "Failed to add title to your Kitsu PTW list - is your internet working?",
		};
	}

	if (errors) {
		return {
			"title": "Failure",
			"message": "Failed to add title to your Kitsu PTW list - did you authenticate yourself?",
		};
	}

	let entryId = null;
	let notes = null;
	if (meta.count !== 0) {
		// eslint's parser can't handle the destructured syntax in this specific case
		// eslint-disable-next-line prefer-destructuring
		entryId = data[0].id;
		// eslint-disable-next-line prefer-destructuring
		notes = data[0].attributes.notes;
	}
	// eslint-disable-next-line no-undef
	notes = `${(notes === null || notes === "" ? "" : `${notes}\n`)}${generateNote(tab.url)}`;

	try {
		const entryType = "libraryEntries";
		if (meta.count !== 0) {
			[data, meta, errors] = await sendKitsuQuery(options.accessToken, "PATCH",
				`library-entries/${entryId}`, {
					"data": {
						"type": entryType,
						"id": entryId,
						"attributes": {
							"notes": notes,
						},
					},
				});
		} else {
			[data, meta, errors] = await sendKitsuQuery(options.accessToken, "POST",
				"library-entries/", {
					"data": {
						"type": entryType,
						"attributes": {
							"status": "planned",
							"notes": notes,
							"private": options.private,
						},
						"relationships": {
							"user": {
								"data": {
									"type": "users",
									"id": userId,
								},
							},
							[mediaType]: {
								"data": {
									"type": mediaType,
									"id": titleId,
								},
							},
						},
					},
				});
		}
	} catch (e) {
		console.log("Unsuccessfully made request", e);
		return {
			"title": "Failure",
			"message": "Failed to add title to your Kitsu PTW list - is your internet working?",
		};
	}

	if (errors) {
		return {
			"title": "Failure",
			"message": "Failed to add title to your Kitsu PTW list - did you authenticate yourself?",
		};
	}

	console.log("Successfully made requests");
	return { "title": "Success", "message": `Added ${title} to your Kitsu PTW list` };
};
