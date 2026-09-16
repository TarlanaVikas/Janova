from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    tags=["Audience Management"]
)

# ==========================================================
# Recipients (Audience)
# ==========================================================

@router.post("/recipients", response_model=schemas.RecipientOut)
def add_recipient(
    payload: schemas.RecipientCreate,
    db: Session = Depends(get_db),
    _user: models.User = Depends(auth.get_current_user),
):
    recipient = models.Recipient(**payload.model_dump())
    db.add(recipient)
    db.commit()
    db.refresh(recipient)
    return recipient


@router.get("/recipients", response_model=List[schemas.RecipientOut])
def list_recipients(
    language: Optional[str] = None,
    state: Optional[str] = None,
    city: Optional[str] = None,
    occupation: Optional[str] = None,
    organization: Optional[str] = None,
    db: Session = Depends(get_db),
    _user: models.User = Depends(auth.get_current_user),
):
    query = db.query(models.Recipient)

    if language:
        query = query.filter(models.Recipient.language == language)

    if state:
        query = query.filter(models.Recipient.state == state)

    if city:
        query = query.filter(models.Recipient.city == city)

    if occupation:
        query = query.filter(models.Recipient.occupation == occupation)

    if organization:
        query = query.filter(models.Recipient.organization == organization)

    return query.all()

@router.post("/recipients/save-subscription")
def save_subscription(
    payload: schemas.SubscriptionUpdate,
    db: Session = Depends(get_db),
):
    """
    Save a public user's OneSignal subscription
    together with their selected notification language.
    """

    subscription_id = payload.subscription_id.strip()
    language = payload.language.strip() or "English"

    if not subscription_id:
        raise HTTPException(
            status_code=400,
            detail="OneSignal subscription ID is required",
        )

    # --------------------------------------------------
    # Check whether this browser subscription already
    # exists
    # --------------------------------------------------

    recipient = (
        db.query(models.Recipient)
        .filter(
            models.Recipient.onesignal_subscription_id
            == subscription_id
        )
        .first()
    )

    # --------------------------------------------------
    # Existing public user
    # --------------------------------------------------

    if recipient:

        recipient.language = language

        db.commit()
        db.refresh(recipient)

        return {
            "success": True,
            "message": "Subscription updated successfully",
            "recipient_id": recipient.id,
            "language": recipient.language,
        }

    # --------------------------------------------------
    # New public user
    # --------------------------------------------------

    recipient = models.Recipient(
        name="Public User",
        email="",
        phone="",
        language=language,
        onesignal_subscription_id=subscription_id,
    )

    db.add(recipient)
    db.commit()
    db.refresh(recipient)

    return {
        "success": True,
        "message": "Subscription saved successfully",
        "recipient_id": recipient.id,
        "language": recipient.language,
    }

@router.delete("/recipients/{recipient_id}")
def delete_recipient(
    recipient_id: str,
    db: Session = Depends(get_db),
    _user: models.User = Depends(
        auth.require_roles(["admin", "campaign_manager"])
    ),
):
    recipient = (
        db.query(models.Recipient)
        .filter(models.Recipient.id == recipient_id)
        .first()
    )

    if not recipient:
        raise HTTPException(
            status_code=404,
            detail="Recipient not found"
        )

    db.delete(recipient)
    db.commit()

    return {
        "deleted": True
    }


@router.get("/recipients/segments/options")
def segment_options(
    db: Session = Depends(get_db),
    _user: models.User = Depends(auth.get_current_user),
):
    def distinct(column):
        return sorted(
            {
                value[0]
                for value in db.query(column).distinct().all()
                if value[0]
            }
        )

    return {
        "languages": distinct(models.Recipient.language),
        "states": distinct(models.Recipient.state),
        "cities": distinct(models.Recipient.city),
        "occupations": distinct(models.Recipient.occupation),
        "organizations": distinct(models.Recipient.organization),
    }


@router.get("/recipients/search", response_model=List[schemas.RecipientOut])
def search_recipients(
    search: Optional[str] = None,
    language: Optional[str] = None,
    state: Optional[str] = None,
    city: Optional[str] = None,
    occupation: Optional[str] = None,
    organization: Optional[str] = None,
    db: Session = Depends(get_db),
    _user: models.User = Depends(auth.get_current_user),
):
    query = db.query(models.Recipient)

    if search:
        search = f"%{search}%"

        query = query.filter(
            (models.Recipient.name.ilike(search))
            | (models.Recipient.email.ilike(search))
            | (models.Recipient.phone.ilike(search))
        )

    if language:
        query = query.filter(models.Recipient.language == language)

    if state:
        query = query.filter(models.Recipient.state == state)

    if city:
        query = query.filter(models.Recipient.city == city)

    if occupation:
        query = query.filter(models.Recipient.occupation == occupation)

    if organization:
        query = query.filter(models.Recipient.organization == organization)

    return query.order_by(models.Recipient.name).all()



@router.post("/recipients/segments/preview", response_model=List[schemas.RecipientOut])
def preview_segment(
    payload: schemas.SegmentFilter,
    db: Session = Depends(get_db),
    _user: models.User = Depends(
        auth.require_roles(["admin", "campaign_manager", "comms_team"])
    ),
):
    """Preview the exact audience matched by a campaign segmentation rule."""
    query = db.query(models.Recipient)
    for field in ["language", "state", "city", "occupation", "organization"]:
        value = getattr(payload, field)
        if value:
            query = query.filter(getattr(models.Recipient, field) == value)

    if payload.min_engagement_score is not None:
        query = query.filter(
            models.Recipient.engagement_score >= payload.min_engagement_score
        )
    if payload.max_engagement_score is not None:
        query = query.filter(
            models.Recipient.engagement_score <= payload.max_engagement_score
        )

    return query.order_by(models.Recipient.name).all()


# ==========================================================
# Templates
# ==========================================================

@router.post("/templates", response_model=schemas.TemplateOut)
def create_template(
    payload: schemas.TemplateCreate,
    db: Session = Depends(get_db),
    _user: models.User = Depends(
        auth.require_roles(["admin", "campaign_manager"])
    ),
):
    template = models.Template(**payload.model_dump())

    db.add(template)
    db.commit()
    db.refresh(template)

    return template


@router.get("/templates", response_model=List[schemas.TemplateOut])
def list_templates(
    db: Session = Depends(get_db),
    _user: models.User = Depends(auth.get_current_user),
):
    return db.query(models.Template).all()

@router.put("/templates/{template_id}", response_model=schemas.TemplateOut)
def update_template(
    template_id: str,
    payload: schemas.TemplateCreate,
    db: Session = Depends(get_db),
    _user: models.User = Depends(auth.require_roles(["admin", "campaign_manager"])),
):
    template = db.query(models.Template).filter(models.Template.id == template_id).first()
    if not template:
        raise HTTPException(404, "Template not found")
    for key, value in payload.model_dump().items():
        setattr(template, key, value)
    db.commit()
    db.refresh(template)
    return template


@router.delete("/templates/{template_id}")
def delete_template(
    template_id: str,
    db: Session = Depends(get_db),
    _user: models.User = Depends(auth.require_roles(["admin", "campaign_manager"])),
):
    template = db.query(models.Template).filter(models.Template.id == template_id).first()
    if not template:
        raise HTTPException(404, "Template not found")
    db.delete(template)
    db.commit()
    return {"deleted": True, "template_id": template_id}
