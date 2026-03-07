import os
import asyncio
from typing import List, TypedDict
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document
from langgraph.graph import START, StateGraph
from langchain import hub

# Assuming llm is configured properly in chatmodel.py
from chatmodel import llm 

# 1. Initialize Embeddings (Matches what you used in ingest.py)
hf_embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")

# 2. Connect to Pinecone Cloud
pinecone_api_key = os.getenv("PINECONE_API_KEY")
if not pinecone_api_key:
    raise ValueError("PINECONE_API_KEY environment variable is not set. Please check your .env file.")

os.environ["PINECONE_API_KEY"] = pinecone_api_key
index_name = os.getenv("PINECONE_INDEX_NAME", "rag-schemes-index")

vector_store = PineconeVectorStore(
    index_name=index_name, 
    embedding=hf_embeddings
)

# 3. Define LangGraph State and Nodes
class State(TypedDict):
    question: str
    context: List[Document]
    answer: str

def retrieve(state: State):
    # Searches Pinecone instead of a local folder
    retrieved_docs = vector_store.similarity_search(state["question"])
    return {"context": retrieved_docs}

def generate(state: State):
    docs_content = "\n\n".join(doc.page_content for doc in state["context"])
    prompt = hub.pull("rlm/rag-prompt")
    messages = prompt.invoke({"question": state["question"], "context": docs_content})
    response = llm.invoke(messages)
    return {"answer": response.content}

# Compile Application Graph
graph_builder = StateGraph(State).add_sequence([retrieve, generate])
graph_builder.add_edge(START, "retrieve")
graph = graph_builder.compile()

# 4. EXPORT THE FUNCTION expected by llmWrap.py
async def rag(prompt: str) -> str:
    """
    Takes a string prompt, runs it through the LangGraph RAG pipeline,
    and returns the string answer.
    """
    response = await asyncio.to_thread(graph.invoke, {"question": prompt})
    return response["answer"]