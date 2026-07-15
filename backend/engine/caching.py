import os
import json
import hashlib
import logging
from typing import Any, Optional

logger = logging.getLogger("CachingLayer")

class CacheManager:
    """
    Aggressive caching layer. Hashes inputs (prompt + text chunk) and stores the 
    parsed output to prevent redundant LLM calls for identical text/settings.
    """
    def __init__(self, cache_dir: str = "data/cache"):
        self.cache_dir = cache_dir
        os.makedirs(self.cache_dir, exist_ok=True)

    def _generate_key(self, capability: str, input_data: str) -> str:
        content = f"{capability}:{input_data}"
        return hashlib.sha256(content.encode('utf-8')).hexdigest()

    def get(self, capability: str, input_data: str) -> Optional[Any]:
        key = self._generate_key(capability, input_data)
        path = os.path.join(self.cache_dir, f"{key}.json")
        
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    logger.info(f"Cache HIT for capability {capability}")
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to read cache {key}: {e}")
                
        return None

    def set(self, capability: str, input_data: str, result: Any):
        key = self._generate_key(capability, input_data)
        path = os.path.join(self.cache_dir, f"{key}.json")
        
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(result, f, indent=2)
            logger.debug(f"Cache SET for capability {capability}")
        except Exception as e:
            logger.error(f"Failed to write cache {key}: {e}")
