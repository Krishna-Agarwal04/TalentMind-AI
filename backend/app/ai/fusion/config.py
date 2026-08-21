import json
import os
import logging

logger = logging.getLogger(__name__)

class FusionConfig:
    """Loads and provides access to the external JSON configuration for the Ranking Fusion Engine."""
    _instance = None
    _config = None
    
    def __init__(self):
        if FusionConfig._instance is not None:
            raise Exception("Singleton")
        self.load_config()
        FusionConfig._instance = self

    def load_config(self, filepath=None):
        if filepath is None:
            filepath = os.path.join(os.path.dirname(__file__), "config.json")
        try:
            with open(filepath, 'r') as f:
                self._config = json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load fusion config file: {e}")
            self._config = {}

        # Ensure default fallbacks for expected keys
        if "weights" not in self._config:
            self._config["weights"] = {
                "cross_encoder_score": 0.35,
                "embedding_score": 0.15,
                "skill_match_score": 0.25,
                "experience_score": 0.15,
                "behavior_score": 0.10
            }
        if "business_rules" not in self._config:
            self._config["business_rules"] = {
                "honeypot_penalty": 100.0,
                "keyword_stuffer_penalty": 50.0
            }
        if "engine" not in self._config:
            self._config["engine"] = {
                "final_score_scale": 100
            }

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls()
        return cls._instance
        
    def get(self, key, default=None):
        return self._config.get(key, default)

    @property
    def weights(self):
        return self._config.get("weights", {})

    @property
    def business_rules(self):
        return self._config.get("business_rules", {})

    @property
    def engine(self):
        return self._config.get("engine", {})

    def __getattr__(self, name):
        if self._config and name in self._config:
            return self._config[name]
        raise AttributeError(f"'{type(self).__name__}' object has no attribute '{name}'")

config = FusionConfig.get_instance()
