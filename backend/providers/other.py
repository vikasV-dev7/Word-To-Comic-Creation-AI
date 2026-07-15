from providers.base import BaseProvider
from abc import abstractmethod

class OCRProvider(BaseProvider):
    @abstractmethod
    async def extract_text(self, file_path: str) -> str:
        pass

class TranslationProvider(BaseProvider):
    @abstractmethod
    async def translate(self, text: str, target_lang: str) -> str:
        pass

class SpeechProvider(BaseProvider):
    @abstractmethod
    async def text_to_speech(self, text: str) -> str:
        pass
    
    @abstractmethod
    async def speech_to_text(self, audio_path: str) -> str:
        pass

class VisionProvider(BaseProvider):
    @abstractmethod
    async def analyze_image(self, image_path: str, prompt: str) -> str:
        pass
