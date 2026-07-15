import json
import os
from typing import List, Dict, Any, Optional
from .schema import KnowledgeLayer, StoryFact, Provenance

class KnowledgeManager:
    """
    Manages the Knowledge Layer, providing memory persistence and retrieval.
    Before the LLM processes a new chunk, the KnowledgeManager is queried
    to inject relevant past memories (e.g., facts about a character).
    """
    def __init__(self, project_id: str, storage_dir: str = "data/knowledge"):
        self.project_id = project_id
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        self.file_path = os.path.join(self.storage_dir, f"{project_id}_knowledge.json")
        self.layer = self._load()

    def _load(self) -> KnowledgeLayer:
        if os.path.exists(self.file_path):
            with open(self.file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return KnowledgeLayer(**data)
        return KnowledgeLayer(project_id=self.project_id)

    def save(self):
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(self.layer.model_dump(), f, indent=2)

    def add_character_memory(self, character_id: str, memory: str):
        """Stores a specific persistent memory for a character."""
        if character_id not in self.layer.character_memories:
            self.layer.character_memories[character_id] = []
        if memory not in self.layer.character_memories[character_id]:
            self.layer.character_memories[character_id].append(memory)
        self.save()

    def get_character_memories(self, character_id: str) -> List[str]:
        """Retrieves all memories associated with a character."""
        return self.layer.character_memories.get(character_id, [])

    def add_story_fact(self, fact: str, provenance: Optional[Provenance] = None):
        """Stores a global unchangeable fact about the narrative."""
        story_fact = StoryFact(fact=fact, provenance=provenance or Provenance())
        self.layer.story_facts.append(story_fact)
        self.save()

    def get_all_facts(self) -> List[str]:
        return [f.fact for f in self.layer.story_facts]

    def log_revision(self, revision_event: Dict[str, Any]):
        """Event Sourcing: Logs a modification to the story state."""
        self.layer.revision_history.append(revision_event)
        self.save()
