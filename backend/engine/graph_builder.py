import os
import json
from typing import Dict, Any, List
from .schema import StoryGraph, Character, Relationship, TimelineEvent, Scene
import logging

logger = logging.getLogger("GraphBuilder")

class GraphBuilder:
    """
    Manages the StoryGraph, providing persistence and merging logic.
    Maintains the chronological and narrative structure.
    """
    def __init__(self, project_id: str, storage_dir: str = "data/graph"):
        self.project_id = project_id
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        self.file_path = os.path.join(self.storage_dir, f"{project_id}_graph.json")
        self.graph = self._load()

    def _load(self) -> StoryGraph:
        if os.path.exists(self.file_path):
            with open(self.file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return StoryGraph(**data)
        return StoryGraph(project_id=self.project_id)

    def save(self):
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(self.graph.model_dump(), f, indent=2)

    def add_character(self, character: Character):
        logger.info(f"Adding character to graph: {character.name}")
        self.graph.characters[character.id] = character
        self.save()

    def add_relationship(self, relationship: Relationship):
        logger.info(f"Adding relationship to graph between {relationship.source_character_id} and {relationship.target_character_id}")
        self.graph.relationships.append(relationship)
        self.save()

    def merge_chunk_entities(self, new_characters: List[Character], canon_engine) -> Dict[str, str]:
        """
        Merges newly extracted characters into the graph.
        Uses CanonEngine to detect duplicates.
        Returns a mapping of new_id -> canonical_id.
        """
        id_map = {}
        for char in new_characters:
            # Simple check, assumes CanonEngine logic
            conflicts = canon_engine.validate_new_extraction({"characters": [char]}, self.graph)
            if conflicts:
                logger.warning(f"Conflict detected for {char.name}: {conflicts[0].description}")
                # For now, just add them (a real implementation would resolve based on UI/Reasoning)
            
            self.add_character(char)
            id_map[char.id] = char.id
        return id_map
