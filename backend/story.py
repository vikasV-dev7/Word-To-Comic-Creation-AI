import json
from pydantic import BaseModel
from typing import List, Dict, Any

class CharacterProfile(BaseModel):
    name: str
    description: str
    age: str = ""
    gender: str = ""
    appearance: str = ""

class SceneDescription(BaseModel):
    location: str
    time: str
    emotion: str
    weather: str
    description: str
    dialogues: List[Dict[str, str]]

class StoryAnalysisResult(BaseModel):
    detected_language: str
    characters: List[CharacterProfile]
    scenes: List[SceneDescription]
    summary: str

def chunk_text(text: str, max_length: int = 4000) -> List[str]:
    """A naive text chunking function to prevent exceeding context window."""
    # In a real scenario, this would use a semantic chunker like RecursiveCharacterTextSplitter from LangChain
    chunks = []
    while len(text) > max_length:
        # Find the last period within max_length
        split_idx = text.rfind('.', 0, max_length)
        if split_idx == -1:
            split_idx = max_length
        chunks.append(text[:split_idx + 1].strip())
        text = text[split_idx + 1:].strip()
    
    if text:
        chunks.append(text)
    return chunks

async def analyze_document_text(text: str, llm_provider) -> StoryAnalysisResult:
    """Uses the LLM provider to extract structured storytelling data from the text."""
    chunks = chunk_text(text)
    
    # Mocking the AI response structure for the pipeline.
    # In reality, this would be a chained prompt sequence:
    # 1. Identify Language & Global Context
    # 2. Extract Character references globally
    # 3. For each chunk: Extract scenes and timeline
    
    prompt = f"Analyze the following story text and extract characters, scenes, and summary in JSON format.\n\nText: {chunks[0][:500]}..."
    
    raw_response = await llm_provider.generate_text([{"role": "user", "content": prompt}])
    
    # Returning a mock structured analysis
    return StoryAnalysisResult(
        detected_language="English", # Or "Tamil", "Japanese" etc.
        characters=[
            CharacterProfile(name="Protagonist", description="The main character", gender="unknown")
        ],
        scenes=[
            SceneDescription(
                location="Unknown location", 
                time="Day", 
                emotion="Neutral", 
                weather="Clear",
                description="The opening scene",
                dialogues=[]
            )
        ],
        summary="A brief mock summary extracted from the text."
    )
