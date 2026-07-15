import sys
import os

# Ensure backend can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
from engine.capabilities import CapabilityRegistry, IntelligentRouter, Capability, ModelProfile

class TestIntelligentRouter(unittest.TestCase):
    def setUp(self):
        self.registry = CapabilityRegistry()
        self.router = IntelligentRouter(self.registry)
        
        # Register a few mock models
        self.registry.register_model(ModelProfile(
            id="test_small",
            name="Test Small Model",
            provider="mock",
            capabilities=[Capability.LANGUAGE_DETECTION, Capability.TEXT_CLEANING],
            supports_json_mode=False,
            quality_score=0.4
        ))
        
        self.registry.register_model(ModelProfile(
            id="test_medium",
            name="Test Medium Model",
            provider="mock",
            capabilities=[Capability.CHARACTER_EXTRACTION, Capability.SCENE_SEGMENTATION, Capability.LANGUAGE_DETECTION],
            supports_json_mode=True,
            quality_score=0.8
        ))

    def test_routing_basic(self):
        # Should route to the higher quality model for Language Detection
        best_model = self.router.route(Capability.LANGUAGE_DETECTION)
        self.assertIsNotNone(best_model)
        self.assertEqual(best_model.id, "test_medium")

    def test_routing_json_requirement(self):
        # If we need JSON for Text Cleaning, but the only model that supports Text Cleaning doesn't support JSON, it should fail.
        best_model = self.router.route(Capability.TEXT_CLEANING, require_json=True)
        self.assertIsNone(best_model)
        
        # Without JSON requirement, it should succeed.
        best_model = self.router.route(Capability.TEXT_CLEANING, require_json=False)
        self.assertIsNotNone(best_model)
        self.assertEqual(best_model.id, "test_small")

    def test_unsupported_capability(self):
        # Should return None for a capability no registered model supports
        best_model = self.router.route(Capability.IMAGE_GENERATION)
        self.assertIsNone(best_model)

if __name__ == "__main__":
    unittest.main()
