from datetime import datetime
import os
import requests

from ... import models


class PushService:

    async def send(
        self,
        campaign,
        recipient,
        content,
        channel=None
    ):

        # Check OneSignal subscription ID
        if not recipient.onesignal_subscription_id:
            raise Exception(
                "OneSignal subscription ID not available"
            )

        app_id = os.getenv("ONESIGNAL_APP_ID")
        rest_api_key = os.getenv("ONESIGNAL_REST_API_KEY")

        if not app_id:
            raise Exception(
                "ONESIGNAL_APP_ID is not configured"
            )

        if not rest_api_key:
            raise Exception(
                "ONESIGNAL_REST_API_KEY is not configured"
            )

        url = "https://api.onesignal.com/notifications"

        headers = {
            "Authorization": f"Key {rest_api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "app_id": app_id,

            "include_subscription_ids": [
                recipient.onesignal_subscription_id
            ],

            "headings": {
                "en": "Janova"
            },

            "contents": {
                "en": content
            }
        }

        print("Sending OneSignal push...")
        print("Subscription ID:", recipient.onesignal_subscription_id)

        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=15
        )

        try:
            result = response.json()
        except Exception:
            result = {
                "raw_response": response.text
            }

        print("ONESIGNAL STATUS:", response.status_code)
        print("ONESIGNAL RESPONSE:", result)

        if response.status_code not in (200, 201):
            raise Exception(
                f"OneSignal push failed: {result}"
            )

        return models.Message(
            campaign_id=campaign.id,
            recipient_id=recipient.id,
            channel=models.ChannelEnum.push,
            language=recipient.language or "English",
            content=content,
            status=models.MessageStatusEnum.sent,
            recipient_address=recipient.onesignal_subscription_id,
            provider="OneSignal",
            provider_message_id=str(result.get("id", "")),
            sent_at=datetime.utcnow(),
            retry_count=0
        )