import os
from fastapi import FastAPI, Depends, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any

import models, database
from providers.text import OllamaProvider
from providers.image import ComfyUIProvider
from providers.consistency import PromptBasedConsistencyEngine
import parser
import story
from engine.capabilities import CapabilityRegistry, IntelligentRouter
from engine.providers.ollama_provider import OllamaProvider

# Initialize Capability Registry and Router on startup
registry = CapabilityRegistry()
router = IntelligentRouter(registry)

# Register default providers (will auto-discover models if running)
ollama = OllamaProvider(registry)

database.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Story Intelligence Platform API")

assets_dir = os.path.join(os.path.dirname(__file__), "assets")
os.makedirs(assets_dir, exist_ok=True)
app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running."}

from typing import List, Dict, Any

class ProjectCreateReq(BaseModel):
    id: str
    title: str
    language: str = "English"
    emotion: str = ""
    pages: int = 10
    status: str = "draft"
    data: Dict[str, Any] = {} # Catch all for the frontend project JSON

@app.post("/api/projects")
async def save_project(req: ProjectCreateReq, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == req.id).first()
    if db_project:
        db_project.title = req.title
        db_project.language = req.language
        db_project.emotion = req.emotion
        db_project.pages = req.pages
        db_project.status = req.status
        db_project.data = req.data
    else:
        db_project = models.Project(
            id=req.id, 
            title=req.title,
            language=req.language,
            emotion=req.emotion,
            pages=req.pages,
            status=req.status,
            data=req.data
        )
        db.add(db_project)
    db.commit()
    return {"status": "success"}

@app.get("/api/projects")
async def list_projects(db: Session = Depends(get_db)):
    projects = db.query(models.Project).all()
    result = []
    for p in projects:
        proj_data = p.data or {}
        proj_data["id"] = p.id
        proj_data["title"] = p.title
        proj_data["status"] = p.status
        result.append(proj_data)
    return {"projects": result}

class PanelGenerateReq(BaseModel):
    scene_description: str
    character_refs: List[Dict[str, Any]]
    style_prompt: str = "comic book illustration, high quality, vibrant colors"
    negative_prompt: str = ""

@app.post("/api/generate/panel")
async def generate_panel(req: PanelGenerateReq):
    try:
        consistency_engine = PromptBasedConsistencyEngine()
        base_prompt = f"{req.style_prompt}. {req.scene_description}"
        payload = consistency_engine.apply_consistency(base_prompt, req.character_refs)
        if req.negative_prompt:
            payload["negative_prompt"] = payload.get("negative_prompt", "") + ", " + req.negative_prompt
        image_provider = ComfyUIProvider()
        asset_url = await image_provider.generate_image(payload)
        return {"image_url": asset_url}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    content = await file.read()
    try:
        extracted_text = parser.parse_document(content, file.filename)
    except Exception as e:
        extracted_text = f"Error extracting text: {e}"
        
    return {"filename": file.filename, "extracted_text": extracted_text}

class StoryAnalyzeReq(BaseModel):
    text: str

@app.post("/api/story/analyze")
async def analyze_story(req: StoryAnalyzeReq):
    try:
        # In the new architecture, the multi-pass orchestrator would run here,
        # but for MVI we pass the router down to the legacy story analyzer
        # so it can request capabilities dynamically.
        result = await story.analyze_document_text(req.text, router)
        return {"analysis_result": result.model_dump() if hasattr(result, "model_dump") else result}
    except Exception as e:
        return {"error": str(e)}

class StoryReviseReq(BaseModel):
    text: str
    instruction: str

@app.post("/api/story/revise")
async def revise_story(req: StoryReviseReq):
    provider = OllamaProvider()
    try:
        prompt = f"Original text: {req.text}\n\nRewrite this with the following instruction: {req.instruction}"
        revised_text = await provider.generate_text([{"role": "user", "content": prompt}])
        return {"revised_text": revised_text}
    except Exception as e:
        return {"error": str(e)}
