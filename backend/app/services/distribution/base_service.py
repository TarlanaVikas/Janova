import uuid
from datetime import datetime

from ... import models


class BaseDistributionService:
    """
    Base class for all communication channels.

    Every channel (Email, SMS, WhatsApp, Push, Web)
    inherits this class.
    """

    provider_name = "Demo"

    async def send(
        self,
        campaign,
        recipient,
        content,
        channel,
    ):
        """
        Simulates sending a message.

        Returns a Message model ready to save.
        """

        recipient_address = self.get_recipient_address(recipient)

        message = models.Message(
            campaign_id=campaign.id,
            recipient_id=recipient.id,
            channel=channel,
            language=recipient.language,
            content=content,

            status=models.MessageStatusEnum.delivered,

            recipient_address=recipient_address,

            provider=self.provider_name,

            provider_message_id=str(uuid.uuid4()),

            sent_at=datetime.utcnow(),

            delivered_at=datetime.utcnow(),

            error_message="",

            retry_count=0,
        )

        return message

    def get_recipient_address(self, recipient):
        """
        Override in child classes.
        """
        return ""