# ADR 0002: StoryGraph as the Single Source of Truth

## Status
Accepted

## Context
The legacy application utilized a simple, flat JSON structure (`ComicProject`) that merely mapped scenes to simple character IDs. As the application transitions into a Story Intelligence Platform, it requires a structural understanding of complex narratives (e.g., branching timelines, multi-chapter novels, embedded relationships, motifs, and flashbacks). 

## Decision
We will implement the `StoryGraph` as the definitive, immutable data structure for narrative representation.
Once a document is parsed and processed by the multi-pass extraction pipeline, the raw text is discarded. The `StoryGraph` becomes the single source of truth.

The StoryGraph will include:
- Chapters, Sections, Scenes, Panels
- Characters, Organizations, Relationships
- Timeline Events, Flashbacks, Dream Sequences
- Dialogue, Narration
- Emotional States, Themes, Motifs

Every node in the graph will have a persistent UUID, a confidence score, and provenance (a back-reference to the exact extraction source).

## Consequences
- **Positive:** Deeply structured data enables powerful querying (e.g., "Which characters are in Scene 8?").
- **Positive:** Enables arbitrary rendering frontends (manga, comic, visual novel) to consume the exact same underlying logic.
- **Negative:** Requires completely rewriting the frontend to consume this complex graph rather than the legacy flat JSON.
