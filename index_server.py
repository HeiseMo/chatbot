from dotenv import load_dotenv
import os
import pickle
from multiprocessing import Lock
from multiprocessing.managers import BaseManager
from llama_index import (
    SimpleDirectoryReader,
    GPTVectorStoreIndex,
    Document,
    Prompt,
    LLMPredictor,
    ServiceContext,
    StorageContext,
    load_index_from_storage,
)
from langchain import OpenAI

load_dotenv()
os.environ['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY')

index = None
stored_docs = {}
lock = Lock()

index_name = "./saved_index"
pkl_name = "stored_documents.pkl"

# Define custom Prompt
TEMPLATE_STR = (
    "3B Scientific, founded in 1948 in Hamburg, Germany, has become a global leader in manufacturing Medical and Science Education solutions. They offer a comprehensive range of products that include medical simulators, anatomy models, health education materials, acupuncture supplies, physical therapy equipment, student lab equipment, and more. The company is represented in over 120 countries and stands for best quality, best value, and best service. \n\n"
    "In recent years, 3B Scientific has acquired Cardionics, the leader in auscultation simulation products, and iSimulate, which develops patient monitoring and defibrillation simulation solutions. Today, the 3B Scientific group is a worldwide leader in the anatomy market, ensuring the best quality products with competitive value and flexibility in processing customer requirements.\n\n"
    "The company has a wide international presence with offices in various countries including the US, France, Japan, UK, and more. With 460 dedicated employees, 3B Scientific aims to continue its success and steady growth, always striving to be and remain number 1 in the world.\n\n"
    "---------------------\n"
    "{context_str}"
    "\n---------------------\n"
    "Given the information provided above and any additional context provided, please only respond to queries that accurately align with the context given. Any unrelated inquiries should be definetly disregarded. Now, please answer the question: {query_str}\n"
)
QA_TEMPLATE = Prompt(TEMPLATE_STR)



def initialize_index():
    """Create a new global index, or load one from the pre-set path."""
    global index, stored_docs

    # Define LLM
    llm_predictor = LLMPredictor(llm=OpenAI(temperature=0.1, model_name="text-davinci-003"))
    service_context = ServiceContext.from_defaults(llm_predictor=llm_predictor, chunk_size_limit=512)

    with lock:
        if os.path.exists(index_name):
            index = load_index_from_storage(
                StorageContext.from_defaults(persist_dir=index_name), service_context=service_context
            )
        else:
            index = GPTVectorStoreIndex([], service_context=service_context)
            index.storage_context.persist(persist_dir=index_name)
        if os.path.exists(pkl_name):
            with open(pkl_name, "rb") as f:
                stored_docs = pickle.load(f)


def query_index(query_text, chat_history=None):
    """Query the global index."""
    global index

    # If there is chat history, convert it into a list of previous exchanges
    # We expect chat_history to be a list of tuples where each tuple represents
    # an exchange in the format: ('user', 'User message'), ('agent', 'Agent message')
    previous_exchanges = []
    if chat_history:
        for exchange in chat_history:
            previous_exchanges.append(exchange)

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


def get_documents_list():
    """Get the list of currently stored documents."""
    global stored_docs
    documents_list = []
    for doc_id, doc_text in stored_docs.items():
        documents_list.append({"id": doc_id, "text": doc_text})

    return documents_list


if __name__ == "__main__":
    # Init the global index
    print("Initializing index...")
    initialize_index()

    # Setup server
    # NOTE: You might want to handle the password in a less hardcoded way
    manager = BaseManager(("", 5602), b"password")
    manager.register("query_index", query_index)
    manager.register("insert_into_index", insert_into_index)
    manager.register("get_documents_list", get_documents_list)
    server = manager.get_server()

    print("Server started...")
    server.serve_forever()
