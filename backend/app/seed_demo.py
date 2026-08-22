import asyncio
import uuid
import logging
from sqlalchemy import select, delete
from app.database.session import AsyncSessionLocal, engine
from app.core.base_class import Base
from app.models.user import User
from app.models.job import Job
from app.models.candidate import Candidate
from app.models.match import Match
from app.models.action import ActionProposal
from app.models.enums import JobStatus, ActionStatus, ActionType
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

DEMO_JOBS = [
    {
        "title": "Senior Backend Engineer (AI Platform)",
        "description": (
            "We are looking for a Senior Backend Engineer to build robust AI platforms. "
            "You must have strong experience with Python, FastAPI, and SQL databases. "
            "Experience with cloud deployments (AWS or GCP) and machine learning pipelines is a huge plus."
        ),
        "department": "Engineering",
        "location": "San Francisco, CA (Hybrid)",
        "skills": ["Python", "FastAPI", "SQL", "Machine Learning", "AWS", "Backend"],
        "status": JobStatus.ACTIVE,
    },
    {
        "title": "Lead AI / ML Infrastructure Engineer",
        "description": (
            "Seeking a Lead AI Engineer to architect vector retrieval systems and LLM orchestration agentic workflows. "
            "Must be proficient in PyTorch, SentenceTransformers, FAISS, and Python microservices."
        ),
        "department": "AI Research",
        "location": "New York, NY (Remote)",
        "skills": ["Python", "PyTorch", "FAISS", "LangGraph", "LLMs", "Vector Search"],
        "status": JobStatus.ACTIVE,
    },
    {
        "title": "Full Stack Developer (Next.js & Python)",
        "description": (
            "Looking for a versatile Full Stack Developer to build modern web applications. "
            "Requires experience with React, Next.js, TypeScript, TailwindCSS, and Python backend APIs."
        ),
        "department": "Product",
        "location": "Austin, TX (Remote)",
        "skills": ["TypeScript", "Next.js", "React", "Python", "FastAPI", "TailwindCSS"],
        "status": JobStatus.ACTIVE,
    },
    {
        "title": "DevOps & Cloud Systems Architect",
        "description": (
            "Architect and maintain cloud infrastructure on AWS/GCP. "
            "Experience with Docker, Kubernetes, Terraform, CI/CD pipelines, and Redis caching systems required."
        ),
        "department": "Infrastructure",
        "location": "Seattle, WA (Hybrid)",
        "skills": ["Kubernetes", "AWS", "Docker", "Terraform", "CI/CD", "Redis"],
        "status": JobStatus.ACTIVE,
    },
]

