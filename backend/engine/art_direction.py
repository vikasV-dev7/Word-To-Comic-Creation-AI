import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from .schema import Scene, Panel

logger = logging.getLogger("ArtDirectionLayer")

class StyleProfile(BaseModel):
    name: str
    base_prompt_modifiers: str
    negative_prompt_modifiers: str
    preferred_aspect_ratio: str
    color_palette: List[str] = []

class CameraShot(BaseModel):
    angle: str # e.g., "low angle", "bird's eye view", "eye level"
    framing: str # e.g., "close up", "wide shot", "over the shoulder"
    lighting: str # e.g., "chiaroscuro", "flat lighting", "rim lit"

class ArtDirectionLayer:
    """
    Separates visual storytelling from raw image generation.
    Decides on camera angles, lighting, framing, and applies Style Profiles
    before the Prompt Engine compiles the final physical prompt.
    """
    def __init__(self):
        self.available_styles = {
            "manga": StyleProfile(
                name="manga",
                base_prompt_modifiers="monochrome, screentones, ink, highly detailed anime lineart",
                negative_prompt_modifiers="color, realistic, 3d render",
                preferred_aspect_ratio="2:3"
            ),
            "comic": StyleProfile(
                name="comic",
                base_prompt_modifiers="western comic book style, vibrant colors, dynamic ink lines",
                negative_prompt_modifiers="anime, photorealistic",
                preferred_aspect_ratio="2:3"
            )
        }

    def determine_camera_shot(self, panel: Panel, previous_shot: Optional[CameraShot] = None) -> CameraShot:
        """
        Dynamically calculates the best camera shot based on the action,
        ensuring cinematic continuity (e.g., avoiding 180-degree rule breaks).
        """
        # Logic to infer framing from visual_description
        # Fallback to standard for now
        return CameraShot(
            angle="eye level",
            framing="medium shot",
            lighting="dramatic cinematic lighting"
        )

    def apply_art_direction(self, scene: Scene, style_name: str) -> Dict[str, Any]:
        """
        Applies a Style Profile and cinematic framing to all panels in a scene.
        Returns a rich artistic payload that the Prompt Engine can use.
        """
        logger.info(f"Applying '{style_name}' art direction to Scene.")
        style = self.available_styles.get(style_name, self.available_styles["comic"])
        
        directed_panels = []
        last_shot = None
        for panel in scene.panels:
            shot = self.determine_camera_shot(panel, last_shot)
            directed_panels.append({
                "panel_id": panel.id,
                "shot": shot.model_dump(),
                "base_description": panel.visual_description,
                "style_modifiers": style.base_prompt_modifiers
            })
            last_shot = shot

        return {
            "scene_id": scene.id,
            "style_profile": style.model_dump(),
            "directed_panels": directed_panels
        }
