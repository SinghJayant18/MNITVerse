# MNITVerse 🚀

**Made by MNITians, for MNITians.**

MNITVerse is a college resource-sharing platform built exclusively for MNIT Jaipur students, enabling them to upload, discover, and access notes, PYQs, books, and academic resources with AI-powered study tools.

## ✨ Features

### 📚 Resource Management

* Upload and download notes, books, and PYQs
* Resource categorization by branch and year
* Bookmark favorite resources
* Rating and review system
* Trending resources section

### 🤖 AI-Powered Study Tools

* Gemini AI Notes Summarizer
* PYQ Analysis & Pattern Detection
* Viva Question Generator
* Smart Subject Recommendations

### 👨‍🎓 Student Platform

* Secure JWT Authentication
* Branch-wise syllabus access
* Personalized dashboard
* Analytics and insights

## 🛠️ Tech Stack

### Frontend

* React 19
* Vite
* Tailwind CSS 4
* React Router DOM
* Axios

### Backend

* FastAPI
* MongoDB Atlas
* Motor (Async MongoDB Driver)
* JWT Authentication
* Passlib + Bcrypt

### AI Integration

* Google Gemini 2.5 Flash

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

---

## 🚀 Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/SinghJayant18/MNITVerse.git
cd MNITVerse
```

### 2. Backend Setup

```bash
cd backend

python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
```

Update `.env`:

```env
MONGO_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_secret_key
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Start backend:

```bash
uvicorn app.main:app --reload --port 8000
```

---

### 3. Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## 🌐 Production Deployment

### Frontend (Vercel)

```env
VITE_BACKEND_URL=https://mnitverse-backend.onrender.com
```

### Backend (Render)

```env
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://mnit-verse.vercel.app
```

---

## 📌 API Endpoints

| Method | Endpoint                       | Description              |
| ------ | ------------------------------ | ------------------------ |
| POST   | `/auth/register`               | Student registration     |
| POST   | `/auth/login`                  | Student login            |
| GET    | `/auth/me`                     | Current user             |
| GET    | `/resources`                   | Browse resources         |
| POST   | `/resources`                   | Upload resources         |
| GET    | `/resources/{id}/download`     | Download resource        |
| POST   | `/summarize`                   | AI summary               |
| POST   | `/ai/analyze-pyq`              | PYQ analysis             |
| POST   | `/ai/viva-questions`           | Viva question generation |
| GET    | `/analytics/dashboard`         | Dashboard analytics      |
| GET    | `/analytics/syllabus/{branch}` | Branch syllabus          |

---

## 🎯 Vision

MNITVerse aims to become the one-stop academic ecosystem for MNIT Jaipur students by combining collaborative resource sharing with modern AI-powered learning tools.

**One Platform, Endless Learning.**

---

Made with ❤️ by MNITians, for MNITians.