DEMO_CANDIDATES = [
    {
        "name": "Alice Chen",
        "email": "alice.chen@example.com",
        "phone": "+1-555-0101",
        "skills": ["Python", "FastAPI", "SQL", "AWS", "PostgreSQL", "Docker", "Machine Learning"],
        "role": "Senior Backend Engineer",
        "experience_years": 5,
        "experience": [
            {"title": "Senior Backend Engineer", "company": "DataCorp", "years": 5, "description": "Built high-performance APIs using FastAPI and Python. Scaled Postgres databases on AWS. Integrated ML models."}
        ],
        "education": "MS Computer Science, Stanford University",
    },
    {
        "name": "Bob Smith",
        "email": "bob.smith@example.com",
        "phone": "+1-555-0202",
        "skills": ["JavaScript", "React", "Node.js", "MongoDB", "Express", "CSS", "HTML", "TypeScript"],
        "role": "Frontend Developer",
        "experience_years": 3,
        "experience": [
            {"title": "Frontend Developer", "company": "WebTech", "years": 3, "description": "Developed SPA using React, Next.js, and Node.js. Built beautiful responsive user interfaces."}
        ],
        "education": "BS Computer Science, State University",
    },
    {
        "name": "Charlie Davis",
        "email": "charlie.davis@example.com",
        "phone": "+1-555-0303",
        "skills": ["Python", "PyTorch", "FAISS", "LangGraph", "SentenceTransformers", "GCP", "Kubernetes", "Redis"],
        "role": "Lead AI Engineer",
        "experience_years": 6,
        "experience": [
            {"title": "Lead AI Engineer", "company": "NeuralMind", "years": 6, "description": "Architected vector search indices using FAISS and PyTorch. Deployed LangGraph agentic pipelines."}
        ],
        "education": "PhD Artificial Intelligence, MIT",
    },
    {
        "name": "Diana Prince",
        "email": "diana.prince@example.com",
        "phone": "+1-555-0404",
        "skills": ["Kubernetes", "AWS", "Docker", "Terraform", "CI/CD", "Redis", "Linux"],
        "role": "DevOps Architect",
        "experience_years": 7,
        "experience": [
            {"title": "DevOps Architect", "company": "CloudSys", "years": 7, "description": "Automated multi-region Kubernetes clusters on AWS using Terraform and GitHub Actions."}
        ],
        "education": "BS Information Systems",
    },
    {
        "name": "Ethan Hunt",
        "email": "ethan.hunt@example.com",
        "phone": "+1-555-0505",
        "skills": ["TypeScript", "Next.js", "React", "Python", "FastAPI", "TailwindCSS", "SQL"],
        "role": "Full Stack Engineer",
        "experience_years": 4,
        "experience": [
            {"title": "Full Stack Engineer", "company": "AppForge", "years": 4, "description": "Built end-to-end recruiter analytics dashboards with Next.js 14 and FastAPI backends."}
        ],
        "education": "BS Software Engineering, UC Berkeley",
    },
    {
        "name": "Fiona Gallagher",
        "email": "fiona.gallagher@example.com",
        "phone": "+1-555-0606",
        "skills": ["Python", "FastAPI", "SQL", "PostgreSQL", "Redis", "Elasticsearch"],
        "role": "Backend Engineer",
        "experience_years": 4,
        "experience": [
            {"title": "Backend Engineer", "company": "StreamData", "years": 4, "description": "Developed high-throughput API gateways and Redis caching layers for real-time candidate search."}
        ],
        "education": "MS Computer Science, Carnegie Mellon",
    },
    {
        "name": "George Clark",
        "email": "george.clark@example.com",
        "phone": "+1-555-0707",
        "skills": ["Python", "PyTorch", "Machine Learning", "NLP", "FastAPI", "Docker"],
        "role": "ML Engineer",
        "experience_years": 5,
        "experience": [
            {"title": "ML Engineer", "company": "AI Labs", "years": 5, "description": "Trained domain-specific Cross-Encoder reranking models for candidate-job semantic relevance."}
        ],
        "education": "MS Data Science, Columbia University",
    },
    {
        "name": "Hannah Abbott",
        "email": "hannah.abbott@example.com",
        "phone": "+1-555-0808",
        "skills": ["TypeScript", "React", "Next.js", "TailwindCSS", "Figma", "Design Systems"],
        "role": "Frontend UI/UX Specialist",
        "experience_years": 3,
        "experience": [
            {"title": "UI/UX Engineer", "company": "PixelCraft", "years": 3, "description": "Designed accessible dark and light mode UI component libraries using Framer Motion."}
        ],
        "education": "BFA Design & Computer Science",
    },
]

