
from typing import Dict, List
from datetime import datetime

from sqlalchemy.orm import Session

from ... import models

from .email_service import EmailService
from .sms_service import SMSService
from .whatsapp_service import WhatsAppService
from .push_service import PushService



class DistributionManager:
    """
    Central manager for multi-channel campaign distribution.

    Normal channels:
        Email / SMS / WhatsApp / Web
        -> Use campaign recipients

    Push:
        -> Uses all recipients with a valid OneSignal
           subscription ID.
        -> Public users do not need login.
        -> Public users do not need email/phone.
        -> Each unique OneSignal subscription receives
           only one notification.
    """

    def __init__(self, db: Session):
        self.db = db

        self.services = {
            models.ChannelEnum.email: EmailService,
            models.ChannelEnum.sms: SMSService,
            models.ChannelEnum.whatsapp: WhatsAppService,
            models.ChannelEnum.push: PushService,
        }

    async def send(
        self,
        campaign,
        recipients: List[models.Recipient],
        channels: List[str],
        personalized_content: Dict[str, str],
    ):
        print("===== DISTRIBUTION START =====")
        print("Campaign:", campaign.id)
        print("Channels:", channels)
        print("Campaign recipients:", len(recipients))

        created_messages = []

        # =====================================================
        # 1. LOAD CAMPAIGN CONTENT BY LANGUAGE
        # =====================================================

        contents = (
            self.db.query(models.CampaignContent)
            .filter(
                models.CampaignContent.campaign_id
                == campaign.id
            )
            .order_by(models.CampaignContent.created_at.desc())
            .all()
        )

        content_by_lang = {}
        for content in contents:
            content_by_lang.setdefault(content.language, content.content)

        default_content = (
            content_by_lang.get("English")
            or contents[0].content
            if contents
            else campaign.description or ""
        )

        print("Available campaign languages:")

        for language in content_by_lang:
            print(" -", language)

        # =====================================================
        # 2. CONVERT CHANNELS TO ENUM VALUES
        # =====================================================

        channel_enums = []

        for channel in channels:

            if isinstance(
                channel,
                models.ChannelEnum
            ):
                channel_enum = channel

            else:

                try:

                    channel_enum = models.ChannelEnum(
                        str(channel)
                        .strip()
                        .lower()
                    )

                except ValueError:

                    print(
                        "Unsupported channel:",
                        channel
                    )

                    continue

            if channel_enum not in channel_enums:

                channel_enums.append(
                    channel_enum
                )

        if not channel_enums:

            print(
                "No valid channels selected."
            )

            return []

        print(
            "Distribution started:",
            channel_enums
        )

        # =====================================================
        # 3. GET ALL PUSH SUBSCRIBERS
        # =====================================================

        push_recipients = []

        if models.ChannelEnum.push in channel_enums:

            subscribed_recipients = (
                self.db.query(
                    models.Recipient
                )
                .filter(
                    models.Recipient
                    .onesignal_subscription_id
                    .isnot(None),

                    models.Recipient
                    .onesignal_subscription_id
                    != "",
                )
                .all()
            )

            print(
                "OneSignal subscribed records:",
                len(subscribed_recipients)
            )

            # -------------------------------------------------
            # Remove duplicate OneSignal subscriptions
            # -------------------------------------------------

            seen_subscription_ids = set()

            for recipient in subscribed_recipients:
                subscription_id = recipient.onesignal_subscription_id
                if not subscription_id:
                    continue

                if subscription_id in seen_subscription_ids:
                    print("Skipping duplicate subscription:", subscription_id)
                    continue

                seen_subscription_ids.add(subscription_id)
                push_recipients.append(recipient)

            print(
                "Unique public push subscribers:",
                len(push_recipients)
            )

        # =====================================================
        # 4. PROCESS EACH CHANNEL
        # =====================================================

        for channel_enum in channel_enums:

            # -------------------------------------------------
            # PUSH
            # -------------------------------------------------

            if channel_enum == models.ChannelEnum.push:

                channel_recipients = (
                    push_recipients
                )

            # -------------------------------------------------
            # OTHER CHANNELS
            # -------------------------------------------------

            else:

                channel_recipients = recipients

            print(
                "---------------------------------------------"
            )

            print(
                "Channel:",
                channel_enum.value
            )

            print(
                "Recipients:",
                len(channel_recipients)
            )

            if not channel_recipients:

                print(
                    "No recipients available for:",
                    channel_enum.value
                )

                continue

            # =================================================
            # 5. SEND TO EACH RECIPIENT
            # =================================================

            for recipient in channel_recipients:

                # -------------------------------------------------
                # Determine recipient language
                # -------------------------------------------------

                recipient_language = (
                    recipient.language
                    or "English"
                )

                # -------------------------------------------------
                # First use personalized content.
                #
                # This is available for normal campaign
                # recipients.
                # -------------------------------------------------

                content = personalized_content.get(
                    recipient.id
                )

                # -------------------------------------------------
                # Public push users may not exist in the
                # original campaign recipient list.
                #
                # Therefore use CampaignContent matching
                # their language.
                # -------------------------------------------------

                if not content:

                    content = content_by_lang.get(
                        recipient_language
                    )

                # -------------------------------------------------
                # Try case-insensitive language matching.
                #
                # Example:
                # "telugu" vs "Telugu"
                # -------------------------------------------------

                if not content and content_by_lang:

                    recipient_language_lower = (
                        recipient_language
                        .strip()
                        .lower()
                    )

                    for (
                        language,
                        language_content
                    ) in content_by_lang.items():

                        if (
                            language
                            and
                            language.strip().lower()
                            == recipient_language_lower
                        ):

                            content = (
                                language_content
                            )

                            break

                # -------------------------------------------------
                # Final fallback
                # -------------------------------------------------

                if not content:

                    content = (
                        default_content
                        or campaign.description
                        or ""
                    )

                print(
                    "Recipient:",
                    recipient.name
                )

                print(
                    "Language:",
                    recipient_language
                )

                print(
                    "Content preview:",
                    content[:120]
                )

                # =================================================
                # 6. GET CHANNEL SERVICE
                # =================================================

                service_factory = self.services.get(
                    channel_enum
                )

                print(
                    "Channel enum:",
                    channel_enum
                )

                print(
                    "Selected service:",
                    service_factory
                )

                if service_factory is None:

                    print(
                        "No service found for:",
                        channel_enum
                    )

                    continue

                # =================================================
                # 7. DESTINATION LOGGING
                # =================================================

                if (
                    channel_enum
                    == models.ChannelEnum.push
                ):

                    destination = (
                        recipient
                        .onesignal_subscription_id
                        or "NO_SUBSCRIPTION"
                    )

                else:

                    destination = (
                        recipient.email
                        or recipient.phone
                        or recipient.name
                        or "UNKNOWN"
                    )

                print(
                    "Sending",
                    channel_enum.value,
                    "to",
                    destination
                )

                # =================================================
                # 8. SEND THROUGH SERVICE
                # =================================================

                try:

                    service = service_factory()

                    # -------------------------------------------------
                    # SMS
                    # -------------------------------------------------

                    if (
                        channel_enum
                        == models.ChannelEnum.sms
                    ):

                        message = await service.send(
                            campaign=campaign,
                            recipient=recipient,
                            content=content,
                        )

                    # -------------------------------------------------
                    # ALL OTHER CHANNELS
                    # -------------------------------------------------

                    else:

                        message = await service.send(
                            campaign=campaign,
                            recipient=recipient,
                            content=content,
                            channel=channel_enum,
                        )

                    # =================================================
                    # 9. PROVIDER RESPONSE
                    # =================================================

                    print(
                        "Status:",
                        message.status
                    )

                    print(
                        "Provider:",
                        message.provider
                    )

                    print(
                        "Provider message ID:",
                        message.provider_message_id
                    )

                    print(
                        "Error:",
                        message.error_message
                    )

                    # =================================================
                    # 10. SAVE MESSAGE
                    # =================================================

                    self.db.add(
                        message
                    )

                    created_messages.append(
                        message
                    )

                # =====================================================
                # 11. HANDLE FAILED CHANNEL
                # =====================================================

                except Exception as exc:

                    print(
                        "Channel failed:",
                        channel_enum.value,
                        str(exc)
                    )

                    failed_message = (
                        self._create_failed_message(
                            campaign=campaign,
                            recipient=recipient,
                            content=content,
                            channel=channel_enum,
                            error=str(exc),
                        )
                    )

                    self.db.add(
                        failed_message
                    )

                    created_messages.append(
                        failed_message
                    )

        # =====================================================
        # 12. COMMIT
        # =====================================================

        self.db.commit()

        # =====================================================
        # 13. REFRESH MESSAGES
        # =====================================================

        for message in created_messages:

            self.db.refresh(
                message
            )

        print(
            "---------------------------------------------"
        )

        print(
            "Total messages:",
            len(created_messages)
        )

        print(
            "===== DISTRIBUTION END ====="
        )

        return created_messages

    # =========================================================
    # CREATE FAILED MESSAGE
    # =========================================================

    @staticmethod
    def _create_failed_message(
        campaign,
        recipient,
        content: str,
        channel: models.ChannelEnum,
        error: str,
    ):
        """
        Create a failed Message record when
        a provider/channel service fails.
        """

        return models.Message(

            campaign_id=campaign.id,

            recipient_id=recipient.id,

            channel=channel,

            language=(
                recipient.language
                or "English"
            ),

            content=content,

            status=(
                models.MessageStatusEnum.failed
            ),

            recipient_address=(
                DistributionManager
                ._get_recipient_address(
                    recipient,
                    channel
                )
            ),

            provider=(
                DistributionManager
                ._get_provider_name(
                    channel
                )
            ),

            provider_message_id="",

            error_message=error,

            retry_count=0,

            sent_at=None,

            delivered_at=None,
        )

    # =========================================================
    # RECIPIENT ADDRESS
    # =========================================================

    @staticmethod
    def _get_recipient_address(
        recipient,
        channel: models.ChannelEnum,
    ) -> str:

        # -----------------------------------------------------
        # EMAIL
        # -----------------------------------------------------

        if channel == models.ChannelEnum.email:

            return (
                recipient.email or ""
            ).strip()

        # -----------------------------------------------------
        # SMS / WHATSAPP
        # -----------------------------------------------------

        if channel in (
            models.ChannelEnum.sms,
            models.ChannelEnum.whatsapp,
        ):

            return (
                recipient.phone or ""
            ).strip()

        # -----------------------------------------------------
        # PUSH
        # -----------------------------------------------------
        #
        # Store actual OneSignal subscription ID.
        # -----------------------------------------------------

        if channel == models.ChannelEnum.push:

            return (
                recipient
                .onesignal_subscription_id
                or ""
            ).strip()

       
        return ""

    # =========================================================
    # PROVIDER NAME
    # =========================================================

    @staticmethod
    def _get_provider_name(
        channel: models.ChannelEnum,
    ) -> str:

        providers = {

            models.ChannelEnum.email:
                "smtp",

            models.ChannelEnum.sms:
                "sms_provider",

            models.ChannelEnum.whatsapp:
                "whatsapp_business",

            models.ChannelEnum.push:
                "OneSignal",

    
        }

        return providers.get(
            channel,
            "unknown"
        )



