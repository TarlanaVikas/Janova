
import os
from datetime import datetime

from twilio.rest import Client

from ... import models


class SMSService:
    """Send campaign content through the configured Twilio SMS account."""

    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_number = os.getenv("TWILIO_PHONE_NUMBER")

        self.client = Client(
            self.account_sid,
            self.auth_token,
        )

    async def send(self, campaign, recipient, content):
        """Send one campaign message to one recipient."""

        # ---------------------------------------------------------
        # 1. Prepare recipient phone number
        # ---------------------------------------------------------

        recipient_address = (recipient.phone or "").strip()

        if recipient_address and not recipient_address.startswith("+"):
            recipient_address = "+91" + recipient_address

        # ---------------------------------------------------------
        # 2. Validate recipient
        # ---------------------------------------------------------

        if not recipient_address:
            return models.Message(
                campaign_id=campaign.id,
                recipient_id=recipient.id,
                channel=models.ChannelEnum.sms,
                language=recipient.language,
                content=content,
                status=models.MessageStatusEnum.failed,
                recipient_address="",
                provider="twilio",
                provider_message_id="",
                error_message="Recipient does not have a valid phone number",
                retry_count=0,
                sent_at=datetime.utcnow(),
                delivered_at=None,
            )

        # ---------------------------------------------------------
        # 3. Validate Twilio configuration
        # ---------------------------------------------------------

        if not self.account_sid:
            return models.Message(
                campaign_id=campaign.id,
                recipient_id=recipient.id,
                channel=models.ChannelEnum.sms,
                language=recipient.language,
                content=content,
                status=models.MessageStatusEnum.failed,
                recipient_address=recipient_address,
                provider="twilio",
                provider_message_id="",
                error_message="TWILIO_ACCOUNT_SID is missing",
                retry_count=0,
                sent_at=datetime.utcnow(),
                delivered_at=None,
            )

        if not self.auth_token:
            return models.Message(
                campaign_id=campaign.id,
                recipient_id=recipient.id,
                channel=models.ChannelEnum.sms,
                language=recipient.language,
                content=content,
                status=models.MessageStatusEnum.failed,
                recipient_address=recipient_address,
                provider="twilio",
                provider_message_id="",
                error_message="TWILIO_AUTH_TOKEN is missing",
                retry_count=0,
                sent_at=datetime.utcnow(),
                delivered_at=None,
            )

        if not self.from_number:
            return models.Message(
                campaign_id=campaign.id,
                recipient_id=recipient.id,
                channel=models.ChannelEnum.sms,
                language=recipient.language,
                content=content,
                status=models.MessageStatusEnum.failed,
                recipient_address=recipient_address,
                provider="twilio",
                provider_message_id="",
                error_message="TWILIO_PHONE_NUMBER is missing",
                retry_count=0,
                sent_at=datetime.utcnow(),
                delivered_at=None,
            )

        # ---------------------------------------------------------
        # 4. Validate content
        # ---------------------------------------------------------

        content = (content or "").strip()

        if not content:
            return models.Message(
                campaign_id=campaign.id,
                recipient_id=recipient.id,
                channel=models.ChannelEnum.sms,
                language=recipient.language,
                content="",
                status=models.MessageStatusEnum.failed,
                recipient_address=recipient_address,
                provider="twilio",
                provider_message_id="",
                error_message="SMS content is empty",
                retry_count=0,
                sent_at=datetime.utcnow(),
                delivered_at=None,
            )

        # ---------------------------------------------------------
        # 5. Send campaign content
        # ---------------------------------------------------------

        try:
            language = (recipient.language or "English").strip()

            print("\n========== TWILIO SMS ==========")
            print("To:", recipient_address)
            print("From:", self.from_number)
            print("Language:", language)
            print("Campaign Content:", content)

            print("Account SID configured:", bool(self.account_sid))
            print("Auth Token configured:", bool(self.auth_token))
            print("From number configured:", bool(self.from_number))

            sms = self.client.messages.create(
                body=content,
                from_=self.from_number,
                to=recipient_address,
            )

            print("Twilio Message SID:", sms.sid)
            print("Twilio Status:", sms.status)
            print("================================\n")

            return models.Message(
                campaign_id=campaign.id,
                recipient_id=recipient.id,
                channel=models.ChannelEnum.sms,
                language=recipient.language,
                content=content,
                status=models.MessageStatusEnum.sent,
                recipient_address=recipient_address,
                provider="twilio",
                provider_message_id=sms.sid,
                error_message="",
                retry_count=0,
                sent_at=datetime.utcnow(),
                delivered_at=None,
            )

        except Exception as e:
            print("\n========== TWILIO ERROR ==========")
            print("Error:", str(e))
            print("==================================\n")

            return models.Message(
                campaign_id=campaign.id,
                recipient_id=recipient.id,
                channel=models.ChannelEnum.sms,
                language=recipient.language,
                content=content,
                recipient_address=recipient_address,
                provider="twilio",
                provider_message_id="",
                error_message=str(e),
                retry_count=0,
                sent_at=datetime.utcnow(),
                delivered_at=None,
            )

