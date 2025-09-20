import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    PROJECT_ID: str = os.getenv("PROJECT_ID") # google cloud project id
    BUCKET_NAME: str = os.getenv("BUCKET_NAME") # google cloud storage bucket name
    PROCESSOR_ID: str = os.getenv("PROCESSOR_ID") # document ai processor id
    PROCESSOR_LOCATION: str = os.getenv("PROCESSOR_LOCATION") # document ai processor location
    EMBEDDING_MODEL_ID: str = os.getenv("EMBEDDING_MODEL_ID", "text-embedding-004") # embedding model id
    GENERATION_MODEL_ID: str = os.getenv("GENERATION_MODEL_ID", "gemini-2.5-flash-lite") # text generation model id
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY") # gemini api key

settings = Settings()
