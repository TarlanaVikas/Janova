import os
from datetime import datetime

import httpx
from dotenv import load_dotenv

from ... import models

load_dotenv()


class WhatsAppService:
    """
    WhatsApp Business Cloud API delivery service.

    Supports multilingual WhatsApp templates.
    The same template name is used, while the language
    code is selected according to the recipient language.
    """

    def __init__(self):
        self.access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
        self.phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")

        self.template_name = os.getenv(
            "WHATSAPP_TEMPLATE_NAME",
            "janova_campaign",
        )

        self.default_language = os.getenv(
            "WHATSAPP_TEMPLATE_LANGUAGE",
            "en_US",
        )

        if not self.access_token:
            raise ValueError(
                "WHATSAPP_ACCESS_TOKEN is not configured"
            )

        if not self.phone_number_id:
            raise ValueError(
                "WHATSAPP_PHONE_NUMBER_ID is not configured"
            )

        self.api_url = (
            f"https://graph.facebook.com/v23.0/"
            f"{self.phone_number_id}/messages"
        )

        # Recipient language -> WhatsApp template language code
        self.language_map = {
            "english": "en_US",
            "en": "en_US",
            "en-us": "en_US",

            "hindi": "hi",
            "hi": "hi",

            "telugu": "te",
            "te": "te",

            "tamil": "ta",
            "ta": "ta",

            "kannada": "kn",
            "kn": "kn",

            "malayalam": "ml",
            "ml": "ml",

            "bengali": "bn",
            "bn": "bn",

            "marathi": "mr",
            "mr": "mr",

            "gujarati": "gu",
            "gu": "gu",

            "punjabi": "pa",
            "pa": "pa",

            "urdu": "ur",
            "ur": "ur",

            "odia": "or",
            "oriya": "or",
            "or": "or",
        }

    def get_template_language(self, recipient_language):
        """
        Convert recipient language to the WhatsApp
        template language code.

        Falls back to the configured default language
        if the recipient language is missing or unsupported.
        """

        if not recipient_language:
            return self.default_language

        language = str(recipient_language).strip().lower()

        return self.language_map.get(
            language,
            self.default_language,
        )

    async def send(
        self,
        campaign,
        recipient,
        content,
        channel,
    ):
        recipient_address = (
            recipient.phone or ""
        ).strip()

        # Validate phone number
        if not recipient_address:
            return models.Message(
                campaign_id=campaign.id,
                recipient_id=recipient.id,
                channel=models.ChannelEnum.whatsapp,
                language=recipient.language,
                content=content,
                status=models.MessageStatusEnum.failed,
                recipient_address="",
                provider="whatsapp_cloud_api",
                provider_message_id="",
                error_message=(
                    "Recipient does not have a valid "
                    "WhatsApp phone number"
                ),
                retry_count=0,
                sent_at=None,
                delivered_at=None,
            )

        # Remove common phone number formatting
        recipient_address = (
            recipient_address
            .replace("+", "")
            .replace(" ", "")
            .replace("-", "")
            .replace("(", "")
            .replace(")", "")
        )

        # Select template language based on recipient language
        template_language = self.get_template_language(
            recipient.language
        )

        short_content = (content or "").strip()

        if len(short_content) > 500:
             short_content = short_content[:497] + "..."

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }

        # Your approved template:
        #
        # Hello {{1}},
        #
        # {{2}}
        #
        # Stay informed with Janova.
        #
        # {{1}} = recipient name
        # {{2}} = short message
        
        payload = {
            "messaging_product": "whatsapp",
            "to": recipient_address,
            "type": "template",
            "template": {
                "name": self.template_name,
                "language": {
                    "code": template_language
                },
                "components": [
                    {
                        "type": "body",
                        "parameters": [
                            {
                                "type": "text",
                                "text": recipient.name or "there",
                            },
                                       {"type": "text",
                                        "text": short_content,
                            },
                        ],
                    }
                ],
            },
        }

        try:
            async with httpx.AsyncClient(
                timeout=30.0
            ) as client:

                response = await client.post(
                    self.api_url,
                    headers=headers,
                    json=payload,
                )

            try:
                response_data = response.json()
            except Exception:
                response_data = {}

            # WhatsApp API returned an error
            if response.status_code >= 400:
                error_message = (
                    response_data
                    .get("error", {})
                    .get(
                        "message",
                        "WhatsApp API error",
                    )
                )

                return models.Message(
                    campaign_id=campaign.id,
                    recipient_id=recipient.id,
                    channel=models.ChannelEnum.whatsapp,
                    language=recipient.language,
                    content=content,
                    status=models.MessageStatusEnum.failed,
                    recipient_address=recipient_address,
                    provider="whatsapp_cloud_api",
                    provider_message_id="",
                    error_message=error_message,
                    retry_count=0,
                    sent_at=datetime.utcnow(),
                    delivered_at=None,
                )

            # Get WhatsApp provider message ID
            messages = response_data.get(
                "messages",
                []
            )

            provider_message_id = ""

            if messages:
                provider_message_id = messages[0].get(
                    "id",
                    ""
                )

            return models.Message(
                campaign_id=campaign.id,
                recipient_id=recipient.id,
                channel=models.ChannelEnum.whatsapp,
                language=recipient.language,
                content=content,
                status=models.MessageStatusEnum.sent,
                recipient_address=recipient_address,
                provider="whatsapp_cloud_api",
                provider_message_id=provider_message_id,
                error_message="",
                retry_count=0,
                sent_at=datetime.utcnow(),
                delivered_at=None,
            )

        except Exception as exc:
            return models.Message(
                campaign_id=campaign.id,
                recipient_id=recipient.id,
                channel=models.ChannelEnum.whatsapp,
                language=recipient.language,
                content=content,
                status=models.MessageStatusEnum.failed,
                recipient_address=recipient_address,
                provider="whatsapp_cloud_api",
                provider_message_id="",
                error_message=str(exc),
                retry_count=0,
                sent_at=datetime.utcnow(),
                delivered_at=None,
            )