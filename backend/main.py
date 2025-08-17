from typing import Union
from pydantic import BaseModel
from fastapi import FastAPI, Request, Depends
from rag import rag,load_and_process_docs
import asyncio
from database import SessionLocal, Base, engine
from model import users, chatgroups, chats
from sqlalchemy.orm import Session, sessionmaker

Base.metadata.create_all(bind=engine)
class TextRequest(BaseModel):
    text: str

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
async def startup_event():
    await load_and_process_docs()

@app.post("/")
def prompt(request: TextRequest, db: Session = Depends(get_db)):
    if not request.text:
        return {"error": "No text provided"}
    
    response = asyncio.run(rag(request.text))
    db.add(chats(user_id=1, chatgroup_id=1, question=request.text, answer=response))
    db.commit()
    return {"data": response}