from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, ai_service
from ..database import get_db


router = APIRouter(
    prefix="/public",
    tags=["Public Feedback"]
)


@router.post("/feedback")
async def submit_feedback(
    payload: schemas.PublicFeedbackCreate,
    db: Session = Depends(get_db),
):

    campaign = (
        db.query(models.Campaign)
        .filter(models.Campaign.id == payload.campaign_id)
        .first()
    )


    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found"
        )


    # AI Sentiment Analysis
    sentiment_result = await ai_service.analyze_sentiment(
        payload.comment
    )

    sentiment = sentiment_result["label"]


    feedback = models.EngagementEvent(
        campaign_id=payload.campaign_id,
        event_type="feedback",
        sentiment=sentiment,
        comment=payload.comment.strip()
    )


    db.add(feedback)
    db.commit()
    db.refresh(feedback)


    return {
        "success": True,
        "message": "Feedback submitted successfully",
        "sentiment": sentiment,
        "score": sentiment_result["score"],
        "feedback_id": feedback.id
    }