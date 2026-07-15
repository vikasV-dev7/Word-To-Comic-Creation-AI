from typing import List, Dict, Any
from abc import ABC, abstractmethod

class CharacterConsistencyEngine(ABC):
    """
    Base class for Character Consistency Engines.
    This engine is responsible for ensuring characters look consistent across generated panels.
    It may use Prompt Injection, LoRA, IP-Adapter, FaceID, or other techniques.
    """

    @abstractmethod
    def apply_consistency(self, base_prompt: str, character_refs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Applies consistency techniques based on the characters present in the scene.
        Returns a dictionary that might contain modified prompts, LoRA payload additions, etc.
        """
        pass

class PromptBasedConsistencyEngine(CharacterConsistencyEngine):
    """
    A basic consistency engine that relies entirely on detailed prompt injection.
    """
    def apply_consistency(self, base_prompt: str, character_refs: List[Dict[str, Any]]) -> Dict[str, Any]:
        char_prompts = []
        for char in character_refs:
            desc = char.get("description", "")
            if desc:
                char_prompts.append(desc)
        
        injected_prompt = base_prompt
        if char_prompts:
            injected_prompt += ", featuring " + ", ".join(char_prompts)
            
        return {
            "prompt": injected_prompt,
            "negative_prompt": "mutated, deformed, out of frame, extra fingers",
            "extensions": {}
        }
