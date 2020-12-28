// eslint-disable-next-line no-unused-vars
const parentNodeQuery = '#app';

// eslint-disable-next-line no-unused-vars
const commentsBoxQuery = 'div.form.notes > div.el-textarea > textarea';

// eslint-disable-next-line no-unused-vars
const applyCSS = (prettifiedCommentsBox) => {
  prettifiedCommentsBox.setAttribute('class', 'el-textarea__inner');
  prettifiedCommentsBox.setAttribute('style', 'margin-bottom: 1em;');
};
