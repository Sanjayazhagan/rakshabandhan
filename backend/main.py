from typing import Union
from pydantic import BaseModel, Field
from fastapi import FastAPI, Request, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import update, delete
from dotenv import load_dotenv
import os
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import logging

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 1. Removed load_and_process_docs import
from llmWrap import finalize_response
from audiototext import audio_to_text
from database import SessionLocal, Base, engine
from model import users, chatgroups, chats

# Get CORS origins from environment or use defaults
cors_origins_str = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:5173,http://127.0.0.1:5173"
)
origins = [origin.strip() for origin in cors_origins_str.split(",")]

# Get database cleanup settings from environment
ENABLE_DB_CLEANUP = os.getenv("ENABLE_DB_CLEANUP", "True").lower() == "true"
DB_CLEANUP_INTERVAL_HOURS = int(os.getenv("DB_CLEANUP_INTERVAL_HOURS", "24"))

Base.metadata.create_all(bind=engine)

class TextRequest(BaseModel):
    text: str

class PromptInput(BaseModel):
    groupid: int
    prompt: str

class AudioRequest(BaseModel):
    groupid: int
    audio: bytes 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],    
    allow_headers=["*"],    
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============================================
# Database Cleanup Scheduler
# ============================================

def cleanup_database():
    """Clear all chat data from the database every 24 hours"""
    db = SessionLocal()
    try:
        # Delete all chats
        deleted_chats = db.query(chats).delete()
        # Delete all chatgroups
        deleted_groups = db.query(chatgroups).delete()
        # Commit the deletions
        db.commit()
        
        logger.info(f"Database cleanup completed. Deleted {deleted_chats} chats and {deleted_groups} chat groups.")
    except Exception as e:
        logger.error(f"Error during database cleanup: {str(e)}")
        db.rollback()
    finally:
        db.close()

# Initialize scheduler
scheduler = BackgroundScheduler()

@app.on_event("startup")
async def startup_event():
    """Initialize scheduler when the application starts"""
    if ENABLE_DB_CLEANUP:
        # Add job to scheduler
        scheduler.add_job(
            cleanup_database,
            IntervalTrigger(hours=DB_CLEANUP_INTERVAL_HOURS),
            id="db_cleanup_job",
            name="Database Cleanup Job",
            replace_existing=True
        )
        # Start the scheduler
        scheduler.start()
        logger.info(f"Database cleanup scheduler started. Cleanup will run every {DB_CLEANUP_INTERVAL_HOURS} hours.")
    else:
        logger.info("Database cleanup is disabled. Set ENABLE_DB_CLEANUP=True to enable.")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown scheduler when the application stops"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Database cleanup scheduler stopped.")

# 3. FIXED: Changed to `async def` and `await`
@app.post("/chat")
async def prompt(request: PromptInput, db: Session = Depends(get_db)):
    if not request.prompt:
        return {"error": "No prompt provided"}

    # No more asyncio.run() - use await directly
    response = await finalize_response(request.prompt)
    
    db.add(chats(user_id=1, chatgroup_id=request.groupid, question=request.prompt, answer=response))
    db.commit()
    
    smt = update(chatgroups).where(chatgroups.id == request.groupid).values(name=request.prompt)
    db.execute(smt)
    db.commit()
    
    return {"data": response}

@app.post("/chat/audio")
async def audio_prompt(
    groupid: int = Form(...),
    audio: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not audio.file:
        return {"error": "No audio provided"}
    
    audio_bytes = await audio.read()
    audio_mime_type = audio.content_type

    question = await audio_to_text(audio_bytes, audio_mime_type)
    response = await finalize_response(question)
    
    db.add(chats(user_id=1, chatgroup_id=groupid, question=question, answer=response))
    db.commit()
    
    smt = update(chatgroups).where(chatgroups.id == groupid).values(name=question)
    db.execute(smt)
    db.commit() # Added a commit here just to be safe after execute
    return {"question": question, "data": response}

@app.get("/groups/{group_id}")
def get_group(group_id: int, db: Session = Depends(get_db)):
    group = db.query(chats.question, chats.answer).filter(chats.chatgroup_id == group_id).all()
    if not group:
        return {"data": []}
    
    dict_group = [{"question": q, "answer": a} for q, a in group]
    return {"data": dict_group}

@app.post("/users/{userId}")
def new_groups(userId: int, db: Session = Depends(get_db)):
    new_group = chatgroups(user_id=userId, name="")
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    return {"id": new_group.id}

@app.get("/user/{user_id}")
def get_groups(user_id: int, db: Session = Depends(get_db)):
    groups = db.query(chatgroups).filter(chatgroups.user_id == user_id).all()
    if not groups:
        return []

    dict_groups = [{"id": group.id, "name": group.name} for group in groups]
    return dict_groups