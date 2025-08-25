import getpass
import os

if not os.environ.get("GOOGLE_API_KEY"):
  os.environ["GOOGLE_API_KEY"] = getpass.getpass("Enter API key for Google Gemini: ")

from langchain.chat_models import init_chat_model
from langchain_google_genai import ChatGoogleGenerativeAI

llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")
llm1 = ChatGoogleGenerativeAI(model="gemini-2.5-flash",
  temperature=0,
  google_api_key=os.environ["GOOGLE_API_KEY"],
  max_retries=2
)