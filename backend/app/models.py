import enum
import uuid
from sqlalchemy import Text
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship

from .database import Base


def gen_id():
    return str(uuid.uuid4())


class RoleEnum(str, enum.Enum):
    admin = "admin"
    campaign_manager = "campaign_manager"
    comms_team = "comms_team"


class CampaignTypeEnum(str, enum.Enum):
    awareness = "awareness"
    emergency = "emergency"
    education = "education"
    announcement = "announcement"


class CampaignStatusEnum(str, enum.Enum):
    draft = "draft"
    scheduled = "scheduled"
    published = "published"
    sending = "sending"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class ChannelEnum(str, enum.Enum):
    email = "email"
    sms = "sms"
    whatsapp = "whatsapp"
    push = "push"
    web = "web"


class MessageStatusEnum(str, enum.Enum):
    pending = "pending"
    sent = "sent"
    delivered = "delivered"
    failed = "failed"
    opened = "opened"
    clicked = "clicked"


# ---------------------------------------------------------------------------
# Module 1: Audience Management & Campaign Planning
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_id)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.comms_team)
    organization = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class Recipient(Base):
    __tablename__ = "recipients"

    id = Column(
        String,
        primary_key=True,
        default=gen_id
    )

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        default=""
    )

    phone = Column(
        String,
        default=""
    )

    device_token = Column(
        String,
        default=""
    )

    language = Column(
        String,
        default="English"
    )

    state = Column(
        String,
        default=""
    )

    city = Column(
        String,
        default=""
    )

    occupation = Column(
        String,
        default=""
    )

    organization = Column(
        String,
        default=""
    )


    engagement_score = Column(
        Float,
        default=0.0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # OneSignal browser push subscription ID
    onesignal_subscription_id = Column(
        String,
        nullable=True
    )

class Template(Base):
    __tablename__ = "templates"
    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    category = Column(Enum(CampaignTypeEnum), default=CampaignTypeEnum.announcement)
    content = Column(Text, default="")
    language = Column(String, default="English")
    created_at = Column(DateTime, default=datetime.utcnow)


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(
        String,
        primary_key=True,
        default=gen_id
    )

    name = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        default=""
    )

    type = Column(
        Enum(CampaignTypeEnum),
        default=CampaignTypeEnum.announcement
    )

    status = Column(
        Enum(CampaignStatusEnum),
        default=CampaignStatusEnum.draft
    )

    created_by = Column(
        String,
        ForeignKey("users.id"),
        nullable=True
    )

    segment_filter = Column(
        Text,
        default="{}"
    )

    recipient_ids = Column(
        Text,
        default="[]"
)

    channels = Column(
        String,
        default=""
    )

    scheduled_at = Column(
        DateTime,
        nullable=True
    )

    started_at = Column(
    DateTime,
    nullable=True
)

    completed_at = Column(
    DateTime,
    nullable=True
)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    contents = relationship(
        "CampaignContent",
        back_populates="campaign",
        cascade="all, delete-orphan"
    )

    messages = relationship(
        "Message",
        back_populates="campaign",
        cascade="all, delete-orphan"
    )

    posters = relationship(
        "Poster",
        back_populates="campaign",
        cascade="all, delete-orphan"
    )

    engagement_events = relationship(
        "EngagementEvent",
        back_populates="campaign",
        cascade="all, delete-orphan"
    )

# ---------------------------------------------------------------------------
# Module 2: AI Content Generation & Multilingual Communication
# ---------------------------------------------------------------------------

class CampaignContent(Base):
    __tablename__ = "campaign_contents"
    id = Column(String, primary_key=True, default=gen_id)
    campaign_id = Column(String, ForeignKey("campaigns.id"))
    language = Column(String, default="English")
    tone = Column(String, default="informative")
    content = Column(Text, default="")
    generated_by_ai = Column(Boolean, default=True)
    sentiment_score = Column(Float, nullable=True)  # -1..1
    compliance_ok = Column(Boolean, default=True)
    compliance_notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    campaign = relationship("Campaign", back_populates="contents")


# ---------------------------------------------------------------------------
# Module 3: Multi-Channel Distribution & Engagement Analytics
# ---------------------------------------------------------------------------

class Message(Base):
    __tablename__ = "messages"
    id = Column(String, primary_key=True, default=gen_id)
    campaign_id = Column(String, ForeignKey("campaigns.id"))
    recipient_id = Column(String, ForeignKey("recipients.id"))

    channel = Column(Enum(ChannelEnum), default=ChannelEnum.email)
    language = Column(String, default="English")
    content = Column(Text, default="")  # the actual personalized text delivered to this recipient
    status = Column(Enum(MessageStatusEnum), default=MessageStatusEnum.pending)

    recipient_address = Column(String, default="")
    provider = Column(String, default="")
    provider_message_id = Column(String, default="")
    error_message = Column(Text, default="")
    retry_count = Column(Integer, default=0)

    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    opened_at = Column(DateTime, nullable=True)
    clicked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    campaign = relationship("Campaign", back_populates="messages")
    recipient = relationship("Recipient")


class EngagementEvent(Base):
    __tablename__ = "engagement_events"

    id = Column(
        String,
        primary_key=True,
        default=gen_id
    )

    campaign_id = Column(
        String,
        ForeignKey("campaigns.id"),
        nullable=True
    )

    message_id = Column(
        String,
        ForeignKey("messages.id"),
        nullable=True
    )

    event_type = Column(
        String,
        default="feedback"
    )

    sentiment = Column(
        String,
        default=""
    )

    comment = Column(
        Text,
        default=""
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


    campaign = relationship(
        "Campaign",
        back_populates="engagement_events"
    )

class Poster(Base):
    __tablename__ = "posters"

    id = Column(String, primary_key=True, default=gen_id)

    campaign_id = Column(
        String,
        ForeignKey("campaigns.id"),
        nullable=False
    )

    title = Column(String, nullable=False)

    language = Column(String, default="English")

    content = Column(Text, default="")

    image_url = Column(String, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


    campaign = relationship(
        "Campaign",
        back_populates="posters"
    )

class LiveBulletin(Base):
    __tablename__ = "live_bulletins"

    id = Column(
        String,
        primary_key=True,
        index=True,
        default=gen_id
    )

    title = Column(
        String(255),
        nullable=False
    )

    content = Column(
        Text,
        nullable=False
    )

    category = Column(
        String(100),
        nullable=False
    )

    priority = Column(
        String(50),
        default="Medium"
    )

    status = Column(
        String(50),
        default="Draft"
    )

    target_location = Column(
        String(255),
        nullable=True
    )

    languages = Column(
        String(500),
        nullable=True
    )

    channels = Column(
        String(500),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    published_at = Column(
        DateTime,
        nullable=True
    )

    expires_at = Column(
        DateTime,
        nullable=True
    )