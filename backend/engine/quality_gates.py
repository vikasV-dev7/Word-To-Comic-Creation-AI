import logging
from typing import List
from .schema import StoryGraph, WorldModel
from .canon import CanonEngine, Conflict

logger = logging.getLogger("QualityGates")

class QualityGateFailure(Exception):
    def __init__(self, conflicts: List[Conflict]):
        self.conflicts = conflicts
        super().__init__(f"Quality Gate failed with {len(conflicts)} conflicts.")

class QualityGates:
    """
    Automatic validation run before rendering begins.
    Validates Character, Timeline, and Location consistency.
    If validation fails, execution pauses for human review.
    """
    def __init__(self, canon_engine: CanonEngine):
        self.canon = canon_engine

    def validate_before_render(self, story_graph: StoryGraph, world_model: WorldModel):
        logger.info("Running Pre-Render Quality Gates...")
        all_conflicts = []

        # 1. Timeline Consistency
        all_conflicts.extend(self.canon.verify_timeline_consistency(story_graph))

        # 2. Scene Completeness & Missing References
        for chapter in story_graph.chapters:
            for scene in chapter.scenes:
                if not scene.location_id or scene.location_id not in world_model.locations:
                    all_conflicts.append(Conflict(
                        severity="ERROR",
                        description=f"Scene {scene.id} references a missing or unknown location '{scene.location_id}'.",
                        entities_involved=[scene.id, str(scene.location_id)]
                    ))
                
                # Dialogue attribution check
                for panel in scene.panels:
                    for dial in panel.dialogues:
                        if dial.speaker_id not in story_graph.characters:
                            all_conflicts.append(Conflict(
                                severity="ERROR",
                                description=f"Dialogue in Panel {panel.id} attributed to unknown speaker '{dial.speaker_id}'.",
                                entities_involved=[panel.id, dial.speaker_id]
                            ))

        if all_conflicts:
            logger.error(f"Quality Gates failed! Found {len(all_conflicts)} conflicts.")
            for c in all_conflicts:
                logger.error(f"- [{c.severity}] {c.description}")
            raise QualityGateFailure(all_conflicts)
        
        logger.info("Quality Gates passed successfully.")
        return True
