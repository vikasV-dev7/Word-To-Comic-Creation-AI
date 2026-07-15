import time
import logging
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

# Setup basic logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Observability")

class ExecutionMetrics(BaseModel):
    """Tracks metrics for a specific pipeline stage."""
    stage_name: str
    execution_time_ms: float = 0.0
    token_usage_prompt: int = 0
    token_usage_completion: int = 0
    memory_usage_mb: float = 0.0
    warnings: list[str] = []
    failure_reason: Optional[str] = None
    confidence_score: float = 1.0
    quality_metrics: Dict[str, Any] = {}

class ObservabilityTracker:
    """Singleton-like tracker for monitoring pipeline execution."""
    
    def __init__(self):
        self.metrics: Dict[str, ExecutionMetrics] = {}
        self._start_times: Dict[str, float] = {}

    def start_stage(self, stage_name: str):
        """Marks the beginning of a stage."""
        self._start_times[stage_name] = time.time()
        self.metrics[stage_name] = ExecutionMetrics(stage_name=stage_name)
        logger.info(f"[STARTED] Stage: {stage_name}")

    def end_stage(self, stage_name: str, **kwargs):
        """Marks the end of a stage and records metrics."""
        if stage_name in self._start_times:
            elapsed_ms = (time.time() - self._start_times[stage_name]) * 1000
            self.metrics[stage_name].execution_time_ms = elapsed_ms
            
            # Update any additional metrics passed via kwargs
            for key, value in kwargs.items():
                if hasattr(self.metrics[stage_name], key):
                    setattr(self.metrics[stage_name], key, value)
                    
            logger.info(f"[COMPLETED] Stage: {stage_name} in {elapsed_ms:.2f}ms")
            if self.metrics[stage_name].warnings:
                logger.warning(f"[WARNINGS] {stage_name}: {self.metrics[stage_name].warnings}")
            if self.metrics[stage_name].failure_reason:
                logger.error(f"[FAILED] {stage_name}: {self.metrics[stage_name].failure_reason}")

    def log_warning(self, stage_name: str, warning_msg: str):
        if stage_name in self.metrics:
            self.metrics[stage_name].warnings.append(warning_msg)

    def log_failure(self, stage_name: str, reason: str):
        if stage_name in self.metrics:
            self.metrics[stage_name].failure_reason = reason

    def get_report(self) -> Dict[str, ExecutionMetrics]:
        return self.metrics

# Global instance for the pipeline
tracker = ObservabilityTracker()
