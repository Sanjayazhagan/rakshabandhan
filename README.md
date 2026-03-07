# Rakshabandhan

A full-stack AI-powered chat application designed to empower women in India with legal rights and financial scheme information. Features RAG (Retrieval-Augmented Generation), audio-to-text transcription, and vector-based knowledge retrieval. Built with FastAPI backend and React frontend.

## Features

- 💬 **AI Chat Interface** - Interactive chat with Google Gemini LLM-powered responses
- 🎙️ **Audio to Text** - Convert speech to text using multimodal LLM capabilities
- 📚 **RAG System** - Retrieve relevant legal documents and financial schemes using Pinecone vector database
- 🔍 **Vector Store** - Pinecone-based vector database for semantic search
- 👥 **Multi-User Support** - Create and manage multiple chat groups per user
- 🚀 **Real-time Processing** - Async operations for smooth user experience
- 📱 **Modern UI** - Clean, responsive React interface with Tailwind CSS
- 🌍 **Multilingual Support** - Support for multiple Indian languages
- 🧹 **Automatic Database Cleanup** - Scheduled cleanup of chat data every 24 hours (configurable)

## Project Structure

```
Rakshabndan/
├── backend/                 # FastAPI server
│   ├── main.py             # API endpoints & scheduler
│   ├── model.py            # SQLAlchemy models
│   ├── database.py         # Database configuration
│   ├── rag.py              # RAG implementation
│   ├── llmWrap.py          # LLM wrapper
│   ├── audiototext.py      # Audio transcription
│   ├── chatmodel.py        # Chat model logic
│   ├── ingest.py           # Document ingestion
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example        # Environment variables template
│   └── chroma_langchain_db/ # Vector database files
│
└── frontend/               # React/Vite application
    ├── src/
    │   ├── components/     # React components
    │   ├── store/          # State management
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── .env.example        # Frontend env template
    └── vite.config.js
```

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Vector Store**: Pinecone with LangChain
- **LLM**: Google Gemini 2.5 Flash
- **Embeddings**: HuggingFace (BAAI/bge-small-en-v1.5)
- **Audio**: Multimodal LLM-based transcription
- **Scheduler**: APScheduler (for automatic database cleanup)

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Markdown**: react-markdown

## Setup Instructions

### Backend Setup

1. **Create virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/Mac
   ```

2. **Set up environment variables**:
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env and add your API keys:
   # - GOOGLE_API_KEY (from https://aistudio.google.com/app/apikey)
   # - PINECONE_API_KEY (from https://app.pinecone.io/)
   # - DATABASE_URL (PostgreSQL connection string)
   ```

3. **Configure database**:
   - Create PostgreSQL database: `createdb rakshabandhan`
   - Database tables are auto-created from models on first run

4. **Start the server**:
   ```bash
   python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Open http://localhost:5173 in your browser

## Environment Variables

Copy `.env.example` to `.env` in the backend directory and fill in your values:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/rakshabandhan

# Google Gemini LLM
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Pinecone Vector Database
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=rag-schemes-index

# Database Cleanup Scheduler
ENABLE_DB_CLEANUP=True          # Enable automatic cleanup
DB_CLEANUP_INTERVAL_HOURS=24    # Clear data every 24 hours

# Server Configuration
DEBUG=True
HOST=127.0.0.1
PORT=8000

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Getting API Keys

**Google Gemini API**:
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Copy and paste into `GOOGLE_API_KEY` in `.env`

**Pinecone API**:
1. Sign up at https://app.pinecone.io/
2. Create an index named `rag-schemes-index` (dimension: 384, metric: cosine)
3. Copy API key into `PINECONE_API_KEY` in `.env`

**PostgreSQL**:
1. Install PostgreSQL
2. Create database: `createdb rakshabandhan`
3. Update `DATABASE_URL` with your credentials

### Database Cleanup

The application automatically clears all chat data every 24 hours (configurable):

- **Enabled by default**: Set `ENABLE_DB_CLEANUP=True`
- **Customizable interval**: Set `DB_CLEANUP_INTERVAL_HOURS=24` (or any hours value)
- **What gets deleted**: Chat messages and chat groups
- **Preserved data**: User accounts remain unchanged
- **Scheduler logs**: Check server logs for cleanup status

To disable cleanup:
```env
ENABLE_DB_CLEANUP=False
```


## API Endpoints

### Chat Operations
- `POST /chat` - Send a text message
- `POST /chat/audio` - Send an audio message

### Group Management
- `POST /users/{userId}` - Create a new chat group
- `GET /user/{user_id}` - Get all chat groups for a user
- `GET /groups/{group_id}` - Get chat history for a group

## Running the Application

### Development Mode

**Terminal 1 (Backend)**:
```bash
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```

Then open: http://localhost:5173

## Features Overview

### RAG System
- Loads documents from Pinecone vector database
- Uses semantic search with HuggingFace embeddings
- Augments LLM responses with retrieved context
- Run `python ingest.py` to add new documents to Pinecone

### Audio Processing
- Converts audio files to text using Google Gemini's multimodal capabilities
- Supports MP3, WAV, OGG, M4A formats
- Processes audio asynchronously

### Automatic Database Cleanup
- APScheduler runs cleanup jobs on schedule
- Deletes old chat data to save database storage
- Doesn't affect user accounts
- Configurable interval (default: 24 hours)

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running: `psql --version`
- Ensure database exists: `createdb rakshabandhan`
- Check `DATABASE_URL` in `.env` file
- Test connection: `psql postgresql://user:pass@host/db`

### Google Gemini API Error
- Verify `GOOGLE_API_KEY` is set in `.env`
- Check key is valid at https://aistudio.google.com/app/apikey
- Ensure you have API quota remaining

### Pinecone Vector Database Error
- Verify `PINECONE_API_KEY` is set in `.env`
- Ensure index `rag-schemes-index` exists in your Pinecone project
- Check Pinecone API status at https://status.pinecone.io/

### Audio Processing Issues
- Verify audio file format is supported (MP3, WAV, OGG, M4A)
- Check Google API key is valid and has quota
- Ensure audio file is not corrupted

### RAG System Not Working
- Ensure documents are loaded in Pinecone: `python ingest.py`
- Verify Pinecone index has documents indexed
- Check `PINECONE_API_KEY` and `PINECONE_INDEX_NAME` in `.env`

### Database Cleanup Not Running
- Check if `ENABLE_DB_CLEANUP=True` in `.env`
- Review server logs for scheduler status
- Verify APScheduler is installed: `pip install apscheduler`

## Documentation

- [INSTALLATION.md](INSTALLATION.md) - Detailed installation guide
- [DOCUMENTATION.md](DOCUMENTATION.md) - Complete technical documentation
- [ENV_SETUP.md](ENV_SETUP.md) - Environment variables and configuration

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Last Updated**: March 8, 2026
**Version**: 1.0.0
