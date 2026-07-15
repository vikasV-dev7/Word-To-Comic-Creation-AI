# ADR 0001: Provider Architecture

## Status
Accepted

## Context
The application needs to interact with Large Language Models (LLMs) to perform complex text extraction, timeline generation, and semantic reasoning. We must ensure the core business logic (the Story Intelligence Engine) is not tightly coupled to any specific vendor's API (e.g., OpenAI, Anthropic). Furthermore, the application is designed to be "Local AI First", requiring robust support for local inference engines (Ollama, LM Studio, vLLM).

## Decision
We will implement a `StoryLLMProvider` abstraction layer. All AI interactions within the Story Intelligence Engine will communicate exclusively through this interface.

The interface will define highly structured, domain-specific methods rather than generic prompt endpoints. Examples include:
- `analyze_story()`
- `extract_characters()`
- `extract_timeline()`
- `generate_dialogue()`

The concrete implementations (e.g., `OllamaProvider`, `OpenAICompatibleProvider`) will handle the translation of these structured requests into the specific wire formats required by their respective backends.

## Consequences
- **Positive:** The system can swap AI models seamlessly without altering extraction pipelines.
- **Positive:** Enables offline, local-only execution.
- **Negative:** Concrete implementations may need complex schema enforcement logic if the underlying local model struggles with JSON formatting.
