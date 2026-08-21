import logging
import time
import uuid
from typing import Dict, Any, List
import asyncio
from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.models.candidate import Candidate

from app.ai.context import PipelineContext
from app.ai.metrics import MetricsCollector
from app.ai.cache import CacheManager
from app.ai.rules import RuleEngine
from app.ai.feature_extraction import FeatureExtractionService
from app.ai.retrieval.service import RetrievalService
from app.ai.ranking.service import RankingService
from app.ai.behavioral.service import BehavioralService
from app.ai.fusion.service import FusionService

logger = logging.getLogger(__name__)

class AIOrchestrator:
    """
    End-to-End Orchestrator for the TalentMind AI Pipeline.
    Manages state, retries, caching, and module execution order.
    """
    def __init__(self):
        self.cache = CacheManager.get_instance()
        self.metrics = MetricsCollector.get_instance()
        self.retrieval = RetrievalService()
        self.feature_extractor = FeatureExtractionService()
        self.ranking = RankingService()
        self.rule_engine = RuleEngine()
        self.behavioral = BehavioralService()
        self.fusion = FusionService()

    def process_job(self, job_description_id: str, job_description_text: str, top_k: int = 100) -> Dict[str, Any]:
        """
        Executes the full pipeline for a given job description.
        """
        context = PipelineContext(job_description_id, job_description_text)
        logger.info(f"Starting pipeline run {context.run_id} for JD {job_description_id}")
        
        try:
            # 1. Retrieval (FAISS or DB Fallback)
            t0 = time.perf_counter()
            retrieved_candidates = self._run_retrieval(context, top_k=top_k * 5)
            context.record_phase("retrieval", (time.perf_counter() - t0) * 1000)
            
            if not retrieved_candidates:
                return self._finalize(context)

            # 2. Feature Extraction (Skill Match, Experience)
            t0 = time.perf_counter()
            candidates_with_features = self.feature_extractor.extract_features(retrieved_candidates, context.job_description_text)
            context.record_phase("feature_extraction", (time.perf_counter() - t0) * 1000)
            
            # 3. Cross Encoder Semantic Ranking
            t0 = time.perf_counter()
            semantically_ranked = self.ranking.rank_candidates(context.job_description_text, candidates_with_features)
            context.record_phase("semantic_ranking", (time.perf_counter() - t0) * 1000)
            
            # 4. Rule Engine (Honeypot, Keyword Stuffing)
            t0 = time.perf_counter()
            filtered_candidates = self._run_rules(semantically_ranked)
            context.record_phase("rule_engine", (time.perf_counter() - t0) * 1000)
            
            # 5. Behavioral Scoring
            t0 = time.perf_counter()
            behaviorally_scored = self.behavioral.score_candidates(filtered_candidates)
            context.record_phase("behavioral_scoring", (time.perf_counter() - t0) * 1000)
            
            # 6. Fusion & Final Ranking
            t0 = time.perf_counter()
            self.fusion.top_k = top_k
            fused_candidates = self.fusion.rank_candidates(behaviorally_scored)
            context.record_phase("fusion", (time.perf_counter() - t0) * 1000)
            
            context.final_candidates = fused_candidates
            
        except Exception as e:
            logger.error(f"Pipeline failed for JD {job_description_id}: {e}")
            context.add_error(str(e))
            
        return self._finalize(context)
        
    def _run_retrieval(self, context: PipelineContext, top_k: int) -> List[Dict[str, Any]]:
        results = self.retrieval.search_candidates(context.job_description_text, top_k=top_k)
        
        async def fetch_candidates_from_db(uuid_list=None):
            async with AsyncSessionLocal() as db:
                if uuid_list:
                    stmt = select(Candidate).filter(Candidate.id.in_(uuid_list))
                else:
                    stmt = select(Candidate)
                res = await db.execute(stmt)
                return res.scalars().all()

        try:
            if results:
                raw_ids = [res["candidate_id"] for res in results if res.get("candidate_id")]
                uuid_list = []
                for rid in raw_ids:
                    try:
                        uuid_list.append(uuid.UUID(rid) if isinstance(rid, str) else rid)
                    except ValueError:
                        pass
                scores_map = {res["candidate_id"]: res["score"] * 100 for res in results}
                db_candidates = asyncio.run(fetch_candidates_from_db(uuid_list if uuid_list else None))
            else:
                scores_map = {}
                db_candidates = asyncio.run(fetch_candidates_from_db(None))
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            if results:
                raw_ids = [res["candidate_id"] for res in results if res.get("candidate_id")]
                uuid_list = []
                for rid in raw_ids:
                    try:
                        uuid_list.append(uuid.UUID(rid) if isinstance(rid, str) else rid)
                    except ValueError:
                        pass
                scores_map = {res["candidate_id"]: res["score"] * 100 for res in results}
                db_candidates = loop.run_until_complete(fetch_candidates_from_db(uuid_list if uuid_list else None))
            else:
                scores_map = {}
                db_candidates = loop.run_until_complete(fetch_candidates_from_db(None))
            loop.close()
            
        hydrated = []
        for cand in db_candidates:
            c_id = str(cand.id)
            hydrated.append({
                "candidate_id": c_id,
                "name": cand.name,
                "email": cand.email,
                "embedding_score": scores_map.get(c_id, 75.0),
                "profile": cand.profile_jsonb or {},
                "behavioral_metrics": {}
            })
            
        return hydrated

    def _run_rules(self, candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        for cand in candidates:
            _, flags = self.rule_engine.apply_rules(cand, 0.0)
            cand["flags"] = cand.get("flags", []) + flags
            if "HONEYPOT_DETECTED" in flags:
                cand["dropped"] = True
                
        return [c for c in candidates if not c.get("dropped", False)]

    def _finalize(self, context: PipelineContext) -> Dict[str, Any]:
        total_time = context.get_total_duration_ms()
        self.metrics.record_pipeline_run(
            context.run_id, 
            total_time, 
            context.phase_timings, 
            len(context.final_candidates)
        )
        
        return {
            "run_id": context.run_id,
            "status": "success" if not context.errors else "error",
            "errors": context.errors,
            "total_time_ms": round(total_time, 2),
            "phase_timings": context.phase_timings,
            "results": context.final_candidates
        }
