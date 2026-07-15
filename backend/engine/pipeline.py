import logging
from typing import Dict, Any, List
from .workflow import WorkflowEngine, WorkflowState, WorkflowInstance
from .observability import tracker
from .schema import StoryGraph, WorldModel
from .providers import StoryLLMProvider
from .canon import CanonEngine
from .knowledge import KnowledgeManager
from .reasoning import ReasoningLayer
from .graph_builder import GraphBuilder
from .world_manager import WorldManager

logger = logging.getLogger("MultiPassPipeline")

class MultiPassOrchestrator:
    """
    Orchestrates the 12-pass reasoning pipeline.
    Ensures that raw text is converted into the definitive StoryGraph
    and WorldModel, without bypassing any abstraction layers.
    """
    def __init__(self, project_id: str, provider: StoryLLMProvider):
        self.project_id = project_id
        self.provider = provider
        
        # Initialize Core Layers
        self.workflow = WorkflowEngine()
        self.instance = self.workflow.initialize_workflow(project_id)
        
        self.knowledge = KnowledgeManager(project_id)
        self.reasoning = ReasoningLayer(provider)
        self.canon = CanonEngine()
        
        self.graph_builder = GraphBuilder(project_id)
        self.world_manager = WorldManager(project_id)

    async def run_pipeline(self, raw_text_chunks: List[str]):
        """Executes the pipeline on a list of raw text chunks."""
        
        if self.instance.current_state == WorkflowState.UPLOADED:
            self.workflow.transition(self.instance, WorkflowState.EXTRACTING)

        try:
            # Passes 1-7: Extraction per chunk
            for idx, chunk in enumerate(raw_text_chunks):
                logger.info(f"Processing chunk {idx + 1}/{len(raw_text_chunks)}")
                await self._process_chunk(chunk)

            # Pass 8: Story Graph Merge
            tracker.start_stage("Pass_8_Graph_Merge")
            self._merge_graph()
            tracker.end_stage("Pass_8_Graph_Merge")

            self.workflow.transition(self.instance, WorkflowState.ANALYZING)

            # Pass 9: Scene Segmentation
            tracker.start_stage("Pass_9_Scene_Segmentation")
            scenes = await self.provider.segment_scenes(self.graph_builder.graph.timeline)
            self.graph_builder.graph.chapters.append(scenes) # Simplified
            self.graph_builder.save()
            tracker.end_stage("Pass_9_Scene_Segmentation")

            # Pass 10: Dialogue & Pass 11: Narration
            # Mocked iteration over scenes
            
            # Pass 12: Consistency Validation
            self.workflow.transition(self.instance, WorkflowState.VALIDATING)
            tracker.start_stage("Pass_12_Consistency_Validation")
            conflicts = await self.provider.validate_consistency(self.graph_builder.graph, self.world_manager.model)
            if conflicts:
                tracker.log_warning("Pass_12_Consistency_Validation", f"Found {len(conflicts)} conflicts.")
                # If severe conflicts, transition to REVIEW_PENDING
                self.workflow.transition(self.instance, WorkflowState.REVIEW_PENDING)
            else:
                self.workflow.transition(self.instance, WorkflowState.APPROVED)
            tracker.end_stage("Pass_12_Consistency_Validation")

        except Exception as e:
            tracker.log_failure("Pipeline", str(e))
            self.workflow.fail(self.instance, str(e))
            raise

    async def _process_chunk(self, chunk: str):
        # Pass 1 & 2 skipped for brevity in this scaffold
        
        # Pass 3: Character Extraction
        tracker.start_stage("Pass_3_Character_Extraction")
        new_chars = await self.provider.extract_characters(chunk, self.world_manager.model)
        self.graph_builder.merge_chunk_entities(new_chars, self.canon)
        tracker.end_stage("Pass_3_Character_Extraction")

        # Pass 4: Relationship Extraction
        tracker.start_stage("Pass_4_Relationship_Extraction")
        rels = await self.provider.extract_relationships(chunk, list(self.graph_builder.graph.characters.values()))
        for r in rels:
            self.graph_builder.add_relationship(r)
        tracker.end_stage("Pass_4_Relationship_Extraction")

        # Pass 5: Timeline
        tracker.start_stage("Pass_5_Timeline")
        events = await self.provider.extract_timeline(
            chunk, 
            list(self.graph_builder.graph.characters.values()),
            list(self.world_manager.model.locations.values())
        )
        self.graph_builder.graph.timeline.extend(events)
        self.graph_builder.save()
        tracker.end_stage("Pass_5_Timeline")
        
        # Pass 6 & 7: Location and Emotion (Mocked for now)

    def _merge_graph(self):
        """Resolves duplicates and links dangling references across all processed chunks."""
        logger.info("Merging Story Graph.")
        # Logic to finalize the graph structure
