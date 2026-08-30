# 1. Project Name
**CollegeAI — RAG-Based College Chatbot**

---

## 2. Problem Statement
Students, faculty, and administrators often struggle to find accurate, up-to-date college information scattered across dozens of handbooks, fee structures, policies, and websites. Generic chatbots fail because they hallucinate or lack access to institutional data. 

**CollegeAI** solves this by implementing a genuine **Retrieval-Augmented Generation (RAG)** pipeline. It serves as a centralized, intelligent assistant that answers questions exclusively using documents uploaded by college administrators. If the answer isn't in the provided documents, it honestly reports that the information is unavailable, ensuring students receive reliable, grounded information.

---

## 3. Features
### Core Features
- **Intelligent Q&A (RAG):** Answers natural language queries by retrieving context from uploaded college documents.
- **Source Citations:** Every answer includes exact references to the source documents and page numbers used to generate the response.
- **Anti-Hallucination:** Explicitly programmed to admit when information is not present in the knowledge base, rather than fabricating answers.
- **Document Management Dashboard:** Secure admin panel to upload, process, monitor, and delete PDFs, DOCX, and TXT files.
- **Role-based Authentication:** Distinct Student and Administrator roles with protected routes and secure JWT sessions.
- **Chat History:** Persistent storage of past conversations, allowing users to revisit older threads.

### Bonus / Advanced Features
- **Local Embedded Models:** Uses completely free, offline `@xenova/transformers` (`all-MiniLM-L6-v2`) for generating document embeddings, saving on API costs.
- **Vector Database Integration:** Powered by PostgreSQL with the `pgvector` extension for hyper-fast semantic similarity search.
- **Suggested Follow-up Questions:** Automatically predicts and suggests 3 relevant follow-up questions after every AI response using a lightweight secondary model.
- **Premium Dark-Mode UI:** A beautiful, responsive interface built with Tailwind CSS, Lucide icons, and modern glassmorphism aesthetics.

---

## 4. Technology Stack
**Frontend:**
- **Framework:** Next.js (App Router), React
- **Styling:** Tailwind CSS, Custom CSS (Dark Theme)
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Icons:** Lucide React

**Backend:**
- **Runtime:** Node.js, Express.js
- **Database:** PostgreSQL (hosted on Supabase)
- **ORM:** Sequelize
- **Vector Search:** `pgvector` extension
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **Document Parsing:** `pdf-parse`, `mammoth` (for DOCX)
- **Embeddings:** `@xenova/transformers` (Local model: `all-MiniLM-L6-v2`)
- **LLM Provider:** Groq API (`qwen/qwen3.8-27b` for main chat, `qwen/qwen3.6-27b` for suggestions)

---

## 8. Setup Instructions
Follow these steps to run the project locally on your machine.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A PostgreSQL database with the `pgvector` extension enabled (e.g., Supabase)
- A free Groq API key (from https://console.groq.com)

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd college_chat_bot
```

### Step 2: Set up the Backend
```bash
cd backend
npm install
```
1. Rename `.env.example` to `.env` (or create a new `.env` file).
2. Fill in the environment variables (see section 9 below).
3. Start the backend development server:
```bash
npm run dev
```
*(Note: On the first run, the backend will download an ~80MB local embedding model. Subsequent runs will be instant).*

### Step 3: Set up the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
```
1. Start the frontend development server:
```bash
npm run dev
```
2. Open your browser and navigate to `http://localhost:3000`.

### Step 4: First Steps in the App
1. Go to `http://localhost:3000/register`.
2. Create an account and select the **Administrator** role.
3. Navigate to the Admin Dashboard and upload a college PDF.
4. Wait for the status to change to **Processed**.
5. Go to the Chat interface and ask a question about your uploaded document!

---

## 9. Environment Variables
**Important:** Do NOT commit your `.env` files to version control. 

Create a `.env` file in the `backend/` directory with the following keys:

```env
# Database Configuration (PostgreSQL + pgvector)
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

# Security
JWT_SECRET=
FRONTEND_URL=

# AI Provider (LLM)
# Get a free key at https://console.groq.com
GROQ_API_KEY=
```
*(No API key is required for embeddings, as they are generated locally using HuggingFace Transformers).*
