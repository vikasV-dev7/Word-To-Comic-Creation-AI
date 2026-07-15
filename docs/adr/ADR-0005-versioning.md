# ADR 0005: Event Sourcing and Versioning

## Status
Accepted

## Context
Narrative extraction is imprecise. Users will frequently need to correct the `StoryGraph` (e.g., fixing a misidentified relationship, merging duplicate characters, or reordering timeline events). If we treat the `StoryGraph` as a mutable document that is simply overwritten, we lose audit history and the ability to rollback destructive edits.

## Decision
We will employ **Event Sourcing** for all modifications to the underlying state, and maintain distinct **Versioning** for major platform artifacts.

1. **Event Sourcing:** Every modification to the `StoryGraph` or `WorldModel` is treated as an immutable event. 
   - Examples: `EntityExtracted`, `CharacterMerged`, `TimelineEdited`, `SceneDeleted`.
   - The current state of the project is a projection of these events. This natively supports comprehensive undo/redo.

2. **Versioning:** Different components of a project evolve at different speeds and must be independently recoverable. We will maintain explicit versions for:
   - `StoryGraph` (Narrative state)
   - `WorldModel` (Universe state)
   - `Scripts/Panels` (Segmented rendering plans)
   - `Generated Assets` (Images/Audio mapped to specific script versions)
   - `Prompt Templates`

## Consequences
- **Positive:** Maximum safety for user data and AI extraction errors. Users can always recover previous states.
- **Positive:** Enables advanced collaborative editing and conflict resolution.
- **Negative:** Dramatically increases backend storage requirements and complexity of database mutations compared to simple CRUD operations.
