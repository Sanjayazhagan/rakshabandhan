# import os
# from langchain_community.document_loaders import PyPDFLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_pinecone import PineconeVectorStore
# from embeddingmodel import embeddings

# # Set your API Keys
# os.environ["PINECONE_API_KEY"] = "pcsk_32DTpG_8Urs754kXuXqV8VTWjRT4m8Fy7ZhyvBUuNixy7k3bQUuLjS7cmT7AgXmCR8Vmz5"
import os
import time
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore
from langchain_huggingface import HuggingFaceEmbeddings

# Load environment variables from .env file
load_dotenv()

# Get Pinecone API key from environment variable
pinecone_api_key = os.getenv("PINECONE_API_KEY")
if not pinecone_api_key:
    raise ValueError("PINECONE_API_KEY environment variable is not set. Please check your .env file.")

os.environ["PINECONE_API_KEY"] = pinecone_api_key

def ingest_pdf():
    # Load and Split
    file_path = "./data/All_Schemes_merged.pdf"
    loader = PyPDFLoader(file_path)
    docs = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    all_splits = text_splitter.split_documents(docs)
    
    print(f"Loaded {len(all_splits)} chunks.")
    
    # 2. Connect to Pinecone to manage Indexes
    pc = Pinecone(api_key=pinecone_api_key)
    index_name = os.getenv("PINECONE_INDEX_NAME", "rag-schemes-index")
    
    # 3. Create the index automatically if it is missing
    if index_name not in pc.list_indexes().names():
        print(f"Index '{index_name}' not found. Creating it now...")
        pc.create_index(
            name=index_name,
            dimension=384, # REQUIRED for BAAI/bge-small-en-v1.5
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1" # Standard free tier region
            )
        )
        print("Waiting for Pinecone to initialize the index...")
        while not pc.describe_index(index_name).status['ready']:
            time.sleep(2)
        print("Index is ready!")
    
    # 4. Embed and Upload
    print("Embedding and uploading chunks to Pinecone (this might take a minute)...")
    embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")
    
    PineconeVectorStore.from_documents(
        all_splits, 
        embeddings, 
        index_name=index_name
    )
    print("Success! All documents are safely stored in the cloud.")

if __name__ == "__main__":
    ingest_pdf()