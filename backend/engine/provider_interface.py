from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from .schema import (
    StoryGraph, WorldModel, Character, Location, Relationship, 
    TimelineEvent, Scene, Dialogue, Narration
)

class StoryLLMProvider(ABC):
    """
    Abstract base class for all LLM interactions in the Story Intelligence Engine.
    Enforces a structured, payload-driven interface rather than raw text prompts.
    """

    @abstractmethod
    async def extract_characters(self, text_chunk: str, existing_world: WorldModel) -> List[Character]:
        """Extracts Character entities from a raw text chunk, referencing existing world knowledge."""
        pass

    @abstractmethod
    async def extract_locations(self, text_chunk: str, existing_world: WorldModel) -> List[Location]:
        """Extracts Location entities from a raw text chunk."""
        pass

    @abstractmethod
    async def extract_relationships(self, text_chunk: str, characters: List[Character]) -> List[Relationship]:
        """Extracts character relationships from a text chunk."""
        pass

    @abstractmethod
    async def extract_timeline(self, text_chunk: str, characters: List[Character], locations: List[Location]) -> List[TimelineEvent]:
        """Extracts chronological events, flashbacks, and time skips."""
        pass

    @abstractmethod
    async def segment_scenes(self, events: List[TimelineEvent]) -> List[Scene]:
        """Groups chronological events into cohesive narrative scenes."""
        pass

    @abstractmethod
    async def generate_dialogue(self, scene: Scene, characters: List[Character]) -> List[Dialogue]:
        """Generates or extracts structured dialogue attributed to specific speakers."""
        pass

    @abstractmethod
    async def generate_narration(self, scene: Scene) -> List[Narration]:
        """Generates or extracts independent narration/caption boxes for a scene."""
        pass

    @abstractmethod
    async def validate_consistency(self, story_graph: StoryGraph, world_model: WorldModel) -> List[Dict[str, Any]]:
        """Analyzes the graph for chronological, spatial, or logical conflicts."""
        pass

class MockLLMProvider(StoryLLMProvider):
    """
    A mock provider for local testing and deterministic graph building without API calls.
    """
    async def extract_characters(self, text_chunk: str, existing_world: WorldModel) -> List[Character]:
        return []

    async def extract_locations(self, text_chunk: str, existing_world: WorldModel) -> List[Location]:
        return []

    async def extract_relationships(self, text_chunk: str, characters: List[Character]) -> List[Relationship]:
        return []

    async def extract_timeline(self, text_chunk: str, characters: List[Character], locations: List[Location]) -> List[TimelineEvent]:
        return []

    async def segment_scenes(self, events: List[TimelineEvent]) -> List[Scene]:
        return []

    async def generate_dialogue(self, scene: Scene, characters: List[Character]) -> List[Dialogue]:
        return []

    async def generate_narration(self, scene: Scene) -> List[Narration]:
        return []

    async def validate_consistency(self, story_graph: StoryGraph, world_model: WorldModel) -> List[Dict[str, Any]]:
        return []
