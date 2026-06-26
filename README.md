# EduVault AI

College resource sharing platform for students — upload/download notes, PYQs, books & syllabi with AI-powered study tools.

## Features

**Phase 1:** Upload/Download Resources · Authentication · Bookmarks · Ratings  
**Phase 2:** Gemini Notes Summary · PYQ Analysis · Viva Question Generator  
**Phase 3:** Subject Recommendations · Trending Resources · Analytics Dashboard  

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, React Router
- **Backend:** FastAPI, Motor (MongoDB), JWT Auth
- **AI:** Google Gemini 2.5 Flash
- **Database:** MongoDB Atlas (`eduvault`)

## Setup

### 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create database: `eduvault`
3. Copy connection string

### 2. Gemini API

1. Get API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. `pip install google-generativeai`

### 3. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MONGO_URI and GEMINI_API_KEY
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

## Environment Variables

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/eduvault
GEMINI_API_KEY=your_key
JWT_SECRET=your-secret-key
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Student signup |
| POST | `/auth/login` | Login |
| GET | `/resources` | Browse resources |
| POST | `/resources` | Upload file |
| GET | `/resources/{id}/download` | Download |
| POST | `/summarize` | AI summary |
| POST | `/ai/analyze-pyq` | PYQ analysis |
| POST | `/ai/viva-questions` | Viva questions |
| GET | `/analytics/dashboard` | Stats |

Full docs at **http://localhost:8000/docs**
