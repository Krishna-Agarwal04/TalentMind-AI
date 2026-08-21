from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timezone
import uuid

from app.database.session import get_db
from app.models.action import ActionProposal
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.enums import ActionStatus
from app.schemas.action import ActionProposalResponse
from app.core.auth import get_current_user

router = APIRouter()

async def _enrich_proposal(db: AsyncSession, proposal: ActionProposal) -> dict:
    d = {
        "id": proposal.id,
        "job_id": proposal.job_id,
        "agent_run_id": proposal.agent_run_id,
        "action_type": proposal.action_type,
        "target_id": proposal.target_id,
        "status": proposal.status,
        "payload": proposal.payload or {},
        "reason": proposal.reason,
        "created_at": proposal.created_at,
        "updated_at": proposal.updated_at,
        "approved_at": proposal.approved_at,
        "rejected_at": proposal.rejected_at,
        "executed_at": proposal.executed_at,
        "approved_by": proposal.approved_by,
        "rejected_by": proposal.rejected_by,
        "provider": proposal.provider,
        "execution_result": proposal.execution_result,
        "execution_error": proposal.execution_error,
        "candidate_name": None,
        "candidate_email": None,
        "job_title": None,
    }
    
    # Try fetching candidate details from target_id
    if proposal.target_id:
        try:
            cand_uuid = uuid.UUID(proposal.target_id)
            c_res = await db.execute(select(Candidate).filter(Candidate.id == cand_uuid))
            cand = c_res.scalars().first()
            if cand:
                d["candidate_name"] = cand.name
                d["candidate_email"] = cand.email
        except Exception:
            pass

    # Try fetching job title from job_id
    if proposal.job_id:
        try:
            j_res = await db.execute(select(Job).filter(Job.id == proposal.job_id))
            j_obj = j_res.scalars().first()
            if j_obj:
                d["job_title"] = j_obj.title
        except Exception:
            pass

    return d

@router.get("/", response_model=List[ActionProposalResponse])
async def list_approvals(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all action proposals with enriched candidate and job details.
    """
    result = await db.execute(
        select(ActionProposal)
        .order_by(ActionProposal.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    proposals = result.scalars().all()
    
    enriched = []
    for p in proposals:
        enriched.append(await _enrich_proposal(db, p))
    return enriched

@router.get("/candidate/{candidate_id}", response_model=List[ActionProposalResponse])
async def list_candidate_approvals(
    candidate_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
) -> Any:
    """
    Retrieve action proposals associated with a specific candidate ID.
    """
    result = await db.execute(
        select(ActionProposal)
        .filter(ActionProposal.target_id == candidate_id)
        .order_by(ActionProposal.created_at.desc())
    )
    proposals = result.scalars().all()
    
    enriched = []
    for p in proposals:
        enriched.append(await _enrich_proposal(db, p))
    return enriched

@router.get("/job/{job_id}", response_model=List[ActionProposalResponse])
async def list_job_approvals(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
) -> Any:
    """
    Retrieve action proposals associated with a specific job ID.
    """
    try:
        j_uuid = uuid.UUID(job_id)
    except ValueError:
        return []

    result = await db.execute(
        select(ActionProposal)
        .filter(ActionProposal.job_id == j_uuid)
        .order_by(ActionProposal.created_at.desc())
    )
    proposals = result.scalars().all()
    
    enriched = []
    for p in proposals:
        enriched.append(await _enrich_proposal(db, p))
    return enriched

@router.get("/{id}", response_model=ActionProposalResponse)
async def get_approval(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
) -> Any:
    """
    Get a specific action proposal by ID.
    """
    try:
        uuid_id = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
        
    result = await db.execute(select(ActionProposal).filter(ActionProposal.id == uuid_id))
    proposal = result.scalars().first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Action proposal not found")
    return await _enrich_proposal(db, proposal)

@router.post("/{id}/approve", response_model=ActionProposalResponse)
async def approve_action(
    id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Approve an action proposal.
    """
    try:
        uuid_id = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
        
    result = await db.execute(select(ActionProposal).filter(ActionProposal.id == uuid_id))
    proposal = result.scalars().first()
    
    if not proposal:
        raise HTTPException(status_code=404, detail="Action proposal not found")
        
    if proposal.status != ActionStatus.PENDING_APPROVAL:
        raise HTTPException(status_code=400, detail=f"Cannot approve action in state {proposal.status}")
        
    proposal.status = ActionStatus.APPROVED
    proposal.approved_at = datetime.now(timezone.utc)
    try:
        proposal.approved_by = uuid.UUID(current_user.user_id)
    except Exception:
        proposal.approved_by = None
    
    await db.commit()
    await db.refresh(proposal)
    return await _enrich_proposal(db, proposal)

@router.post("/{id}/reject", response_model=ActionProposalResponse)
async def reject_action(
    id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Reject an action proposal.
    """
    try:
        uuid_id = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
        
    result = await db.execute(select(ActionProposal).filter(ActionProposal.id == uuid_id))
    proposal = result.scalars().first()
    
    if not proposal:
        raise HTTPException(status_code=404, detail="Action proposal not found")
        
    if proposal.status != ActionStatus.PENDING_APPROVAL:
        raise HTTPException(status_code=400, detail=f"Cannot reject action in state {proposal.status}")
        
    proposal.status = ActionStatus.REJECTED
    proposal.rejected_at = datetime.now(timezone.utc)
    try:
        proposal.rejected_by = uuid.UUID(current_user.user_id)
    except Exception:
        proposal.rejected_by = None
    
    await db.commit()
    await db.refresh(proposal)
    return await _enrich_proposal(db, proposal)

@router.post("/{id}/execute", response_model=ActionProposalResponse)
async def execute_approved_action(
    id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Execute an APPROVED action proposal safely.
    """
    from app.services.action_executor import execute_action
    from app.core.exceptions import ForbiddenError, NotFoundError
    
    try:
        proposal = await execute_action(
            db,
            id,
            actor_user_id=current_user.user_id,
            actor_role=current_user.role,
        )
        return await _enrich_proposal(db, proposal)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e.detail))
    except ForbiddenError as e:
        raise HTTPException(status_code=403, detail=str(e.detail))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal execution error")
