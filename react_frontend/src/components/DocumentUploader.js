import { useState } from 'react';
import { CircleLoader } from 'react-spinners';
import insertDocument from '../apis/insertDocument';

const DocumentUploader = ({ setRefreshViewer }) => {
  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const changeHandler = (event) => {
    if (event.target && event.target.files) {
      setSelectedFile(event.target.files[0]);
      setIsFilePicked(true);
    }
  };

  const handleSubmission = () => {
    if (selectedFile) {
      setIsLoading(true);
      insertDocument(selectedFile).then(() => {
        setRefreshViewer(true);
        setSelectedFile(undefined);
        setIsFilePicked(false);
        setIsLoading(false);
      });
    }
  };

  return (
    <div className='uploader'>
      {
        <>
          <input
            className='uploader__input'
            type='file'
            name='file-input'
            id='file-input'
            accept='.pdf,.txt,.json,.md'
            onChange={changeHandler}
          />
          <label className='uploader__label' htmlFor='file-input'>
            {/* SVG content omitted for brevity */}
            <span>Upload file</span>
          </label>
          {isFilePicked && selectedFile ? (
            <div className='uploader__details'>
              <p>{selectedFile.name}</p>
            </div>
          ) : (
            <div className='uploader__details'>
              <p>Select a file to insert</p>
            </div>
          )}

          {isFilePicked && !isLoading && (
            <button className='uploader__btn' onClick={handleSubmission}>
              Submit
            </button>
          )}
          {isLoading && <CircleLoader color='#00f596' className='uploader__loader' />}
        </>
      }
    </div>
  );
};

export default DocumentUploader;