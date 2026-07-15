import os
import json
from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
import logging

logger = logging.getLogger("WorkflowEngine")

class WorkflowState(str, Enum):
    UPLOADED = "UPLOADED"
    EXTRACTING = "EXTRACTING"
    ANALYZING = "ANALYZING"
    VALIDATING = "VALIDATING"
    REVIEW_PENDING = "REVIEW_PENDING"
    APPROVED = "APPROVED"
    GENERATING = "GENERATING"
    ASSEMBLING = "ASSEMBLING"
    EXPORTED = "EXPORTED"
    FAILED = "FAILED"

class WorkflowInstance(BaseModel):
    project_id: str
    current_state: WorkflowState = WorkflowState.UPLOADED
    context_data: Dict[str, Any] = {} # Arbitrary state data passed between steps
    error_message: Optional[str] = None

class WorkflowEngine:
    """
    Manages the execution and persistence of the story processing pipeline.
    Ensures that interrupted workflows can be resumed from their last valid state.
    """
    def __init__(self, storage_dir: str = "data/workflows"):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)

    def _get_path(self, project_id: str) -> str:
        return os.path.join(self.storage_dir, f"{project_id}_workflow.json")

    def initialize_workflow(self, project_id: str) -> WorkflowInstance:
        """Starts a new workflow or returns an existing one if it was interrupted."""
        path = self._get_path(project_id)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                logger.info(f"Resumed workflow for {project_id} at state {data.get('current_state')}")
                return WorkflowInstance(**data)
        
        instance = WorkflowInstance(project_id=project_id)
        self.save_state(instance)
        logger.info(f"Initialized new workflow for {project_id}")
        return instance

    def save_state(self, instance: WorkflowInstance):
        path = self._get_path(instance.project_id)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(instance.model_dump(), f, indent=2)

    def transition(self, instance: WorkflowInstance, next_state: WorkflowState, context_update: Dict[str, Any] = None):
        """Transitions the workflow to the next state and persists it."""
        logger.info(f"Transitioning project {instance.project_id} from {instance.current_state} -> {next_state}")
        instance.current_state = next_state
        if context_update:
            instance.context_data.update(context_update)
        self.save_state(instance)

    def fail(self, instance: WorkflowInstance, reason: str):
        """Marks the workflow as failed and records the reason."""
        logger.error(f"Workflow {instance.project_id} FAILED: {reason}")
        instance.current_state = WorkflowState.FAILED
        instance.error_message = reason
        self.save_state(instance)
