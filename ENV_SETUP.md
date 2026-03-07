# Environment Setup Guide for Rakshabandhan

This guide explains how to set up environment variables for the Rakshabandhan project.

## Never Commit .env Files

⚠️ **IMPORTANT**: Never commit `.env` files to version control. They contain sensitive API keys and passwords.

- `.env` is already added to `.gitignore`
- Always use `.env.example` as a template

## Backend Setup

### 1. Copy the Example File

```bash
cd backend
cp .env.example .env
```

### 2. Edit the .env File

Update `backend/.env` with your actual API keys and credentials:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/rakshabandhan
GOOGLE_API_KEY=your_actual_google_gemini_key
PINECONE_API_KEY=your_actual_pinecone_key
PINECONE_INDEX_NAME=rag-schemes-index
```

### 3. Get Your API Keys

#### Google Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Select a project (or create a new one)
4. Copy the API key
5. Paste it in `GOOGLE_API_KEY` in `.env`

**Free Tier**: 60 requests per minute

#### Pinecone API Key

1. Sign up at https://app.pinecone.io/
2. Create a new project
3. Create an index named `rag-schemes-index` with:
   - Dimension: 384 (for BAAI/bge-small-en-v1.5)
   - Metric: cosine
4. Go to API Keys section
5. Copy your API key
6. Paste it in `PINECONE_API_KEY` in `.env`

**Free Tier**: 1 free index with 100K vectors

#### PostgreSQL Connection String

Format: `postgresql://username:password@host:port/database`

Example:
```
postgresql://postgres:mypassword@localhost:5432/rakshabandhan
```

**Local Setup**:
```bash
# Create user and database
psql -U postgres -c "CREATE DATABASE rakshabandhan;"
```

## Installation

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python -m uvicorn main:app --reload
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://postgres:pass@localhost/rakshabandhan` |
| `GOOGLE_API_KEY` | Google Gemini API key | `AIzaSyA_Vvkg7seisbGl49jBNEPNQ60...` |
| `PINECONE_API_KEY` | Pinecone API key | `pcsk_32DTpG_8Urs754kXuXqV8VTWjRT...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | Debug mode | `True` |
| `HOST` | Server host | `127.0.0.1` |
| `PORT` | Server port | `8000` |
| `CORS_ORIGINS` | Allowed origins | `http://localhost:5173,http://127.0.0.1:5173` |
| `LOG_LEVEL` | Logging level | `INFO` |
| `PINECONE_INDEX_NAME` | Pinecone index name | `rag-schemes-index` |
| `ENABLE_DB_CLEANUP` | Enable automatic database cleanup | `True` |
| `DB_CLEANUP_INTERVAL_HOURS` | Database cleanup interval in hours | `24` |

### Database Cleanup Configuration

The application includes an automatic scheduler that clears all chat data periodically:

```env
# Enable/disable automatic cleanup (True/False)
ENABLE_DB_CLEANUP=True

# Interval in hours between cleanup operations (default: every 24 hours)
DB_CLEANUP_INTERVAL_HOURS=24
```

**What gets deleted**:
- All chat messages from `chats` table
- All chat groups from `chatgroups` table
- User data is preserved

**Examples**:
```env
# Clear data every 12 hours
DB_CLEANUP_INTERVAL_HOURS=12

# Clear data every 6 hours
DB_CLEANUP_INTERVAL_HOURS=6

# Disable cleanup
ENABLE_DB_CLEANUP=False
```

## Troubleshooting

### "GOOGLE_API_KEY not set"

**Error**: `ValueError: GOOGLE_API_KEY environment variable is not set`

**Solution**:
1. Copy `.env.example` to `.env`
2. Add your actual Google API key
3. Restart the server

### "PINECONE_API_KEY not set"

**Error**: `ValueError: PINECONE_API_KEY environment variable is not set`

**Solution**:
1. Verify `PINECONE_API_KEY` is in `.env`
2. Check the key is not expired
3. Test at https://app.pinecone.io/

### "DATABASE_URL not set"

**Error**: `ValueError: DATABASE_URL environment variable is not set`

**Solution**:
1. Verify `DATABASE_URL` is in `.env`
2. Check PostgreSQL is running
3. Test connection: `psql postgresql://user:pass@host/db`

### Port Already in Use

**Error**: `Address already in use`

**Solution**:
```bash
# Use different port
python -m uvicorn main:app --reload --port 8001
# Or update PORT in .env
```

## Security Best Practices

1. **Never commit .env files** - Use `.env.example` instead
2. **Rotate API keys regularly** - Revoke old keys and generate new ones
3. **Use strong database passwords** - At least 16 characters
4. **Keep secrets secure** - Don't share your `.env` file
5. **Use environment variables in production** - Set via deployment platform (Docker, Heroku, etc.)
6. **Review .gitignore** - Ensure all sensitive files are ignored

## Production Deployment

When deploying to production (AWS, Heroku, etc.):

1. **Never use `.env` files** - Use platform-specific secrets management:
   - Docker: Environment secrets
   - Heroku: Config Vars
   - AWS: AWS Secrets Manager
   - Railway: Environment variables
   - Vercel: Environment variables

2. **Set variables in your platform**:
   ```bash
   # Example with Heroku
   heroku config:set GOOGLE_API_KEY=your_key
   heroku config:set PINECONE_API_KEY=your_key
   heroku config:set DATABASE_URL=your_db_url
   ```

3. **Use strong, complex values** for production

4. **Enable logging** - Set `LOG_LEVEL=ERROR` or `WARNING`

## Additional Resources

- [Google Gemini API Documentation](https://ai.google.dev/)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Python-dotenv Documentation](https://python-dotenv.readthedocs.io/)

---

**Last Updated**: March 8, 2026
