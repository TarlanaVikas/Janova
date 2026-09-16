import asyncio
from datetime import datetime

from ...database import SessionLocal
from ... import models
from ..distribution.distribution_manager import execute_scheduled_campaign


async def campaign_scheduler():

    while True:

        db = SessionLocal()

        try:
            now = datetime.utcnow()

            scheduled_campaigns = (
                db.query(models.Campaign)
                .filter(
                    models.Campaign.status
                    == models.CampaignStatusEnum.scheduled,

                    models.Campaign.scheduled_at <= now
                )
                .all()
            )

            for campaign in scheduled_campaigns:

                print(
                    "Starting scheduled campaign:",
                    campaign.id
                )

                # Change status to sending
                campaign.status = (
                    models.CampaignStatusEnum.sending
                )

                db.commit()

                try:
                    await execute_scheduled_campaign(db, campaign)
                    print("Scheduled campaign completed:", campaign.id)
                except Exception as send_error:
                    campaign.status = models.CampaignStatusEnum.failed
                    db.commit()
                    print("Scheduled campaign failed:", campaign.id, send_error)


        except Exception as e:

            print(
                "Scheduler error:",
                e
            )

            db.rollback()

        finally:
            db.close()


        # Check every 60 seconds
        await asyncio.sleep(60)