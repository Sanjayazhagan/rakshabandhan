from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr

class TextRequest(BaseModel):
    text: str

class PromptInput(BaseModel):
    groupid: int
    prompt: str

class AudioRequest(BaseModel):
    groupid: int
    audio: bytes 

class UserCreate(BaseModel):
    email: EmailStr
    hashed_password: str
    name: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
