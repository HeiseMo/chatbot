import { API_BASE_URL } from './../config';

const fetchDocuments = async () => {
  const response = await fetch(`${API_BASE_URL}/getDocuments`, { mode: 'cors' });

  if (!response.ok) {
    return [];
  }

  const documentList = await response.json();
  return documentList;
};

export default fetchDocuments;
