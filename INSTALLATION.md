# Installation Guide - Rakshabandhan

## Prerequisites

Before you start, ensure you have the following installed:

- **Python 3.9+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Sanjayazhagan/rakshabandhan.git
cd rakshabandhan
```

### 2. Backend Setup

#### 2.1 Create Virtual Environment

**Windows**:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac**:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

#### 2.2 Install Python Dependencies

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic python-multipart
pip install chromadb langchain langchain-community
pip install aiofiles
```

Or if a requirements.txt exists:
```bash
pip install -r requirements.txt
```

#### 2.3 Configure Database

**Create PostgreSQL Database**:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE rakshabandhan;

-- Create user (optional, recommended for production)
CREATE USER rakshabandhan_user WITH PASSWORD 'your_secure_password';
ALTER ROLE rakshabandhan_user SET client_encoding TO 'utf8';
ALTER ROLE rakshabandhan_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE rakshabandhan_user SET default_transaction_deferrable TO on;
ALTER ROLE rakshabandhan_user SET default_transaction_read_committed TO on;
GRANT ALL PRIVILEGES ON DATABASE rakshabandhan TO rakshabandhan_user;

-- Exit psql
\q
```

**Update sqlUrl.py**:

```python
# backend/sqlUrl.py

# Development
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@localhost:5432/rakshabandhan"

# Production with custom user
SQLALCHEMY_DATABASE_URL = "postgresql://rakshabandhan_user:your_secure_password@localhost:5432/rakshabandhan"
```

#### 2.4 Configure Environment Variables

Create `.env` file in backend directory:

```bash
# backend/.env
DATABASE_URL=postgresql://postgres:password@localhost:5432/rakshabandhan
DEBUG=True
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

#### 2.5 Initialize Database

The tables will be created automatically on first run, but you can also:

```python
# Run in Python shell
from database import Base, engine
from model import users, chatgroups, chats

Base.metadata.create_all(bind=engine)
```

#### 2.6 Start Backend Server

```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

Access API docs: http://127.0.0.1:8000/docs

### 3. Frontend Setup

#### 3.1 Install Node Dependencies

```bash
cd frontend
npm install
```

#### 3.2 Configure API Endpoint

Update `frontend/src/store/api/chatApi.js` if backend URL is different:

```javascript
const API_BASE_URL = "http://127.0.0.1:8000";
```

#### 3.3 Install Required Packages

```bash
npm install react-markdown
```

#### 3.4 Start Frontend Development Server

```bash
npm run dev
```

**Expected Output**:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Access application: http://localhost:5173

### 4. Verification

#### Check Backend Status

```bash
curl http://127.0.0.1:8000/docs
```

Should return FastAPI Swagger UI.

#### Check Frontend Status

Open http://localhost:5173 in your browser. You should see:
- Chat window
- Input bar
- Sidebar with chat groups

#### Test API Endpoints

**Create a new chat group**:
```bash
curl -X POST http://127.0.0.1:8000/users/1
```

Response:
```json
{"id": 1}
```

**Get user's chat groups**:
```bash
curl http://127.0.0.1:8000/user/1
```

Response:
```json
[]
```

**Send a message**:
```bash
curl -X POST http://127.0.0.1:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"groupid": 1, "prompt": "Hello"}'
```

## Troubleshooting Installation

### PostgreSQL Connection Issues

**Error**: `psycopg2.OperationalError: could not translate host name "localhost" to address`

**Solution**:
```bash
# Check PostgreSQL is running
# Windows
pg_isready -h localhost -p 5432

# Linux/Mac
sudo systemctl status postgresql
```

**Error**: `FATAL: role "postgres" does not exist`

**Solution**:
```bash
# Create postgres user
postgres -U postgres -d postgres

# Or use the superuser you created during installation
```

### Python Dependencies Issues

**Error**: `No module named 'psycopg2_binary'`

**Solution**:
```bash
pip install --upgrade pip
pip install psycopg2-binary
```

**Error**: `SQLAlchemy version conflict`

**Solution**:
```bash
pip install --upgrade sqlalchemy
```

### Node/npm Issues

**Error**: `npm: command not found`

**Solution**: Install Node.js from https://nodejs.org

**Error**: Port 5173 already in use

**Solution**:
```bash
npm run dev -- --port 3000
```

### Backend Server Issues

**Error**: `Address already in use`

**Solution**:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8000
kill -9 <PID>
```

**Error**: `Module import errors`

**Solution**:
```bash
# Verify virtual environment is activated
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### CORS Issues

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**: Update `main.py` CORS settings:

```python
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",  # Additional dev ports
]
```

## Production Setup

### Backend Production

1. **Use production database URL**:
```python
SQLALCHEMY_DATABASE_URL = "postgresql://user:secure_pass@prod_host:5432/rakshabandhan"
```

2. **Use production server**:
```bash
pip install gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

3. **Set environment variables**:
```bash
export DEBUG=False
export CORS_ORIGINS=https://yourdomain.com
export DATABASE_URL=postgresql://...
```

### Frontend Production

1. **Build for production**:
```bash
npm run build
```

2. **Deploy dist folder**:
   - Upload `dist/` to your hosting provider
   - Configure web server to serve index.html for all routes

### Using Docker

**Build backend image**:
```bash
cd backend
docker build -t rakshabandhan-backend .
docker run -p 8000:8000 -e DATABASE_URL=postgresql://... rakshabandhan-backend
```

**Build frontend image**:
```bash
cd frontend
docker build -t rakshabandhan-frontend .
docker run -p 80:80 rakshabandhan-frontend
```

## Next Steps

1. Read [README.md](README.md) for feature overview
2. Read [DOCUMENTATION.md](DOCUMENTATION.md) for detailed architecture
3. Start developing!

## Getting Help

- Check [DOCUMENTATION.md](DOCUMENTATION.md) troubleshooting section
- Review API documentation at http://localhost:8000/docs
- Check backend logs for errors
- Open an issue on GitHub

---

**Installation Guide Version**: 1.0
**Last Updated**: March 7, 2026