async def execute_scheduled_campaign(db: Session, campaign):
    """Execute a scheduled campaign using its saved audience, content and channels."""
    import json
    from ... import ai_service

    try:
        filt = json.loads(campaign.segment_filter or "{}")
    except (TypeError, json.JSONDecodeError):
        filt = {}

    query = db.query(models.Recipient)
    for field in ["language", "state", "city", "occupation", "organization"]:
        value = filt.get(field)
        if value:
            query = query.filter(getattr(models.Recipient, field) == value)
    if filt.get("min_engagement_score") is not None:
        query = query.filter(models.Recipient.engagement_score >= float(filt["min_engagement_score"]))
    if filt.get("max_engagement_score") is not None:
        query = query.filter(models.Recipient.engagement_score <= float(filt["max_engagement_score"]))
    recipients = query.all()

    if campaign.recipient_ids:
        try:
            selected_ids = json.loads(campaign.recipient_ids)
            selected = db.query(models.Recipient).filter(models.Recipient.id.in_(selected_ids))
            for field in ["language", "state", "city", "occupation", "organization"]:
                value = filt.get(field)
                if value:
                    selected = selected.filter(getattr(models.Recipient, field) == value)
            recipients = selected.all()
        except (TypeError, json.JSONDecodeError):
            pass

    channels = []
    try:
        channels = json.loads(campaign.channels or "[]")
    except (TypeError, json.JSONDecodeError):
        channels = [c.strip() for c in (campaign.channels or "").split(",") if c.strip()]

    if not channels:
        raise ValueError("Scheduled campaign has no distribution channels")

    contents = db.query(models.CampaignContent).filter(
        models.CampaignContent.campaign_id == campaign.id
    ).all()
    if any(c.compliance_ok is False for c in contents):
        raise ValueError("Scheduled campaign failed the compliance gate")
    content_by_lang = {c.language: c.content for c in contents}
    default_content = contents[0].content if contents else campaign.description or ""

    personalized = {}
    for recipient in recipients:
        content = content_by_lang.get(recipient.language, default_content)
        personalized[recipient.id] = await ai_service.personalize_content(
            content, recipient.name, recipient.occupation, recipient.organization,
            recipient.language, recipient.state, recipient.city, recipient.engagement_score
        )

    manager = DistributionManager(db)
    messages = await manager.send(campaign, recipients, channels, personalized)
    campaign.completed_at = datetime.utcnow() if messages and all(
        m.status in (models.MessageStatusEnum.sent, models.MessageStatusEnum.delivered,
                     models.MessageStatusEnum.opened, models.MessageStatusEnum.clicked)
        for m in messages
    ) else None
    campaign.status = (
        models.CampaignStatusEnum.completed if campaign.completed_at
        else models.CampaignStatusEnum.failed
    )
    db.commit()
    return messages
