// eslint-disable-next-line no-unused-vars
const parentNodeQuery = "body > div.ember-view";

// eslint-disable-next-line no-unused-vars
const commentsBoxQuery = "textarea";

// eslint-disable-next-line no-unused-vars
const applyCSS = (prettifiedCommentsBox) => {
	prettifiedCommentsBox.setAttribute("class", "form-control ember-view");
	prettifiedCommentsBox.setAttribute("style", "margin-bottom: 1em; overflow-wrap: break-word;");
};
