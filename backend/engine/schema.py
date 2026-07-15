from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum
import uuid

# ----------------------------------------------------------------------
# 1. BASE ENTITIES (Provenance, Confidence, Agent-Ready Design)
# ----------------------------------------------------------------------

class Provenance(BaseModel):
    """Tracks where an entity was extracted from."""
    document_id: Optional[str] = None
    chunk_id: Optional[str] = None
    chapter_num: Optional[int] = None
    paragraph_num: Optional[int] = None
    exact_text_quote: Optional[str] = None

class BaseEntity(BaseModel):
    """The fundamental building block for all extracted knowledge."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    confidence: float = Field(..., description="0.0 to 1.0 confidence score of extraction accuracy")
    source_provenance: Optional[Provenance] = None
    needs_review: bool = Field(default=False, description="Flagged for human review if confidence is low")
    extraction_reason: Optional[str] = Field(None, description="LLM's reasoning for extracting this entity")

# ----------------------------------------------------------------------
# 2. WORLD MODEL (The persistent static universe)
# ----------------------------------------------------------------------

class Location(BaseEntity):
    description: str
    parent_location_id: Optional[str] = None
    visual_traits: List[str] = []

class Organization(BaseEntity):
    description: str
    members_ref_ids: List[str] = []

class WorldObject(BaseEntity):
    """Significant items, artifacts, or technology."""
    description: str
    visual_traits: List[str] = []
    current_location_id: Optional[str] = None

class Rule(BaseModel):
    """Rules of the world, magic systems, physics."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    description: str

class WorldModel(BaseModel):
    """The static universe configuration."""
    locations: Dict[str, Location] = {}
    organizations: Dict[str, Organization] = {}
    objects: Dict[str, WorldObject] = {}
    rules: List[Rule] = []
    historical_events: List[str] = []

# ----------------------------------------------------------------------
# 3. STORY GRAPH (The narrative sequence and specific events)
# ----------------------------------------------------------------------

class Character(BaseEntity):
    aliases: List[str] = []
    pronouns: Optional[str] = None
    appearance: List[str] = []
    personality: List[str] = []
    speech_style: Optional[str] = None
    importance: str = Field(default="minor") # protagonist, major, minor, background

class RelationshipType(str, Enum):
    FRIEND = "friend"
    ENEMY = "enemy"
    FAMILY = "family"
    ROMANCE = "romance"
    COLLEAGUE = "colleague"
    OTHER = "other"

class Relationship(BaseEntity):
    source_character_id: str
    target_character_id: str
    relationship_type: RelationshipType
    description: str

class TimelineEvent(BaseEntity):
    description: str
    chronological_order: int
    is_flashback: bool = False
    location_id: Optional[str] = None
    characters_involved_ids: List[str] = []

class Emotion(BaseModel):
    primary_emotion: str
    intensity: int = Field(..., ge=1, le=10)
    character_id: Optional[str] = None # If associated with a specific character

class Dialogue(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    speaker_id: str
    text: str
    emotion: Optional[str] = None

class Narration(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str

class Panel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    visual_description: str
    characters_present_ids: List[str] = []
    dialogues: List[Dialogue] = []
    narration: Optional[Narration] = None

class Scene(BaseEntity):
    location_id: Optional[str] = None
    time_of_day: Optional[str] = None
    mood: Optional[str] = None
    characters_present_ids: List[str] = []
    events_ref_ids: List[str] = []
    panels: List[Panel] = []
    estimated_panel_count: int = 1
    summary: str

class Chapter(BaseEntity):
    order: int
    scenes: List[Scene] = []
    summary: str

class StoryGraph(BaseModel):
    """The full narrative structure, referencing the WorldModel."""
    project_id: str
    characters: Dict[str, Character] = {}
    relationships: List[Relationship] = []
    timeline: List[TimelineEvent] = []
    chapters: List[Chapter] = []
    themes: List[str] = []
    motifs: List[str] = []

# ----------------------------------------------------------------------
# 4. KNOWLEDGE LAYER (Agent memory and persistent project state)
# ----------------------------------------------------------------------

class StoryFact(BaseModel):
    fact: str
    provenance: Provenance

class KnowledgeLayer(BaseModel):
    project_id: str
    story_facts: List[StoryFact] = []
    character_memories: Dict[str, List[str]] = {} # char_id -> memories
    revision_history: List[Dict[str, Any]] = []

# ----------------------------------------------------------------------
# 5. RENDERER CONTRACT (Passed to rendering backends)
# ----------------------------------------------------------------------

class RenderSettings(BaseModel):
    style: str
    aspect_ratio: str
    quality: str

class RendererPayload(BaseModel):
    """The strict payload passed to Image/Comic renderers."""
    story_graph: StoryGraph
    world_model: WorldModel
    settings: RenderSettings
