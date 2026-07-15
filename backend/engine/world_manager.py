import os
import json
from typing import Dict, Any, List
from .schema import WorldModel, Location, Organization, WorldObject, Rule
import logging

logger = logging.getLogger("WorldManager")

class WorldManager:
    """
    Manages the WorldModel, providing persistence and query capabilities
    for the static universe configuration (Locations, Objects, Organizations).
    """
    def __init__(self, project_id: str, storage_dir: str = "data/world"):
        self.project_id = project_id
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        self.file_path = os.path.join(self.storage_dir, f"{project_id}_world.json")
        self.model = self._load()

    def _load(self) -> WorldModel:
        if os.path.exists(self.file_path):
            with open(self.file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return WorldModel(**data)
        return WorldModel()

    def save(self):
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(self.model.model_dump(), f, indent=2)

    def add_location(self, location: Location):
        logger.info(f"Adding location to world: {location.name}")
        self.model.locations[location.id] = location
        self.save()

    def get_location_by_name(self, name: str) -> Location | None:
        for loc in self.model.locations.values():
            if loc.name.lower() == name.lower():
                return loc
        return None
