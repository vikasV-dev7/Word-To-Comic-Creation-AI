# ADR 0003: Separation of World Model and Story Graph

## Status
Accepted

## Context
When extracting entities from a story, it is common to conflate *where something exists* with *when it happens in the narrative*. Mixing these concerns limits the engine's ability to maintain a consistent universe outside the bounds of a specific scene or timeline event.

## Decision
We will strictly separate the `WorldModel` from the `StoryGraph`.

- **WorldModel:** Represents the static or overarching universe (Geography, Buildings, Rooms, Objects, Organizations, Families, Rules, Magic Systems, Environmental Metadata). It is the canonical reference for *what exists*.
- **StoryGraph:** Represents the narrative sequence (Events, Timeline, Dialogue, Narration, Characters, Scenes). It references the `WorldModel` via UUIDs.

## Consequences
- **Positive:** Reduces duplication of environment and world-building facts.
- **Positive:** Enables multi-story projects set in the same universe (the `WorldModel` can be shared across multiple `StoryGraphs`).
- **Positive:** Simplifies character consistency, as the rules of the world apply universally.
- **Negative:** Requires resolving links between the StoryGraph and WorldModel during extraction, increasing the complexity of the Graph Builder pass.
