# CariSkill Project Setup Manual

Welcome to the CariSkill project! This guide will walk you through cloning the repository and setting up the local development environment for the frontend, the Python backend, and the AI worker.

## ✨ Key Features

- **Personalized AI Roadmaps**: Generate dynamic, step-by-step learning paths tailored to your skill level and goals using Gemini 2.5 Flash & Pro AI.
- **Profile & Resume Management**: Upload resumes, extract key skills, and set specific target jobs for your career.
- **Custom Onboarding Flow**: Seamlessly create your profile and set your learning objectives right after registration.
- **Study Time Tracking**: Monitor your progress with a comprehensive learning report and visual activity calendar.
- **Secure Authentication**: Built-in SSR cookie-based authentication with Supabase to ensure your data stays private and loads instantly.

## 📦 Prerequisites

Before you begin, ensure your local machine has the following installed:
1. **Git**: [Download Git](https://git-scm.com/downloads)
2. **Node.js (v18 or higher)**: [Download Node.js](https://nodejs.org/)
3. **Python (v3.9 or higher)**: [Download Python](https://www.python.org/downloads/)
4. **API Keys needed**:
   - Google Generative AI (Gemini) API Key
   - Supabase Project URL & Anon Key
   - Qdrant Cloud URL & API Key
   - Tavily API Key

---

## 🚀 Step 1: Clone the Repository

Open your terminal or command prompt and run:
```bash
git clone <your-repository-url>
cd CariSkill/amls-root
```

This project uses a monorepo structure containing three separate services in the `apps` directory:
- `apps/web`: The Next.js Frontend
- `apps/api`: The Python FastAPI Backend
- `apps/ai-worker`: The Node.js Express AI Worker

---

## 🐍 Step 2: Setup the Python Backend (`apps/api`)

The backend handles document parsing, vector database interactions, and complex AI agents.

1. Navigate to the API directory:
   ```bash
   cd apps/api
   ```
2. Create and activate a Virtual Environment (recommended):
   - **Windows**:
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   - **Mac/Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Setup environment variables:
   Create a `.env` file in the `apps/api` folder and add your keys:
   ```env
   GEMINI_API_KEY="your_google_ai_key"
   QDRANT_URL="your_qdrant_cloud_url"
   QDRANT_API_KEY="your_qdrant_api_key"
   TAVILY_API_KEY="your_tavily_key"
   ```
5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   *The server will run on `http://localhost:8000`*

---

## 🤖 Step 3: Setup the AI Worker (`apps/ai-worker`)

The AI worker is a lightweight Node.js microservice specifically for fast roadmap generation.

1. Open a **new** terminal window and navigate to the worker directory:
   ```bash
   cd apps/ai-worker
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup environment variables:
   Create a `.env` file in the `apps/ai-worker` folder:
   ```env
   GEMINI_API_KEY="your_google_ai_key"
   PORT=8080
   ```
4. Start the worker development server:
   ```bash
   npm run dev
   ```
   *The worker will run on `http://localhost:8080`*

---

## 💻 Step 4: Setup the Next.js Frontend (`apps/web`)

The frontend is the main user interface that the user interacts with.

1. Open a **third** new terminal window and navigate to the web directory:
   ```bash
   cd apps/web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup environment variables:
   Create a `.env.local` file in the `apps/web` folder:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
   NEXT_PUBLIC_AI_WORKER_URL="http://localhost:8080"
   ```
   *(Note: The AI Worker URL is pointed to your local worker server. In production, this would be a Cloud Run link).*
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The web app will run on `http://localhost:3000`*

---

## 🎉 Access the Application

Once all three terminal windows are running their respective servers without errors:

1. Open your web browser.
2. Navigate to [http://localhost:3000](http://localhost:3000)
3. You can now use the fully functional CariSkill application locally!
