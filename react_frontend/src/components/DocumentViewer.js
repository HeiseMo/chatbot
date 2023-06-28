import { useState } from 'react';

const MAX_TITLE_LENGTH = 32;
const MAX_DOC_LENGTH = 150;

const DocumentViewer = ({ documentList }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedDocument, setExpandedDocument] = useState(null);

  const prepend = (array, value) => {
    const newArray = array.slice();
    newArray.unshift(value);
    return newArray;
  };

  let documentListElems = documentList.map((document) => {
    const id = document.id;
    const isThisExpandedDocument = expandedDocument === id;
    const text = isThisExpandedDocument 
      ? document.text
      : (document.text.length < MAX_DOC_LENGTH
        ? document.text
        : document.text.substring(0, MAX_DOC_LENGTH) + '...'
      );

    return (
      <div key={id} className='viewer__list__item' onClick={() => setExpandedDocument(isThisExpandedDocument ? null : id)}>
        <p className='viewer__list__title'>{id}</p>
      </div>
    );
  });

  documentListElems = prepend(
    documentListElems,
    <div key='viewer_title' className='viewer__list__item'>
      <p className='viewer__list__header'>My Documents</p>
    </div>
  );

  return (
    <div className='viewer'>
      <button 
        className={`viewer__expandButton ${isExpanded ? 'expanded' : 'collapsed'}`} 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Collapse' : 'View Documents'}
      </button>
      <div className={`viewer__list ${isExpanded ? 'expanded' : ''}`}>
        {documentListElems.length > 0 ? (
          documentListElems
        ) : (
          <div>
            <p className='viewer__list__title'>Upload your first document!</p>
            <p className='viewer__list__text'>
              You will see the title and content here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
