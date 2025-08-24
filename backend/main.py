from typing import Union
from pydantic import BaseModel
from fastapi import FastAPI, Request, Depends
from rag import load_and_process_docs
from llmWrap import finalize_response
import asyncio
from database import SessionLocal, Base, engine
from model import users, chatgroups, chats
from sqlalchemy.orm import Session, sessionmaker
from fastapi.middleware.cors import CORSMiddleware


origins = [
    "http://localhost:5173",  # Your frontend application's URL
    "http://127.0.0.1:5173",
]



Base.metadata.create_all(bind=engine)
class TextRequest(BaseModel):
    text: str

class PromptInput(BaseModel):
    groupid: int
    prompt: str


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Allows specific origins
    allow_credentials=True, # Allows cookies and authentication headers
    allow_methods=["*"],    # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],    # Allows all headers
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
async def startup_event():
    await load_and_process_docs()

@app.post("/chat")
def prompt(request: PromptInput, db: Session = Depends(get_db)):
    if not request.prompt:
        return {"error": "No prompt provided"}

    response = asyncio.run(finalize_response(request.prompt))
    db.add(chats(user_id=1, chatgroup_id=request.groupid, question=request.prompt, answer=response))
    db.commit()
    return {"data": response}
@app.get("/groups")
def get_groups(db: Session = Depends(get_db)):
    groups = db.add(chatgroups(user_id=1))
    db.commit()
    db.refresh(groups)

    # The new_group object now has its ID populated
    new_group_id = groups.id
    return {"id": new_group_id}