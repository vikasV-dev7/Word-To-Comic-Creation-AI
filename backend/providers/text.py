from typing import List, Optional
from abc import abstractmethod
from pydantic import BaseModel
from providers.base import BaseProvider

class TextMessage(BaseModel):
    role: str
    content: str

class TextModelProvider(BaseProvider):
    """Base class for all Text Generation Providers (LLMs)."""
    
    @abstractmethod
    async def generate_text(self, messages: List[TextMessage], temperature: float = 0.7, max_tokens: int = 1000) -> str:
        """Generate text from a sequence of messages."""
        pass

class OllamaProvider(TextModelProvider):
    def provider_name(self) -> str: return "Ollama"
    def is_available(self) -> bool: return True
    async def generate_text(self, messages, temperature=0.7, max_tokens=1000) -> str:
        return "[Ollama Mock] Output generated."

class LMStudioProvider(TextModelProvider):
    def provider_name(self) -> str: return "LM Studio"
    def is_available(self) -> bool: return True
    async def generate_text(self, messages, temperature=0.7, max_tokens=1000) -> str:
        return "[LM Studio Mock] Output generated."

class VLLMProvider(TextModelProvider):
    def provider_name(self) -> str: return "vLLM"
    def is_available(self) -> bool: return True
    async def generate_text(self, messages, temperature=0.7, max_tokens=1000) -> str:
        return "[vLLM Mock] Output generated."

class OpenAICompatibleProvider(TextModelProvider):
    def provider_name(self) -> str: return "OpenAI Compatible"
    def is_available(self) -> bool: return True
    async def generate_text(self, messages, temperature=0.7, max_tokens=1000) -> str:
        return "[OpenAI Compatible Mock] Output generated."
