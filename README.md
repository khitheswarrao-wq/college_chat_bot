# 1. Project Name
**CollegeAI — Intelligent Document-Grounded RAG Chatbot**

---

## 2. Problem Statement
Students, parents, and faculty members frequently struggle to find accurate, up-to-date college information scattered across dozens of disjointed PDF handbooks, fee circulars, admission guidelines, course catalogs, and disparate web pages. Generic AI chatbots often fail in educational contexts because they hallucinate facts or lack access to verified institutional records.

**CollegeAI** solves this challenge by implementing an end-to-end **Retrieval-Augmented Generation (RAG)** pipeline. Administrators can upload official college documents (PDF, DOCX, TXT), which are automatically chunked, embedded, and indexed into a searchable vector knowledge base. Students can ask natural-language questions and receive instant, factual answers grounded strictly in official institutional data—complete with exact page citations and relevant follow-up suggestions.

---

## 3. Features

### Core Features
- **Document-Grounded Q&A (RAG):** Accurately answers campus-related questions strictly based on the institution's official uploaded documents.
- **Source Citations & Page References:** Every response provides exact citations showing the document name, page number, and similarity match score.
- **Anti-Hallucination Guardrails:** Explicitly programmed to state when information is unavailable in official records rather than fabricating answers.
- **Admin Document Management:** Dedicated dashboard for authorized administrators to upload, process, monitor, reprocess, and delete institutional documents.
- **Role-Based Access Control (RBAC):** Secure JWT authentication with dedicated views for **Students** (chat interface) and **Administrators** (document knowledge base).
- **Persistent Conversation History:** Stores and organizes previous chat sessions for quick reference and review.

### Bonus / Advanced Features
- **Local & Quantized Embeddings:** Powered by `@xenova/transformers` (`all-MiniLM-L6-v2`) generating 384-dimensional vector embeddings without incurring third-party embedding API costs.
- **Universal Vector Search with PostgreSQL:** Employs high-speed vector similarity search using PostgreSQL (with native `pgvector` and in-memory cosine similarity fallback).
- **AI Suggested Follow-Up Questions:** Automatically predicts and displays 3 intelligent follow-up questions tailored to the conversation context.
- **Response Feedback System:** Integrated thumbs-up / thumbs-down feedback to track AI response quality.
- **Modern Responsive Dark UI:** Crafted with Tailwind CSS, Lucide icons, glassmorphism aesthetics, and smooth responsive animations across mobile and desktop.

---

## 4. Technology Stack

### Frontend
- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS v4, Custom CSS (Modern Dark Mode & Glassmorphism)
- **State Management:** Zustand
- **HTTP Client:** Axios (with dynamic backend URL resolution & interceptors)
- **Icons:** Lucide React

### Backend
- **Runtime & Framework:** Node.js 20, Express.js 5
- **Database & ORM:** PostgreSQL, Sequelize ORM
- **Vector Search:** `pgvector` / Cosine Vector Similarity
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **File Upload & Parsing:** Multer, `pdf-parse`, `mammoth` (DOCX parsing)
- **Embedding Pipeline:** `@xenova/transformers` (`Xenova/all-MiniLM-L6-v2`)
- **LLM & AI Generation:** Groq Cloud API (`qwen/qwen3.8-27b` & `qwen/qwen3.6-27b`)

---

## 5. Screenshots

> *Add your application screenshots below:*

### 💬 Chat Interface (Student View)
```
[ Place Screenshot of Chat Interface & Source Citations Here ]
```
![Chat Screenshot](https://via.placeholder.com/800x450.png?text=CollegeAI+Chat+Interface+with+Citations)

### 📂 Document Management (Admin Dashboard)
```
[ Place Screenshot of Admin Document Management Dashboard Here ]
```
![Admin Documents Screenshot](https://via.placeholder.com/800x450.png?text=Admin+Document+Management+Dashboard)

### 🔐 Authentication (Login & Registration)
```
[ Place Screenshot of Login / Register Screen Here ]
```
![Auth Screenshot](https://via.placeholder.com/800x450.png?text=Authentication+Screen)

---

## 6. Live Demo
- **Live Application URL:**  
  `https://________________________`  *(Paste your deployed Frontend / Vercel / Render URL here)*

---

## 7. Backend
- **Live Backend API URL:**  
  `https://________________________/api`  *(Paste your deployed Backend API URL here)*

- **API Health Check Endpoint:**  
  `https://________________________/api/health`

---

## 8. Setup Instructions

Follow these steps to set up and run the project locally on your machine.

### Prerequisites
- **Node.js** (v18.18+ or v20+ recommended)
- **npm** or **yarn**
- **PostgreSQL Database** (Local instance or hosted on Supabase / Neon / Render)
- **Groq API Key** (Free from [console.groq.com](https://console.groq.com/keys))

---

### Step 1: Clone the Repository
```bash
git clone <your-github-repository-url>
cd college_chat_bot
```

---

### Step 2: Configure & Start the Backend
1. Navigate to the `backend` directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file inside the `backend/` directory:
   ```bash
   cp .env.example .env
   ```

3. Fill in your database and API credentials in `.env` (refer to Section 9).

4. Build and start the backend server:
   ```bash
   # Development mode with hot-reload:
   npm run dev

   # Or production build & start:
   npm run build
   npm start
   ```
   *The backend will run on `http://localhost:5000`.*

---

### Step 3: Configure & Start the Frontend
1. Open a new terminal window, navigate to `frontend`, and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. (Optional) Create a `.env.local` file inside `frontend/`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:3000`.*

---

### Step 4: Using the Application Locally
1. Open your browser and navigate to `http://localhost:3000/register`.
2. Register an account and select the **Administrator** role.
3. Open the **Document Management** page (`/admin/documents`) and upload a sample college syllabus or guideline (PDF/DOCX/TXT).
4. Wait a few seconds for the document status to change to **Processed**.
5. Navigate to **`/chat`** and ask questions grounded in your uploaded document!

---

## 9. Environment Variables

> [!IMPORTANT]
> **Security Notice:** Never commit actual `.env` files, passwords, JWT secrets, or API keys to GitHub. All sensitive keys must remain in your local `.env` or be configured securely in your cloud hosting environment settings.

Create a `.env` file in the `backend/` directory with the following variables:

```env
# ----------------------------------------------------
# Server Configuration
# ----------------------------------------------------
PORT=5000
NODE_ENV=development

# ----------------------------------------------------
# Database Configuration (PostgreSQL)
# (Use DATABASE_URL or individual DB parameters)
# ----------------------------------------------------
DATABASE_URL=
DB_HOST=
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=

# ----------------------------------------------------
# Authentication & Security
# ----------------------------------------------------
JWT_SECRET=
FRONTEND_URL=http://localhost:3000

# ----------------------------------------------------
# AI & LLM Provider
# Get your free key at: https://console.groq.com/keys
# ----------------------------------------------------
GROQ_API_KEY=
```

Frontend Environment Variable (`frontend/.env.local`):
```env
# URL to your backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
