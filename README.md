# MemoraAI: Story Operating System

![MemoraAI Banner](https://img.shields.io/badge/MemoraAI-Story%20Operating%20System-a78bfa?style=for-the-badge)

MemoraAI is not just a comic generator—it is a comprehensive **Story Operating System**. Built on a "Small-Model First" philosophy, this platform processes raw text memories, analyzes narrative structures, extracts characters and relationships, and visually orchestrates them into dynamic story outputs like interactive comics.

## 🌟 Core Philosophy

1. **Structured Story Intelligence:** Everything revolves around structured narrative intelligence (StoryGraph). Raw text is only processed once during ingestion. Every subsequent editor, generator, and model consumes this canonical structured data.
2. **Capability-Based Routing:** We don't hardcode logic to specific models. Instead, the backend employs a **Capability Registry**. Tasks like Language Detection, Text Cleaning, and Character Extraction are treated as independent capabilities routed dynamically to the best available small models (e.g., LLaMA-3.1 8B, Gemma).
3. **Small-Model First Architecture:** The platform is designed to run efficiently on consumer hardware using 3B-8B parameter models, with future compatibility for larger endpoints.

---

## ✨ Features

- **Document Ingestion:** Upload memories via TXT, DOCX, or PDF.
- **Automated Story Analysis:** The backend chunks text and builds a comprehensive Canon/StoryGraph.
- **Character & Relationship Mapping:** Automatically extracts entities, visual appearances, and character-to-character relationships.
- **Timeline & Scene Segmentation:** Breaks down memories into chronological timeline events and segmentable scenes.
- **Professional Workflow UI:** Built in React + Vite. Features dedicated workspaces for Story Review, Character editing, Scene manipulation, Script generation, and Comic Cover design.
- **Extensible Architecture:** Designed to seamlessly support future capabilities like audio narration or new visual rendering engines.

---

## 🛠️ Tech Stack

**Frontend:**
- React 18, TypeScript, Vite
- Framer Motion (Micro-animations and fluid page transitions)
- Tailwind CSS (Utility-first styling, customized for a premium dark-mode aesthetic)
- React Router & Zustand/Context for global state management

**Backend:**
- Python 3.11, FastAPI
- SQLAlchemy (SQLite by default for localized memory persistence)
- Uvicorn (ASGI web server)
- Ollama Integration (for local open-source model execution)

---

## 🚀 Getting Started (Local Development)

Both the frontend and backend are designed to be run locally to ensure the privacy of user memories.

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)
- Git

### 1. Backend Setup

The FastAPI backend handles the intelligence, capabilities, and data storage.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server (runs on http://127.0.0.1:8000)
uvicorn main:app --reload
```
You can view the API documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 2. Frontend Setup

The frontend provides the Story Operating System UI.

```bash
# Return to the root directory
cd ..

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
Navigate to [http://localhost:8443](http://localhost:8443) in your browser to view the application.

---

## 🏗️ Architecture Overview

### The Capability Registry
At the heart of the backend is the `engine/capabilities.py`. Models are registered with the `CapabilityRegistry` along with their specific capabilities (e.g., `Capability.CHARACTER_EXTRACTION`). An `IntelligentRouter` dynamically assigns narrative tasks to the most efficient model that supports the required capability. 

### The Canon (StoryGraph)
Located in `engine/schema.py`, the `StoryGraph` is the definitive source of truth. It tracks:
- `WorldModel`: Global context, overarching themes.
- `Characters`: Verified entities with defined appearances and identities.
- `TimelineEvents`: Chronological markers.
- `Scenes`: Localized intersections of characters, dialogue, and narration.

---

## 🤝 Contributing

As a modular capability-driven system, MemoraAI welcomes new capability providers! If you're adding support for a new model pipeline or rendering engine:
1. Wrap it in the `StoryLLMProvider` interface.
2. Register its supported capabilities via `ModelProfile`.
3. The `IntelligentRouter` will automatically begin utilizing it.

---

## 📜 License
*Copyright © 2026. All Rights Reserved.*
