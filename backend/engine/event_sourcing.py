import os
import json
import logging
from typing import List, Dict, Any
from pydantic import BaseModel, Field
import uuid
import datetime

logger = logging.getLogger("EventSourcing")

class DomainEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = Field(default_factory=lambda: datetime.datetime.now().isoformat())
    event_type: str # e.g., "EntityExtracted", "CharacterMerged", "SceneDeleted"
    payload: Dict[str, Any]
    causation_id: str = None # Link to the workflow ID or prompt that caused this
    user_id: str = "system" # Can be "human_reviewer"

class EventStore:
    """
    Append-only log of every state change in the Story Intelligence Engine.
    Provides complete audit history, time-travel debugging, and undo/redo capabilities.
    """
    def __init__(self, project_id: str, storage_dir: str = "data/events"):
        self.project_id = project_id
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        self.file_path = os.path.join(self.storage_dir, f"{project_id}_events.jsonl")
        self.events: List[DomainEvent] = self._load()

    def _load(self) -> List[DomainEvent]:
        events = []
        if os.path.exists(self.file_path):
            with open(self.file_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        events.append(DomainEvent(**json.loads(line)))
        return events

    def append(self, event_type: str, payload: Dict[str, Any], causation_id: str = None, user_id: str = "system"):
        event = DomainEvent(
            event_type=event_type,
            payload=payload,
            causation_id=causation_id,
            user_id=user_id
        )
        self.events.append(event)
        with open(self.file_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(event.model_dump()) + "\n")
        logger.info(f"Appended event: {event_type} [{event.event_id}]")

    def get_history(self) -> List[DomainEvent]:
        return self.events
