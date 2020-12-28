// eslint-disable-next-line no-unused-vars
const sendAniListQuery = async (accessToken, query) => {
  const url = 'https://graphql.anilist.co';
  const urlOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
  if (accessToken) {
    urlOptions.headers.Authorization = `Bearer ${accessToken}`;
  }
  urlOptions.body = JSON.stringify(query);

  const retrieve = await fetch(url, urlOptions);
  const { data, errors } = await retrieve.json();
  console.log('retrieve', retrieve, data, errors);

  if (errors) {
    /*
     * generally means mistake in query formation, error in input (url fits format but doesn't exist),
     * error in authentication, etc.
     */
    console.log('Unsuccessfully made query', errors);
  }

  return [data, errors];
};
