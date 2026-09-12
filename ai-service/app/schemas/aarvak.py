from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from app.models.integration import SyncStatusEnum

class AarvakVerifiedRecord(BaseModel):
    achievement_id: str
    team_id: str
    category: str
    achievement_date: str
    verification_status: str
    rule_version: str
    points: int
    verified_at: datetime
    title: str

class AarvakIntegrationSummary(BaseModel):
    total_verified_eligible: int
    synced_count: int
    pending_sync_count: int
    failed_count: int
    last_sync_timestamp: Optional[datetime] = None
    records: List[Dict[str, Any]]

class AarvakSyncRequest(BaseModel):
    achievement_ids: Optional[List[str]] = None  # None = all ready records
    force_resync: bool = False

class AarvakSyncResult(BaseModel):
    synced_count: int
    skipped_count: int
    failed_count: int
    idempotency_keys: List[str]
    message: str
