import json
import uuid
import os
import urllib.request
from typing import Optional, Dict, Any
from abc import abstractmethod
from providers.base import BaseProvider

class ImageModelProvider(BaseProvider):
    """Base class for all Image Generation Providers."""
    
    @abstractmethod
    async def generate_image(self, payload: Dict[str, Any]) -> str:
        """
        Generate an image using the provider's specific API.
        Takes a provider-agnostic payload (prompt, negative_prompt, width, height, extensions).
        Returns the local URL path to the generated image (e.g. /assets/xyz.png).
        """
        pass

class ComfyUIProvider(ImageModelProvider):
    def __init__(self, server_address="127.0.0.1:8188"):
        self.server_address = server_address
        self.assets_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets")
        os.makedirs(self.assets_dir, exist_ok=True)

    def provider_name(self) -> str: return "ComfyUI"
    
    def is_available(self) -> bool: return True
    
    async def generate_image(self, payload: Dict[str, Any]) -> str:
        prompt = payload.get("prompt", "")
        negative_prompt = payload.get("negative_prompt", "")
        width = payload.get("width", 1024)
        height = payload.get("height", 1024)
        
        # Here we would normally build a ComfyUI prompt workflow JSON
        # and submit it to http://{self.server_address}/prompt
        # For now, since we don't have a Comfy instance guaranteed to be running,
        # we will fetch a placeholder image and save it to the assets directory
        # to simulate the generation and caching process.
        
        filename = f"{uuid.uuid4()}.jpg"
        filepath = os.path.join(self.assets_dir, filename)
        
        # Simulating generation by downloading a placeholder (using a color or text)
        placeholder_url = f"https://placehold.co/{width}x{height}/4B5563/FFFFFF.png?text=Generated\\nPanel"
        
        try:
            urllib.request.urlretrieve(placeholder_url, filepath)
        except Exception as e:
            # Fallback if internet fails
            with open(filepath, "wb") as f:
                f.write(b"") # Empty file stub
                
        return f"/assets/{filename}"

# Other providers can be implemented similarly
class Automatic1111Provider(ImageModelProvider):
    def provider_name(self) -> str: return "Automatic1111"
    def is_available(self) -> bool: return True
    async def generate_image(self, payload: Dict[str, Any]) -> str:
        return "/assets/mock_a1111.png"

class ForgeProvider(ImageModelProvider):
    def provider_name(self) -> str: return "Forge"
    def is_available(self) -> bool: return True
    async def generate_image(self, payload: Dict[str, Any]) -> str:
        return "/assets/mock_forge.png"

class DiffusersProvider(ImageModelProvider):
    def provider_name(self) -> str: return "Diffusers"
    def is_available(self) -> bool: return True
    async def generate_image(self, payload: Dict[str, Any]) -> str:
        return "/assets/mock_diffusers.png"

