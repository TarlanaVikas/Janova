import json
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth, ai_service
from ..database import get_db
from ..services.distribution.distribution_manager import DistributionManager


router = APIRouter(
    prefix="/distribution",
    tags=["Distribution & Analytics"],
)


# ============================================================
# SEND CAMPAIGN
# ============================================================

@router.post(
    "/send",
    response_model=List[schemas.MessageOut],
)
async def send_campaign(
    payload: schemas.SendRequest,
    db: Session = Depends(get_db),
    _user: models.User = Depends(
        auth.require_roles(
            ["admin", "campaign_manager", "comms_team"]
        )
    ),
):
    """
    Distribute a campaign through the selected communication channels.

    Flow:

    Campaign
        ↓
    Audience Segmentation
        ↓
    AI Personalization
        ↓
    DistributionManager
        ↓
    EmailService / SMSService / WhatsAppService /
    PushService 
        ↓
    Message records
        ↓
    Analytics
    """

    # --------------------------------------------------------
    # 1. Find campaign
    # --------------------------------------------------------

    campaign = (
        db.query(models.Campaign)
        .filter(models.Campaign.id == payload.campaign_id)
        .first()
    )

    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found",
        )

    # --------------------------------------------------------
    # 2. Validate channels
    # --------------------------------------------------------

    if not payload.channels:
        raise HTTPException(
            status_code=400,
            detail="At least one distribution channel must be selected",
        )

    valid_channels = {
        "email",
        "sms",
        "whatsapp",
        "push",
        "web",
    }

    selected_channels = []

    for channel in payload.channels:

        if isinstance(channel, models.ChannelEnum):
            channel_name = channel.value
        else:
            channel_name = str(channel).strip().lower()

        if channel_name not in valid_channels:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported channel: {channel_name}",
            )

        if channel_name not in selected_channels:
            selected_channels.append(channel_name)

        # --------------------------------------------------------
    # 3. Read campaign audience segmentation
    # --------------------------------------------------------

    try:
        filt = json.loads(
            campaign.segment_filter or "{}"
        )

    except (json.JSONDecodeError, TypeError):
        filt = {}


    # --------------------------------------------------------
    # 4. Find matching recipients
    # --------------------------------------------------------

    query = db.query(models.Recipient)


    for field in [
        "language",
        "state",
        "city",
        "occupation",
        "organization",
    ]:

        value = filt.get(field)

        if value:
            query = query.filter(
                getattr(models.Recipient, field) == value
            )

    if filt.get("min_engagement_score") is not None:
        query = query.filter(
            models.Recipient.engagement_score >= float(filt["min_engagement_score"])
        )

    if filt.get("max_engagement_score") is not None:
        query = query.filter(
            models.Recipient.engagement_score <= float(filt["max_engagement_score"])
        )

    recipients = query.all()


    # --------------------------------------------------------
    # 4A. If campaign has manually selected recipients
    # --------------------------------------------------------

    if hasattr(campaign, "recipient_ids") and campaign.recipient_ids:

        try:
            selected_ids = json.loads(
                campaign.recipient_ids
            )

            selected_query = db.query(models.Recipient).filter(
                models.Recipient.id.in_(selected_ids)
            )
            for field in ["language", "state", "city", "occupation", "organization"]:
                value = filt.get(field)
                if value:
                    selected_query = selected_query.filter(
                        getattr(models.Recipient, field) == value
                    )
            if filt.get("min_engagement_score") is not None:
                selected_query = selected_query.filter(
                    models.Recipient.engagement_score >= float(filt["min_engagement_score"])
                )
            if filt.get("max_engagement_score") is not None:
                selected_query = selected_query.filter(
                    models.Recipient.engagement_score <= float(filt["max_engagement_score"])
                )
            recipients = selected_query.all()

        except Exception:
            pass



    if not recipients and "push" not in selected_channels:
           raise HTTPException(
        status_code=400,
        detail="No recipients found for this campaign."
    )

    # --------------------------------------------------------
    # 5. Pre-deployment AI quality/compliance gate
    # --------------------------------------------------------
    contents = (
        db.query(models.CampaignContent)
        .filter(models.CampaignContent.campaign_id == campaign.id)
        .all()
    )
    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Campaign has no generated content. Generate and review content before deployment.",
        )
    non_compliant = [c for c in contents if c.compliance_ok is False]
    if non_compliant:
        raise HTTPException(
            status_code=400,
            detail="Campaign contains content that failed compliance review. Review or regenerate it before deployment.",
        )

    # --------------------------------------------------------
    # 6. Load campaign content
    # --------------------------------------------------------

    contents = (
        db.query(models.CampaignContent)
        .filter(
            models.CampaignContent.campaign_id
            == campaign.id
        )
        .all()
    )

    content_by_lang = {
        content.language: content.content
        for content in contents
    }

    default_content = (
        contents[0].content
        if contents
        else campaign.description or ""
    )
    

    # --------------------------------------------------------
    # 6. Personalize content
    # --------------------------------------------------------

    personalized_content = {}

    for recipient in recipients:

        lang_content = content_by_lang.get(
            recipient.language,
            default_content,
        )

        try:

            personalized = await ai_service.personalize_content(
                lang_content,
                recipient.name,
                recipient.occupation,
                recipient.organization,
                recipient.language,
                recipient.state,
                recipient.city,
                recipient.engagement_score,
            )

        except Exception:

            # If AI personalization fails,
            # use the original campaign content.
            personalized = lang_content

        personalized_content[recipient.id] = personalized

    # --------------------------------------------------------
    # 7. Send through DistributionManager
    # --------------------------------------------------------

    distribution_manager = DistributionManager(db)

    created_messages = await distribution_manager.send(
        campaign=campaign,
        recipients=recipients,
        channels=selected_channels,
        personalized_content=personalized_content,
    )

    # --------------------------------------------------------
    # 8. Update campaign information
    # --------------------------------------------------------

    campaign.channels = ",".join(
        selected_channels
    )

    # Determine campaign status based on actual results.

    if created_messages:

        has_pending_or_sent = any(
            message.status
            in (
                models.MessageStatusEnum.pending,
                models.MessageStatusEnum.sent,
            )
            for message in created_messages
        )

        has_delivered = any(
            message.status
            == models.MessageStatusEnum.delivered
            for message in created_messages
        )

        has_failed = any(
            message.status
            == models.MessageStatusEnum.failed
            for message in created_messages
        )

        if has_pending_or_sent:
            campaign.status = (
                models.CampaignStatusEnum.sending
            )

        elif has_failed and not has_delivered:
            campaign.status = (
                models.CampaignStatusEnum.sending
            )

        else:
            campaign.status = (
                models.CampaignStatusEnum.completed
            )

    db.commit()

    # DistributionManager already refreshes
    # the messages before returning them.

    return created_messages


