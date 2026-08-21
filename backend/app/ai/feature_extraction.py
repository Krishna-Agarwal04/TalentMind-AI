import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

COMMON_SKILLS = {
    "python", "java", "kubernetes", "react", "fastapi", "sql", "machine learning",
    "docker", "aws", "gcp", "node.js", "c++", "go", "javascript", "typescript",
    "rust", "azure", "linux", "git", "ci/cd", "agile", "scrum", "tensorflow",
    "pytorch", "nlp", "graphql", "rest api", "nosql", "mongodb", "postgresql",
    "mysql", "redis", "kafka", "rabbitmq"
}

class FeatureExtractionService:
    """
    Extracts structural features like skill matching and experience scoring 
    from the candidate profiles prior to semantic ranking.
    """
    
    def extract_features(self, candidates: List[Dict[str, Any]], job_description_text: str) -> List[Dict[str, Any]]:
        """
        Parses skills and experience, generating structural sub-scores deterministically.
        """
        jd_lower = job_description_text.lower()
        jd_skills = {skill for skill in COMMON_SKILLS if skill in jd_lower}
        
        for cand in candidates:
            profile = cand.get("profile", {})
            cand_skills_raw = profile.get("skills", [])
            
            cand_skills = []
            for s in cand_skills_raw:
                if isinstance(s, dict):
                    cand_skills.append(s.get("name", "").lower())
                elif isinstance(s, str):
                    cand_skills.append(s.lower())
            
            cand_skills_set = set(cand_skills)
            
            matched_skills = []
            missing_skills = []
            
            if jd_skills:
                for req_skill in jd_skills:
                    if any(req_skill in c_skill for c_skill in cand_skills_set):
                        matched_skills.append(req_skill)
                    else:
                        missing_skills.append(req_skill)
                
                match_ratio = len(matched_skills) / len(jd_skills)
                skill_match_score = max(40.0, match_ratio * 100.0)
            else:
                skill_match_score = 75.0
                
            cand["skill_match_score"] = round(skill_match_score, 2)
            cand["matched_skills"] = matched_skills
            cand["missing_skills"] = missing_skills
            
            exp_data = profile.get("experience", [])
            exp_years = profile.get("experience_years")
            if exp_years is not None:
                cand["experience_score"] = min(float(exp_years) * 15.0 + 30.0, 100.0)
            elif exp_data and isinstance(exp_data, list):
                cand["experience_score"] = min(len(exp_data) * 25.0 + 25.0, 100.0)
            else:
                cand["experience_score"] = 65.0
                
        return candidates
