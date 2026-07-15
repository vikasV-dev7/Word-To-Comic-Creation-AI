import logging
from enum import Enum
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("CapabilityRegistry")

class Capability(str, Enum):
    LANGUAGE_DETECTION = "LANGUAGE_DETECTION"
    TEXT_CLEANING = "TEXT_CLEANING"
    STORY_ANALYSIS = "STORY_ANALYSIS"
    CHARACTER_EXTRACTION = "CHARACTER_EXTRACTION"
    RELATIONSHIP_EXTRACTION = "RELATIONSHIP_EXTRACTION"
    TIMELINE_EXTRACTION = "TIMELINE_EXTRACTION"
    LOCATION_EXTRACTION = "LOCATION_EXTRACTION"
    SCENE_SEGMENTATION = "SCENE_SEGMENTATION"
    DIALOGUE_GENERATION = "DIALOGUE_GENERATION"
    PROMPT_GENERATION = "PROMPT_GENERATION"
    IMAGE_GENERATION = "IMAGE_GENERATION"

class ModelProfile(BaseModel):
    id: str
    name: str
    provider: str # e.g., "ollama", "comfyui"
    capabilities: List[Capability]
    context_window: int = 4096
    estimated_ram_mb: int = 4096
    estimated_vram_mb: int = 4096
    supports_json_mode: bool = False
    supports_tool_calling: bool = False
    latency_score: float = 0.5 # 0.0 to 1.0 (1.0 is fastest)
    quality_score: float = 0.5 # 0.0 to 1.0 (1.0 is highest quality)
    is_available: bool = True

class CapabilityRegistry:
    """
    Central registry where providers register the capabilities of models they discover.
    """
    def __init__(self):
        self.models: Dict[str, ModelProfile] = {}

    def register_model(self, profile: ModelProfile):
        self.models[profile.id] = profile
        logger.info(f"Registered model {profile.name} for capabilities: {[c.value for c in profile.capabilities]}")

    def get_models_for_capability(self, capability: Capability) -> List[ModelProfile]:
        return [m for m in self.models.values() if capability in m.capabilities and m.is_available]

class IntelligentRouter:
    """
    Dynamically assigns tasks to the best available model based on required capability
    and current hardware constraints.
    """
    def __init__(self, registry: CapabilityRegistry):
        self.registry = registry

    def route(self, capability: Capability, require_json: bool = False) -> Optional[ModelProfile]:
        """
        Finds the best model for a given capability.
        MVP Implementation: Returns the highest quality available model that meets requirements.
        """
        candidates = self.registry.get_models_for_capability(capability)
        
        if require_json:
            candidates = [c for c in candidates if c.supports_json_mode]

        if not candidates:
            logger.error(f"No available model found for capability: {capability}")
            return None

        # Sort by quality score as a default MVP heuristic
        candidates.sort(key=lambda x: x.quality_score, reverse=True)
        best_model = candidates[0]
        
        logger.info(f"Routed capability {capability} to model {best_model.name}")
        return best_model