# ============================================================
# TRACK ENGAGEMENT EVENT
# ============================================================

@router.post("/track")
async def track_event(
    payload: schemas.TrackEventRequest,
    db: Session = Depends(get_db),
):
    """
    Track engagement events.

    Supported events:

    - open
    - click
    - response
    - feedback
    """

    message = (
        db.query(models.Message)
        .filter(
            models.Message.id
            == payload.message_id
        )
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found",
        )

    now = datetime.utcnow()

    # --------------------------------------------------------
    # Update message status
    # --------------------------------------------------------

    if payload.event_type == "open":

        message.status = (
            models.MessageStatusEnum.opened
        )

        message.opened_at = now

    elif payload.event_type == "click":

        message.status = (
            models.MessageStatusEnum.clicked
        )

        message.clicked_at = now

    # --------------------------------------------------------
    # Analyze feedback sentiment
    # --------------------------------------------------------

    sentiment_label = ""

    if payload.comment:

        result = await ai_service.analyze_sentiment(
            payload.comment
        )

        sentiment_label = result.get(
            "label",
            "",
        )

    # --------------------------------------------------------
    # Create engagement event
    # --------------------------------------------------------

    event = models.EngagementEvent(
        message_id=message.id,
        event_type=payload.event_type,
        sentiment=sentiment_label,
        comment=payload.comment,
    )

    db.add(event)

    # --------------------------------------------------------
    # Update recipient engagement score
    # --------------------------------------------------------

    recipient = (
        db.query(models.Recipient)
        .filter(
            models.Recipient.id
            == message.recipient_id
        )
        .first()
    )

    if recipient:

        bump = {
            "open": 0.5,
            "click": 1.0,
            "response": 1.5,
            "feedback": 1.0,
        }.get(
            payload.event_type,
            0.2,
        )

        recipient.engagement_score = round(
            (recipient.engagement_score or 0)
            + bump,
            2,
        )

    db.commit()

    return {
        "tracked": True,
        "sentiment": sentiment_label,
    }


