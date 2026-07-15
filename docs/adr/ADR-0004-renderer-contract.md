# ADR 0004: Strict Renderer Contract

## Status
Accepted

## Context
Rendering engines (e.g., ComfyUI, Forge) and downstream consumers (e.g., Comic viewer, Visual Novel engine) need to generate assets based on the parsed story. If renderers directly access the raw text or perform their own NLP parsing, the architecture becomes tightly coupled and inconsistent. 

## Decision
We establish a strict Renderer Contract. Renderers must **never access raw text**. 

Renderers will only receive structured payloads containing:
1. `StoryGraph` (The narrative sequence and scenes to render)
2. `WorldModel` (The canonical visual/environmental descriptions)
3. `RenderSettings` (Dimensions, styles, quality)
4. `RendererProfile` (Configuration specific to the rendering engine)

The renderers map the structured `StoryGraph` (e.g., Scene -> Panels) into physical prompts for their specific backends using the `PromptBuilder` module.

## Consequences
- **Positive:** Renderers remain completely isolated from the complexities of language processing.
- **Positive:** Enables building multiple distinct renderers (Comics, Manga, Text-to-Speech) that are guaranteed to stay consistent with the story state.
- **Negative:** The `StoryGraph` schema must be exhaustive enough to encapsulate all necessary visual and auditory details required by downstream renderers.
