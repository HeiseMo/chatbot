import { API_BASE_URL } from './../config';

const queryIndex = async (query) => {
  const queryURL = new URL(`${API_BASE_URL}/query?`);
  queryURL.searchParams.append('text', query);

  const response = await fetch(queryURL, { mode: 'cors' });
  if (!response.ok) {
    return { text: 'Error in query', sources: [] };
  }

  const queryResponse = await response.json();

  return queryResponse;
};

export default queryIndex;
