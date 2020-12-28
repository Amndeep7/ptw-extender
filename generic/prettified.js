const createPrettifiedCommentsBox = (commentsBox) => {
  const surroundingDiv = document.createElement('div');
  surroundingDiv.setAttribute('id', 'prettifiedCommentsBox');
  surroundingDiv.setAttribute('class', 'inputtext');

  const replaceDiv = () => {
    while (surroundingDiv.firstChild) {
      surroundingDiv.removeChild(surroundingDiv.firstChild);
    }

    commentsBox.value.split('\n').forEach((line) => {
      const p = document.createElement('p');
      const lineNode = document.createTextNode(line);
      p.appendChild(lineNode);
      surroundingDiv.appendChild(p);
    });

    // eslint-disable-next-line no-undef
    linkifyElement(surroundingDiv);
  };
  replaceDiv();

  commentsBox.insertAdjacentElement('beforebegin', surroundingDiv);
  commentsBox.addEventListener('input', () => {
    replaceDiv();
  });
  console.log('created prettified comment area');

  return surroundingDiv;
};

(async () => {
  // have to wait for the website to make itself before I can add my box
  let lock = false;
  const intervalId = setInterval(async () => {
    if (lock) {
      return;
    }
    lock = true;

    let prettify = null;
    try {
      prettify = await browser.storage.sync.get();
      prettify = prettify.v1.checkbox.extension_prettifyCommentsBox;
    } catch (e) {
      console.log('error in getting prettify option');
      return;
    }

    if (prettify) {
      let hasntBeenMade = true;
      const insertCommentsBox = () => {
        const prettifiedCommentsBox = document.querySelector('#prettifiedCommentsBox');
        if (prettifiedCommentsBox === null && hasntBeenMade) {
          // eslint-disable-next-line no-undef
          const commentsBox = document.querySelector(commentsBoxQuery);
          if (commentsBox !== null) {
            hasntBeenMade = false;
            // have to wait for the comment box to be filled with text from the website side
            // before being able to copy it ourselves
            setTimeout(
              // eslint-disable-next-line no-undef
              () => applyCSS(createPrettifiedCommentsBox(commentsBox)),
              50
            );
          }
        } else if (prettifiedCommentsBox !== null) {
          hasntBeenMade = true;
        }
      };
      insertCommentsBox();

      // eslint-disable-next-line no-undef
      if (parentNodeQuery === null) {
        clearInterval(intervalId);
      }
      // eslint-disable-next-line no-undef
      const parentNode = document.querySelector(parentNodeQuery);
      if (parentNode !== null) {
        const options = { childList: true, subtree: true };

        const callback = (mutationRecords) => {
          console.log(mutationRecords);
          insertCommentsBox();
        };

        const observer = new MutationObserver(callback);
        observer.observe(parentNode, options);

        clearInterval(intervalId);
      }

      lock = false;
    }
  }, 50);
})();
