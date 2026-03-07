# Rakshabandhan - Complete Documentation

## Table of Contents

1. [Architecture](#architecture)
2. [Backend Components](#backend-components)
3. [Frontend Components](#frontend-components)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [Configuration](#configuration)
7. [Deployment](#deployment)

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/Vite)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Chat UI │ Sidebar │ Input Bar │ Audio Processing   │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼────────────────────────────────────┐
│                  FastAPI Backend Server                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Routes │ RAG │ LLM Wrapper │ Audio-to-Text     │   │
│  └──────────────────────────────────────────────────────┘   │
└────┬──────────────────────────────────────────────────┬─────┘
     │                                                  │
     ▼                                                  ▼
┌─────────────────────┐                       ┌──────────────┐
│   PostgreSQL DB     │                       │ Chroma Vector│
│  - Users            │                       │   Database   │
│  - Chat Groups      │                       │ - Documents  │
│  - Messages         │                       │ - Embeddings │
└─────────────────────┘                       └──────────────┘
```

### Data Flow

1. **User sends message** → Frontend validates and sends to `/chat` endpoint
2. **Backend receives message** → Stored in database
3. **RAG system activates** → Retrieves relevant documents from vector store
4. **LLM processes** → Combines user input with retrieved context
5. **Response generated** → Sent back to frontend
6. **UI updates** → Chat bubbles displayed to user

---

## Backend Components

### main.py - API Server

**Purpose**: FastAPI application with REST endpoints

**Key Endpoints**:

```python
# Chat endpoints
POST /chat              # Text-based chat
POST /chat/audio        # Audio-based chat

# Group management
POST /users/{userId}    # Create new chat group
GET /user/{user_id}     # List user's chat groups
GET /groups/{group_id}  # Get chat history
```

**Startup Event**:
- Loads and processes documents into the vector store
- Runs once when server starts

### model.py - Database Models

**SQLAlchemy ORM Models**:

```python
class users:
    - id (Primary Key)
    - name

class chatgroups:
    - id (Primary Key)
    - name (Chat group name)
    - user_id (Foreign Key)
    - created_at (Timestamp)

class chats:
    - id (Primary Key)
    - user_id (Foreign Key)
    - chatgroup_id (Foreign Key)
    - question (User's message)
    - answer (AI's response)
```

### rag.py - RAG Implementation

**Features**:
- Document loading and chunking
- Embedding generation
- Vector store (Chroma) management
- Semantic document retrieval

**Key Functions**:
- `load_and_process_docs()` - Initialize and load documents
- `retrieve_relevant_docs()` - Find relevant documents for query

### llmWrap.py - LLM Wrapper

**Purpose**: Interface with the language model

**Key Functions**:
- `finalize_response(prompt)` - Get LLM response with RAG context
- Handles prompt engineering
- Manages token limits

### embeddingmodel.py - Embedding Model

**Purpose**: Generate embeddings for documents and queries

**Features**:
- Text-to-vector conversion
- Semantic similarity computation
- Integration with vector store

### audiototext.py - Audio Processing

**Purpose**: Convert audio to text

**Supported Formats**:
- MP3, WAV, OGG, M4A, etc.

**Process**:
1. Receive audio bytes
2. Process with audio model
3. Return transcribed text

### vectorStore.py - Vector Database

**Purpose**: Manage Chroma vector database

**Operations**:
- Add documents
- Search by similarity
- Update embeddings
- Delete documents

### chatmodel.py - Chat Logic

**Purpose**: Core chat processing logic

**Responsibilities**:
- Message validation
- Context management
- Response formatting

### database.py - Database Configuration

**Setup**:
```python
- Create SQLAlchemy engine
- Configure connection pooling
- Initialize session factory
```

### schema.py - Pydantic Models

**Request/Response Models**:

```python
class TextRequest:
    text: str

class PromptInput:
    groupid: int
    prompt: str

class AudioRequest:
    groupid: int
    audio: bytes
```

---

## Frontend Components

### App.jsx - Main Application

**State Management**:
- Current chat group
- Chat messages
- User information

**Key Functions**:
- Routing logic
- Component orchestration

### components/Chatwindow.jsx

**Purpose**: Display chat messages

**Features**:
- Message history display
- Auto-scroll to latest message
- Message formatting

### components/Inputbar.jsx

**Purpose**: User input interface

**Features**:
- Text input field
- Send button
- Auto-formatting

### components/Sidebar.jsx

**Purpose**: Chat group management

**Features**:
- List chat groups
- Create new chat
- Switch between groups
- **Filter**: Hides empty-named groups (newly created)

### components/Questionchatbubble.jsx

**Purpose**: Display user messages

**Styling**: Right-aligned, blue background

### components/Answerchatbubble.jsx

**Purpose**: Display AI responses

**Styling**: Left-aligned, gray background
**Features**: Markdown support with react-markdown

### components/ElevenlabsAPI.js

**Purpose**: Audio file handling

**Features**:
- Audio recording
- File upload
- Audio playback

### components/Typinganimation.jsx

**Purpose**: Loading indicator

**Features**:
- Animated dots
- Shows while waiting for response

### components/Blueringloader.jsx

**Purpose**: Page loading indicator

**Features**:
- Animated ring
- Full-page overlay

### store/index.js - State Management

**State Structure**:
```javascript
{
  chatGroups: [],
  currentGroup: null,
  messages: [],
  user: { id: 1 },
  loading: false
}
```

### store/api/chatApi.js

**API Functions**:
- `sendMessage(groupId, prompt)`
- `sendAudio(groupId, audioFile)`
- `getChatHistory(groupId)`

### store/api/groupApi.js

**API Functions**:
- `createGroup(userId)`
- `getUserGroups(userId)`
- `deleteGroup(groupId)`

---

## Database Schema

### users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
```

### chatgroups Table
```sql
CREATE TABLE chatgroups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### chats Table
```sql
CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    chatgroup_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (chatgroup_id) REFERENCES chatgroups(id)
);
```

### Vector Database (Chroma)
```
chroma_langchain_db/
├── chroma.sqlite3       # Metadata storage
└── [uuid]/              # Document embeddings and data
```

---

## API Reference

### Text Chat Endpoint

**POST /chat**

Request:
```json
{
    "groupid": 1,
    "prompt": "What is machine learning?"
}
```

Response:
```json
{
    "data": "Machine learning is..."
}
```

**Error Cases**:
- 400: No prompt provided
- 500: Database or LLM error

### Audio Chat Endpoint

**POST /chat/audio**

Form Data:
- `groupid`: integer (required)
- `audio`: file (required, multipart)

Response:
```json
{
    "question": "Transcribed text from audio",
    "data": "AI response"
}
```

### Create Chat Group

**POST /users/{userId}**

Response:
```json
{
    "id": 13
}
```

**Note**: New groups have empty names until first message

### Get User's Chat Groups

**GET /user/{user_id}**

Response:
```json
[
    {
        "id": 1,
        "name": "First question asked..."
    },
    {
        "id": 2,
        "name": "Another conversation..."
    }
]
```

**Note**: Empty-named groups are hidden in frontend

### Get Chat History

**GET /groups/{group_id}**

Response:
```json
{
    "data": [
        {
            "question": "User message",
            "answer": "AI response"
        },
        ...
    ]
}
```

---

## Configuration

### Backend Configuration Files

**sqlUrl.py**:
```python
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost:5432/rakshabandhan"
```

**Environment-based Configuration**:
```bash
export DATABASE_URL="postgresql://..."
export LLM_API_KEY="your_key"
export AUDIO_MODEL="model_name"
```

### Frontend Configuration

**vite.config.js**:
- Build configuration
- Development server settings
- Asset optimization

**API Base URL** (in store/api/):
```javascript
const API_BASE_URL = "http://127.0.0.1:8000"
```

---

## Deployment

### Backend Deployment

**Production Server**:
```bash
# Use Gunicorn with Uvicorn workers
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

**Environment Variables for Production**:
```bash
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host/db
DEBUG=False
CORS_ORIGINS=https://yourdomain.com
```

### Frontend Deployment

**Build**:
```bash
npm run build
```

**Output**: `dist/` folder ready for static hosting

**Hosting Options**:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Traditional web server

### Docker Deployment

**Backend Dockerfile**:
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile**:
```dockerfile
FROM node:18 as build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

---

## Performance Optimization

### Backend
- Use connection pooling for database
- Cache embeddings and RAG results
- Implement request rate limiting
- Add pagination for chat history

### Frontend
- Code splitting with Vite
- Image optimization
- Lazy load components
- Implement message virtualization for large histories

---

## Security Considerations

1. **Database**:
   - Use strong PostgreSQL passwords
   - Enable SSL for database connections
   - Implement user authentication

2. **API**:
   - Add authentication/authorization
   - Implement CORS properly
   - Rate limit endpoints
   - Validate all inputs

3. **Frontend**:
   - Sanitize user input
   - Validate file uploads
   - HTTPS in production

---

## Troubleshooting Guide

### Common Issues

**Database Connection Fails**
- Check PostgreSQL is running
- Verify credentials in sqlUrl.py
- Ensure database exists

**RAG System Not Retrieved Documents**
- Verify documents are loaded on startup
- Check Chroma database files
- Review embedding model configuration

**Audio Processing Fails**
- Check audio format is supported
- Verify API key for audio service
- Check file size limits

**Frontend Won't Connect to Backend**
- Verify backend is running
- Check CORS configuration
- Verify API_BASE_URL in frontend config

---

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Advanced RAG with metadata filtering
- [ ] Support for multiple LLM models
- [ ] Real-time chat with WebSockets
- [ ] Chat search functionality
- [ ] Export chat history
- [ ] Custom knowledge base upload
- [ ] Multi-language support
- [ ] Chat analytics dashboard

---

**Document Version**: 1.0
**Last Updated**: March 7, 2026