# ============================================================
# DELIVERY STATUS
# ============================================================

@router.get("/status/{campaign_id}")
def delivery_status(
    campaign_id: str,
    db: Session = Depends(get_db),
    _user: models.User = Depends(
        auth.get_current_user
    ),
):
    """
    Return delivery statistics grouped by
    status and communication channel.
    """

    messages = (
        db.query(models.Message)
        .filter(
            models.Message.campaign_id
            == campaign_id
        )
        .all()
    )

    counts = {}

    for message in messages:

        if message.status:
            status = message.status.value

            counts[status] = (
                counts.get(status, 0) + 1
            )

    channel_counts = {}

    for message in messages:

        if message.channel:
            channel = message.channel.value

            channel_counts[channel] = (
                channel_counts.get(channel, 0) + 1
            )

    return {
        "total": len(messages),
        "by_status": counts,
        "by_channel": channel_counts,
    }


# ============================================================
# LIST CAMPAIGN MESSAGES
# ============================================================

@router.get(
    "/messages/{campaign_id}",
    response_model=List[schemas.MessageOut],
)
def list_messages(
    campaign_id: str,
    limit: int = 20,
    db: Session = Depends(get_db),
    _user: models.User = Depends(
        auth.get_current_user
    ),
):
    """
    Return campaign messages for review.
    """

    if limit < 1:
        limit = 1

    if limit > 100:
        limit = 100

    return (
        db.query(models.Message)
        .filter(
            models.Message.campaign_id
            == campaign_id
        )
        .order_by(
            models.Message.created_at.desc()
        )
        .limit(limit)
        .all()
    )


# ============================================================
# RETRY FAILED MESSAGES
# ============================================================

@router.post(
    "/retry-failed/{campaign_id}"
)
async def retry_failed_messages(
    campaign_id: str,
    db: Session = Depends(get_db),
    _user: models.User = Depends(
        auth.require_roles(
            ["admin", "campaign_manager"]
        )
    ),
):
    """
    Retry failed messages.

    This endpoint currently reports the failed messages.
    Real provider-specific retry logic should be handled
    by the individual channel services.

    Email retries should call EmailService.
    SMS retries should call SMSService.
    WhatsApp retries should call WhatsAppService.
    """

    failed_messages = (
        db.query(models.Message)
        .filter(
            models.Message.campaign_id
            == campaign_id,
            models.Message.status
            == models.MessageStatusEnum.failed,
        )
        .all()
    )

    if not failed_messages:
        raise HTTPException(
            status_code=404,
            detail="No failed messages found.",
        )

    return {
        "campaign_id": campaign_id,
        "failed_messages": len(
            failed_messages
        ),
        "message": (
            "Failed messages are available "
            "for provider-specific retry."
        ),
    }

