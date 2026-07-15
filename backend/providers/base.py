from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from abc import ABC, abstractmethod

class BaseProvider(ABC):
    """Base interface for all AI Providers."""
    
    @abstractmethod
    def provider_name(self) -> str:
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        pass
