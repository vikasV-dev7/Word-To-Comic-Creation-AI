import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import hashlib

logger = logging.getLogger("PromptEngine")

class PromptTemplate(BaseModel):
    id: str
    version: str
    template_string: str
    required_variables: List[str]

class OptimizedPrompt(BaseModel):
    final_positive_prompt: str
    final_negative_prompt: str
    prompt_hash: str # For caching

class PromptEngine:
    """
    Subsystem for prompt construction, optimization, versioning, and caching.
    Ensures that no other module manually concatenates strings for image generation.
    """
    def __init__(self):
        self._cache: Dict[str, OptimizedPrompt] = {}
        
        # In a real system, these would be loaded from a database or versioned files
        self.templates = {
            "v1_comic_panel": PromptTemplate(
                id="v1_comic_panel",
                version="1.0.0",
                template_string="{style_modifiers}, {camera_angle}, {framing}, {lighting}, {subject_description}, {background_description}",
                required_variables=["style_modifiers", "camera_angle", "framing", "lighting", "subject_description", "background_description"]
            )
        }

    def _generate_hash(self, variables: Dict[str, str], template_id: str) -> str:
        content = template_id + str(sorted(variables.items()))
        return hashlib.sha256(content.encode('utf-8')).hexdigest()

    def build_prompt(self, template_id: str, variables: Dict[str, str]) -> OptimizedPrompt:
        """
        Compiles the prompt safely, optimizing token order if necessary.
        Uses caching to prevent redundant LLM optimization calls.
        """
        prompt_hash = self._generate_hash(variables, template_id)
        
        if prompt_hash in self._cache:
            logger.info(f"Cache hit for prompt: {prompt_hash[:8]}")
            return self._cache[prompt_hash]
            
        if template_id not in self.templates:
            raise ValueError(f"Unknown prompt template: {template_id}")
            
        template = self.templates[template_id]
        
        # Verify required variables
        for req in template.required_variables:
            if req not in variables:
                raise ValueError(f"Missing required variable '{req}' for template '{template_id}'")

        # Compile (Simulating optimization/concatenation)
        compiled = template.template_string.format(**variables)
        
        # Basic automatic optimization (e.g., stripping duplicate commas)
        optimized = ", ".join([part.strip() for part in compiled.split(",") if part.strip()])
        
        result = OptimizedPrompt(
            final_positive_prompt=optimized,
            final_negative_prompt="text, watermark, bad anatomy, deformed", # Could be dynamic
            prompt_hash=prompt_hash
        )
        
        self._cache[prompt_hash] = result
        return result
