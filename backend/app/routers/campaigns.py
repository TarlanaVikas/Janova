import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db


router = APIRouter(
    prefix="/campaigns",
    tags=["Campaigns"]
)


def parse_campaign_json(campaign):
    """
    Convert JSON string fields from database into Python objects
    """
    try:
        campaign.segment_filter = json.loads(
            campaign.segment_filter or "{}"
        )
    except Exception:
        campaign.segment_filter = {}

    try:
        campaign.recipient_ids = json.loads(
            campaign.recipient_ids or "[]"
        )
    except Exception:
        campaign.recipient_ids = []

    try:
        campaign.channels = json.loads(
            campaign.channels or "[]"
        )
    except Exception:
        campaign.channels = []

    return campaign


# ==========================================================
# Public Campaign APIs
# ==========================================================

@router.get(
    "/public",
    response_model=List[schemas.CampaignOut]
)
def get_public_campaigns(
    db: Session = Depends(get_db)
):

    campaigns = (
        db.query(models.Campaign)
        .filter(
            models.Campaign.status != models.CampaignStatusEnum.draft
        )
        .order_by(
            models.Campaign.created_at.desc()
        )
        .all()
    )

    return [
        parse_campaign_json(campaign)
        for campaign in campaigns
    ]


@router.get(
    "/public/{campaign_id}",
    response_model=schemas.CampaignOut
)
def get_public_campaign(
    campaign_id: str,
    db: Session = Depends(get_db)
):

    campaign = (
        db.query(models.Campaign)
        .filter(
            models.Campaign.id == campaign_id,
            models.Campaign.status != models.CampaignStatusEnum.draft
        )
        .first()
    )

    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found"
        )

    return parse_campaign_json(campaign)


# ==========================================================
# Protected Campaign APIs
# ==========================================================


@router.post(
    "/",
    response_model=schemas.CampaignOut
)
def create_campaign(
    payload: schemas.CampaignCreate,
    db: Session = Depends(get_db),
    _user: models.User = Depends(
        auth.require_roles(["admin", "campaign_manager"])
    ),
):

    campaign_data = payload.model_dump()

    campaign_data["segment_filter"] = json.dumps(
        campaign_data.get("segment_filter", {})
    )

    campaign_data["recipient_ids"] = json.dumps(
        campaign_data.get("recipient_ids", [])
    )

    campaign_data["channels"] = json.dumps(
        campaign_data.get("channels", [])
    )


    campaign = models.Campaign(
        **campaign_data
    )

    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    return parse_campaign_json(campaign)



@router.get(
    "/",
    response_model=List[schemas.CampaignOut]
)
def list_campaigns(
    db: Session = Depends(get_db),
    _user: models.User = Depends(
        auth.get_current_user
    )
):

    campaigns = (
        db.query(models.Campaign)
        .order_by(
            models.Campaign.created_at.desc()
        )
        .all()
    )

    return [
        parse_campaign_json(campaign)
        for campaign in campaigns
    ]



@router.get(
    "/{campaign_id}",
    response_model=schemas.CampaignOut
)
def get_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    _user: models.User = Depends(
        auth.get_current_user
    )
):

    campaign = (
        db.query(models.Campaign)
        .filter(
            models.Campaign.id == campaign_id
        )
        .first()
    )

    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found"
        )

    return parse_campaign_json(campaign)



@router.put(
    "/{campaign_id}",
    response_model=schemas.CampaignOut
)
def update_campaign(
    campaign_id: str,
    payload: schemas.CampaignCreate,
    db: Session = Depends(get_db),
    _user: models.User = Depends(
        auth.require_roles(["admin", "campaign_manager"])
    ),
):

    campaign = (
        db.query(models.Campaign)
        .filter(
            models.Campaign.id == campaign_id
        )
        .first()
    )

    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found"
        )


    campaign_data = payload.model_dump()

    campaign_data["segment_filter"] = json.dumps(
        campaign_data.get("segment_filter", {})
    )

    campaign_data["recipient_ids"] = json.dumps(
        campaign_data.get("recipient_ids", [])
    )

    campaign_data["channels"] = json.dumps(
        campaign_data.get("channels", [])
    )


    for key, value in campaign_data.items():
        setattr(
            campaign,
            key,
            value
        )


    db.commit()
    db.refresh(campaign)

    return parse_campaign_json(campaign)



@router.post(
    "/{campaign_id}/publish"
)
def publish_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    _user: models.User = Depends(
        auth.require_roles(["admin", "campaign_manager"])
    ),
):

    campaign = (
        db.query(models.Campaign)
        .filter(
            models.Campaign.id == campaign_id
        )
        .first()
    )


    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found"
        )


    campaign.status = (
        models.CampaignStatusEnum.published
    )


    db.commit()
    db.refresh(campaign)


    return {
        "message": "Campaign published successfully",
        "campaign_id": campaign_id
    }



@router.delete(
    "/{campaign_id}"
)
def delete_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    _user: models.User = Depends(
        auth.require_roles(["admin"])
    ),
):

    campaign = (
        db.query(models.Campaign)
        .filter(
            models.Campaign.id == campaign_id
        )
        .first()
    )


    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found"
        )


    messages = (
        db.query(models.Message)
        .filter(
            models.Message.campaign_id == campaign_id
        )
        .all()
    )


    for message in messages:

        db.query(models.EngagementEvent).filter(
            models.EngagementEvent.message_id == message.id
        ).delete(
            synchronize_session=False
        )


    db.query(models.Message).filter(
        models.Message.campaign_id == campaign_id
    ).delete(
        synchronize_session=False
    )


    db.query(models.CampaignContent).filter(
        models.CampaignContent.campaign_id == campaign_id
    ).delete(
        synchronize_session=False
    )


    if hasattr(models, "Poster"):

        db.query(models.Poster).filter(
            models.Poster.campaign_id == campaign_id
        ).delete(
            synchronize_session=False
        )


    db.delete(campaign)
    db.commit()


    return {
        "deleted": True,
        "campaign_id": campaign_id,
        "message": "Campaign and related records deleted successfully"
    }