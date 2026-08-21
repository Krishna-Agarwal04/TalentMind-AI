import logging
from typing import Dict, Any, Tuple

from app.ai.fusion.config import config

logger = logging.getLogger(__name__)

class FusionEngine:
    """
    Engine to fuse various sub-scores into a final semantic ranking score.
    Applies business rules such as Keyword Stuffer Detection and Honeypot Penalties.
    """

    def __init__(self):
        self.weights = config.weights
        self.rules = config.business_rules
        self.scale = config.engine.get("final_score_scale", 100)

    def _detect_honeypot(self, candidate: Dict[str, Any]) -> bool:
        return candidate.get("honeypot_triggered", False)

    def _detect_keyword_stuffer(self, candidate: Dict[str, Any], scores: Dict[str, float]) -> bool:
        if candidate.get("keyword_stuffer_flag", False):
            return True
        ce_score = scores.get("cross_encoder_score", 0.0)
        sm_score = scores.get("skill_match_score", 0.0)
        # Large disparity between deep semantic match and completely missing skills
        if ce_score > 90.0 and sm_score < 5.0:
            return True
        return False

    def fuse_scores(self, candidate: Dict[str, Any], scores: Dict[str, float]) -> Tuple[float, float, list]:
        """
        Fuses individual scores into a final ranking score.
        """
        final_score = 0.0
        confidence = 100.0  # Base confidence
        flags = []

        expected_keys = ["cross_encoder_score", "embedding_score", "skill_match_score", "experience_score", "behavior_score"]
        missing_keys = 0
        
        for key in expected_keys:
            val = scores.get(key)
            weight = self.weights.get(key, 0.20)
            
            if val is not None and val > 0:
                final_score += val * weight
            else:
                # Use baseline 70.0 for smooth scoring if missing
                final_score += 70.0 * weight
                missing_keys += 1
                
        if missing_keys > 0:
            confidence -= (missing_keys / len(expected_keys)) * 30

        # Apply penalties only if flagged explicitly
        if self._detect_honeypot(candidate):
            flags.append("HONEYPOT_DETECTED")
            final_score -= 40.0
            
        if self._detect_keyword_stuffer(candidate, scores):
            flags.append("KEYWORD_STUFFER")
            final_score -= 20.0

        # Ensure bounds (10 to 100)
        final_score = max(15.0, min(100.0, final_score))
        
        return round(final_score, 2), round(confidence, 2), flags
