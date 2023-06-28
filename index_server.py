from dotenv import load_dotenv
import os
import pickle
load_dotenv()
os.environ['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY')

from multiprocessing import Lock
from multiprocessing.managers import BaseManager
from llama_index import SimpleDirectoryReader, GPTVectorStoreIndex, Document, Prompt, LLMPredictor, ServiceContext, StorageContext, load_index_from_storage
from langchain import OpenAI

index = None
stored_docs = {}
lock = Lock()

index_name = "./saved_index"
pkl_name = "stored_documents.pkl"


# define custom Prompt
TEMPLATE_STR = (
"Please find the context data provided below. \n"
"---------------------\n"
"{context_str}"
"\n---------------------\n"
"With this data in view, respond only to queries that precisely correlate with the given context. Please disregard any unrelated inquiries. Now, please answer the question: {query_str}\n"
)
QA_TEMPLATE = Prompt(TEMPLATE_STR)


def initialize_index():
    """Create a new global index, or load one from the pre-set path."""
    global index, stored_docs
    
    # define LLM
    llm_predictor = LLMPredictor(llm=OpenAI(temperature=0.1, model_name="text-davinci-003"))
    service_context = ServiceContext.from_defaults(llm_predictor=llm_predictor, chunk_size_limit=512)

    with lock:
        if os.path.exists(index_name):
            index = load_index_from_storage(StorageContext.from_defaults(persist_dir=index_name), service_context=service_context)
        else:
            index = GPTVectorStoreIndex([], service_context=service_context)
            index.storage_context.persist(persist_dir=index_name)
        if os.path.exists(pkl_name):
            with open(pkl_name, "rb") as f:
                stored_docs = pickle.load(f)


def query_index(query_text):
    """Query the global index."""
    global index
    response = index.as_query_engine(text_qa_template=QA_TEMPLATE).query(query_text)
    return response


def insert_into_index(doc_file_path, doc_id=None):
    """Insert new document into global index."""
    global index, stored_docs
    document = SimpleDirectoryReader(input_files=[doc_file_path]).load_data()[0]
    if doc_id is not None:
        document.doc_id = doc_id

    with lock:
        # Keep track of stored docs -- llama_index doesn't make this easy
        stored_docs[document.doc_id] = document.text[0:200]  # only take the first 200 chars

        index.insert(document)
        index.storage_context.persist(persist_dir=index_name)
        
        with open(pkl_name, "wb") as f:
            pickle.dump(stored_docs, f)

    return

def get_documents_list():
    """Get the list of currently stored documents."""
    global stored_doc
    documents_list = []
    for doc_id, doc_text in stored_docs.items():
        documents_list.append({"id": doc_id, "text": doc_text})

    return documents_list


if __name__ == "__main__":
    # init the global index
    print("initializing index...")
    initialize_index()

    # setup server
    # NOTE: you might want to handle the password in a less hardcoded way
    manager = BaseManager(('', 5602), b'password')
    manager.register('query_index', query_index)
    manager.register('insert_into_index', insert_into_index)
    manager.register('get_documents_list', get_documents_list)
    server = manager.get_server()

    print("server started...")
    server.serve_forever()
