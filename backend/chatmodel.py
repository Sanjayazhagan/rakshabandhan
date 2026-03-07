import getpass
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get Google API key from environment variable
google_api_key = os.getenv("GOOGLE_API_KEY")

if not google_api_key:
    google_api_key = getpass.getpass("Enter API key for Google Gemini: ")

os.environ["GOOGLE_API_KEY"] = google_api_key

from langchain.chat_models import init_chat_model
from langchain_google_genai import ChatGoogleGenerativeAI

llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")
llm1 = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    google_api_key=google_api_key,
    max_retries=2
)