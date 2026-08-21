import asyncio
from app.ai.retrieval.service import RetrievalService
from app.database.session import AsyncSessionLocal
from app.models.candidate import Candidate
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Candidate))
        cands = res.scalars().all()
        formatted = [{'candidate_id': str(c.id), 'profile': c.profile_jsonb or {}} for c in cands]
        RetrievalService().index_candidates(formatted)
        print(f"Indexed {len(formatted)} candidates in FAISS index.")

if __name__ == '__main__':
    asyncio.run(main())
