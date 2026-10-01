from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth, ai_service
from ..database import get_db

router = APIRouter(prefix="/ai", tags=["AI Content & Multilingual Engine"])


@router.post("/generate-content", response_model=schemas.CampaignContentOut)
async def generate_content(
    payload: schemas.GenerateContentRequest,
    db: Session = Depends(get_db),
    _user: models.User = Depends(auth.require_roles(["admin", "campaign_manager", "comms_team"])),
):
    campaign = db.query(models.Campaign).filter(models.Campaign.id == payload.campaign_id).first()
    if not campaign:
        raise HTTPException(404, "Campaign not found")

    print("Selected Tone:", payload.tone)
    generated = await ai_service.generate_content(payload.brief, payload.tone, campaign.type.value)
    compliance = ai_service.check_compliance(generated)
    sentiment = await ai_service.analyze_sentiment(generated)

    content = models.CampaignContent(
        campaign_id=campaign.id,
        language="English",
        tone=payload.tone,
        content=generated,
        generated_by_ai=True,
        sentiment_score=sentiment.get("score", 0.0),
        compliance_ok=compliance["compliance_ok"],
        compliance_notes=compliance["compliance_notes"],
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@router.post("/translate", response_model=List[schemas.CampaignContentOut])
async def translate(
    payload: schemas.TranslateRequest,
    db: Session = Depends(get_db),
    _user: models.User = Depends(auth.require_roles(["admin", "campaign_manager", "comms_team"])),
):
    campaign = db.query(models.Campaign).filter(models.Campaign.id == payload.campaign_id).first()
    if not campaign:
        raise HTTPException(404, "Campaign not found")

    translations = await ai_service.translate_content(
        payload.source_content, payload.tone, payload.target_languages
    )

    results = []
    for lang, text in translations.items():
        compliance = ai_service.check_compliance(text)
        sentiment = await ai_service.analyze_sentiment(text)
        row = models.CampaignContent(
            campaign_id=campaign.id,
            language=lang,
            tone=payload.tone,
            content=text,
            generated_by_ai=True,
            sentiment_score=sentiment.get("score", 0.0),
            compliance_ok=compliance["compliance_ok"],
            compliance_notes=compliance["compliance_notes"],
        )
        db.add(row)
        results.append(row)
    db.commit()
    for r in results:
        db.refresh(r)
    return results


@router.post("/personalize")
async def personalize(
    payload: schemas.PersonalizeRequest,
    db: Session = Depends(get_db),
    _user: models.User = Depends(auth.require_roles(["admin", "campaign_manager", "comms_team"])),
):
    recipient = db.query(models.Recipient).filter(models.Recipient.id == payload.recipient_id).first()
    if not recipient:
        raise HTTPException(404, "Recipient not found")
    personalized = await ai_service.personalize_content(
    payload.content,
    recipient.name,
    recipient.occupation,
    recipient.organization,
    recipient.language,
    recipient.state,
    recipient.city,
    recipient.engagement_score,
)
    return {"recipient_id": recipient.id, "personalized_content": personalized}


@router.post("/sentiment", response_model=schemas.SentimentResponse)
async def sentiment(
    payload: schemas.SentimentRequest,
    _user: models.User = Depends(auth.get_current_user),
):
    return await ai_service.analyze_sentiment(payload.text)


@router.post("/review", response_model=schemas.ContentReviewResponse)
async def review_content(
    payload: schemas.ContentReviewRequest,
    _user: models.User = Depends(auth.require_roles(["admin", "campaign_manager", "comms_team"])),
):
    """Run the pre-deployment AI quality gate without storing a draft."""
    if not payload.text.strip():
        raise HTTPException(400, "Content cannot be empty")
    compliance = ai_service.check_compliance(payload.text)
    sentiment = await ai_service.analyze_sentiment(payload.text)
    return {
        **compliance,
        "sentiment_score": sentiment.get("score", 0.0),
        "sentiment_label": sentiment.get("label", "neutral"),
        "suggested_tone": sentiment.get("suggested_tone", payload.tone.title()),
        "improved_message": sentiment.get("improved_message", payload.text),
    }

@router.get("/content/{campaign_id}", response_model=List[schemas.CampaignContentOut])
def get_campaign_content(
    campaign_id: str, db: Session = Depends(get_db), _user: models.User = Depends(auth.get_current_user)
):
    return (
        db.query(models.CampaignContent)
        .filter(models.CampaignContent.campaign_id == campaign_id)
        .order_by(models.CampaignContent.created_at.desc())
        .all()
    )
