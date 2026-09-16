from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

from .models import (
    RoleEnum,
    CampaignTypeEnum,
    CampaignStatusEnum,
)


# ---------- Auth ----------

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "comms_team"
    organization: str = ""


class UserOut(BaseModel):
    id: str
    username: str
    email: str
    role: str
    organization: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Recipients / Audience ----------

class RecipientCreate(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    language: str = "English"
    state: str = ""
    city: str = ""
    occupation: str = ""
    organization: str = ""
    


class RecipientOut(RecipientCreate):
    id: str
    engagement_score: float

    class Config:
        from_attributes = True


class SegmentFilter(BaseModel):
    language: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    occupation: Optional[str] = None
    organization: Optional[str] = None
    min_engagement_score: Optional[float] = None
    max_engagement_score: Optional[float] = None


# ---------- Templates ----------

class TemplateCreate(BaseModel):
    name: str
    category: str = "announcement"
    content: str = ""
    language: str = "English"


class TemplateOut(TemplateCreate):
    id: str

    class Config:
        from_attributes = True


# ---------- Campaigns ----------

from datetime import datetime


class CampaignCreate(BaseModel):
    name: str
    description: str = ""
    type: CampaignTypeEnum

    segment_filter: SegmentFilter

    recipient_ids: List[str] = []

    channels: List[str] = []

    status: CampaignStatusEnum = CampaignStatusEnum.draft

    scheduled_at: Optional[datetime] = None


class CampaignOut(BaseModel):
    id: str
    name: str
    description: str
    type: CampaignTypeEnum
    status: CampaignStatusEnum

    scheduled_at: Optional[datetime]

    created_by: str | None

    recipient_ids: List[str] = []
    channels: List[str] = []

    segment_filter: SegmentFilter

    class Config:
        from_attributes = True


# ---------- AI Content ----------

class SentimentRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    score: float
    label: str
    suggested_tone: str = "Informative"
    improved_message: str = ""


class ComplianceResponse(BaseModel):
    compliance_ok: bool
    compliance_notes: str
    readability: str
    suggestions: List[str]

    
class GenerateContentRequest(BaseModel):
    campaign_id: str
    brief: str
    tone: str = "informative"

class TranslateRequest(BaseModel):
    campaign_id: str
    source_content: str
    tone: str = "informative"
    target_languages: List[str] = ["Hindi"]


class PersonalizeRequest(BaseModel):
    content: str
    recipient_id: str

class ContentReviewRequest(BaseModel):
    text: str
    tone: str = "informative"

class ContentReviewResponse(ComplianceResponse):
    sentiment_score: float
    sentiment_label: str
    suggested_tone: str
    improved_message: str

class CampaignContentOut(BaseModel):
    id: str
    campaign_id: str
    language: str
    tone: str
    content: str
    generated_by_ai: bool
    sentiment_score: Optional[float] = None
    compliance_ok: bool
    compliance_notes: str

    class Config:
        from_attributes = True


# ---------- Distribution ----------

class SendRequest(BaseModel):
    campaign_id: str
    channels: List[str]
    send_immediately: bool = True
    scheduled_at: Optional[datetime] = None


class MessageOut(BaseModel):
    id: str
    campaign_id: str
    recipient_id: str

    channel: str
    language: str
    content: str

    status: str

    recipient_address: str
    provider: str
    provider_message_id: str
    error_message: str
    retry_count: int

    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    opened_at: Optional[datetime] = None
    clicked_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DistributionStatus(BaseModel):
    total: int
    pending: int
    sent: int
    delivered: int
    failed: int

class ChannelStatus(BaseModel):
    channel: str
    total: int
    delivered: int
    failed: int


class DistributionResponse(BaseModel):
    message: str
    campaign_id: str
    
class TrackEventRequest(BaseModel):
    message_id: str
    event_type: str  # open | click | response | feedback
    comment: str = ""

class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str

class PublicFeedbackCreate(BaseModel):
    campaign_id: str
    comment: str

class SubscriptionUpdate(BaseModel):
    subscription_id: str
    language: str = "English"