import { API_BASE_URL } from './../config';

const insertDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('filename_as_doc_id', 'true');

  const response = await fetch(`${API_BASE_URL}/uploadFile`, {
    mode: 'cors',
    method: 'POST',
    body: formData,
  });

  const responseText = await response.text();
  return responseText;
};

export default insertDocument;
