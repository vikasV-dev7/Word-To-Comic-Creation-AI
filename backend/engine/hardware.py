import logging
import psutil # Note: Will need to add to requirements
from typing import Dict, Any
from pydantic import BaseModel

logger = logging.getLogger("AdaptiveHardware")

class HardwareProfile(BaseModel):
    available_ram_mb: float
    available_vram_mb: float
    cpu_percent: float
    is_low_resource: bool

class AdaptiveResourceManager:
    """
    Monitors system hardware and dynamically adjusts pipeline parameters
    to prevent OOM errors and maximize throughput.
    """
    def __init__(self):
        # Mock VRAM for MVP
        self.mock_vram_mb = 8192

    def _get_current_profile(self) -> HardwareProfile:
        try:
            mem = psutil.virtual_memory()
            cpu = psutil.cpu_percent(interval=0.1)
            # In a real app, use NVML or PyTorch to get true VRAM
            vram = self.mock_vram_mb 
            
            # Heuristic: If RAM < 4GB or VRAM < 4GB, we are in low resource mode
            is_low = (mem.available / (1024 * 1024) < 4096) or (vram < 4096)
            
            return HardwareProfile(
                available_ram_mb=mem.available / (1024 * 1024),
                available_vram_mb=vram,
                cpu_percent=cpu,
                is_low_resource=is_low
            )
        except Exception as e:
            logger.warning(f"Failed to read hardware metrics: {e}")
            return HardwareProfile(
                available_ram_mb=8192,
                available_vram_mb=4096,
                cpu_percent=50.0,
                is_low_resource=True # Default safe
            )

    def get_execution_limits(self) -> Dict[str, Any]:
        """
        Returns parameters for the pipeline based on live hardware status.
        """
        profile = self._get_current_profile()
        
        if profile.is_low_resource:
            logger.info("AdaptiveResourceManager: Engaging LOW RESOURCE limits.")
            return {
                "max_context_size": 2048,
                "batch_size": 1,
                "parallel_tasks": 1,
                "prompt_compression": True
            }
        else:
            return {
                "max_context_size": 8192,
                "batch_size": 4,
                "parallel_tasks": 2,
                "prompt_compression": False
            }