async def seed_demo_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        logger.info("Clearing existing demo data...")
        
        await db.execute(delete(Match))
        await db.execute(delete(ActionProposal))
        await db.execute(delete(Job))
        await db.execute(delete(Candidate).where(Candidate.email.like("%@example.com")))
        
        # Seed Demo User (Always ensure recruiter@talentmind.ai has password123)
        user_res = await db.execute(select(User).where(User.email == "recruiter@talentmind.ai"))
        existing_user = user_res.scalar_one_or_none()
        if not existing_user:
            logger.info("Seeding Demo User: recruiter@talentmind.ai ...")
            demo_user = User(
                id=uuid.uuid4(),
                email="recruiter@talentmind.ai",
                hashed_password=get_password_hash("password123"),
                role="RECRUITER",
                is_active=True
            )
            db.add(demo_user)
        else:
            logger.info("Updating Demo User password: recruiter@talentmind.ai ...")
            existing_user.hashed_password = get_password_hash("password123")
            existing_user.is_active = True
        
        await db.commit()
        
        seeded_jobs = []
        logger.info("Seeding Demo Jobs...")
        for j_data in DEMO_JOBS:
            job = Job(
                id=uuid.uuid4(),
                title=j_data["title"],
                description=j_data["description"],
                department=j_data["department"],
                location=j_data["location"],
                skills=j_data["skills"],
                status=j_data["status"]
            )
            db.add(job)
            seeded_jobs.append(job)
            
        seeded_candidates = []
        logger.info("Seeding Demo Candidates...")
        for c in DEMO_CANDIDATES:
            cand = Candidate(
                id=uuid.uuid4(),
                name=c["name"],
                email=c["email"],
                profile_jsonb={
                    "name": c["name"],
                    "email": c["email"],
                    "phone": c["phone"],
                    "skills": c["skills"],
                    "role": c["role"],
                    "experience_years": c["experience_years"],
                    "experience": c["experience"],
                    "education": c["education"]
                }
            )
            db.add(cand)
            seeded_candidates.append(cand)
            
        await db.commit()
        
        # Seed Demo Action Proposals for Human-In-The-Loop Review Queue
        logger.info("Seeding Demo Action Proposals...")
        proposal1 = ActionProposal(
            id=uuid.uuid4(),
            job_id=seeded_jobs[0].id,
            action_type=ActionType.EMAIL_CANDIDATE,
            target_id=str(seeded_candidates[0].id),
            status=ActionStatus.PENDING_APPROVAL,
            reason="Alice Chen achieved a top 81.0% final rank for Senior Backend Engineer. Recommended sending technical assessment outreach email.",
            payload={
                "recipient": seeded_candidates[0].email,
                "subject": "Interview Invitation: Senior Backend Engineer (AI Platform) at TalentMind AI",
                "body": (
                    "Hi Alice,\n\n"
                    "We were thoroughly impressed by your background in Python, FastAPI, and AWS. "
                    "Our AI ranking system identified your profile as the top match for our Senior Backend Engineer position.\n\n"
                    "Would you be available for a 30-minute introductory call next week?\n\n"
                    "Best regards,\nTalentMind Recruitment Team"
                )
            }
        )
        
        proposal2 = ActionProposal(
            id=uuid.uuid4(),
            job_id=seeded_jobs[1].id,
            action_type=ActionType.SCHEDULE_INTERVIEW,
            target_id=str(seeded_candidates[2].id),
            status=ActionStatus.PENDING_APPROVAL,
            reason="Charlie Davis has exceptional expertise in FAISS, PyTorch, and LangGraph. Proposing technical architecture interview.",
            payload={
                "recipient": seeded_candidates[2].email,
                "subject": "Technical Architecture Session: Lead AI / ML Engineer",
                "body": (
                    "Hi Charlie,\n\n"
                    "Your experience with PyTorch and vector index optimization on GCP makes you an outstanding fit for our Lead AI Engineer role. "
                    "We would love to schedule a technical architecture discussion with our Head of AI.\n\n"
                    "Best regards,\nTalentMind AI Research Team"
                )
            }
        )

        proposal3 = ActionProposal(
            id=uuid.uuid4(),
            job_id=seeded_jobs[2].id,
            action_type=ActionType.SHORTLIST_CANDIDATE,
            target_id=str(seeded_candidates[4].id),
            status=ActionStatus.PENDING_APPROVAL,
            reason="Ethan Hunt has strong experience in Next.js 14 and FastAPI. Recommended shortlisting for Full Stack role.",
            payload={
                "recipient": seeded_candidates[4].email,
                "subject": "Candidate Shortlisted: Full Stack Developer",
                "body": "Ethan Hunt has been shortlisted for final hiring manager interview."
            }
        )
        
        db.add_all([proposal1, proposal2, proposal3])
        await db.commit()

        # Auto-index candidates into FAISS
        from app.ai.retrieval.service import RetrievalService
        formatted_cands = [{'candidate_id': str(c.id), 'profile': c.profile_jsonb or {}} for c in seeded_candidates]
        RetrievalService().index_candidates(formatted_cands)
        
        logger.info("Demo User, Jobs, Candidates, and Action Proposals seeded & indexed successfully!")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(seed_demo_data())
