import os
import uuid
import smtplib
from datetime import datetime
from email.message import EmailMessage

from dotenv import load_dotenv

from ... import models


# Load environment variables from backend/.env
load_dotenv()


class EmailService:
    """
    Real SMTP-based email delivery service.

    Sends emails using an SMTP server such as Gmail SMTP.

    Required .env variables:

        SMTP_HOST=smtp.gmail.com
        SMTP_PORT=587
        SMTP_USERNAME=your_email@gmail.com
        SMTP_PASSWORD=your_app_password
        EMAIL_FROM=your_email@gmail.com

    For Gmail:
    - Enable 2-Step Verification.
    - Create a Google App Password.
    - Use the App Password as SMTP_PASSWORD.
    """

    # =========================================================
    # SEND NEW EMAIL
    # =========================================================

    async def send(
        self,
        campaign,
        recipient,
        content,
        channel,
    ):
        
        """
        Send a new email through SMTP.

        Returns a new Message database object.
        """

        recipient_address = (
            recipient.email or ""
        ).strip()

        # -----------------------------------------------------
        # 1. Validate recipient email
        # -----------------------------------------------------

        if not recipient_address:

            return self._create_failed_message(
                campaign=campaign,
                recipient=recipient,
                content=content,
                error="Recipient does not have a valid email address.",
            )

        # -----------------------------------------------------
        # 2. Read SMTP configuration
        # -----------------------------------------------------

        smtp_host = os.getenv(
            "SMTP_HOST",
            "smtp.gmail.com",
        )

        smtp_port = int(
            os.getenv(
                "SMTP_PORT",
                "587",
            )
        )

        smtp_username = os.getenv(
            "SMTP_USERNAME",
            "",
        ).strip()

        smtp_password = os.getenv(
            "SMTP_PASSWORD",
            "",
        ).strip()

        email_from = os.getenv(
            "EMAIL_FROM",
            smtp_username,
        ).strip()

        # -----------------------------------------------------
        # 3. Validate SMTP configuration
        # -----------------------------------------------------

        if not smtp_username or not smtp_password:

            return self._create_failed_message(
                campaign=campaign,
                recipient=recipient,
                content=content,
                error=(
                    "SMTP configuration is missing. "
                    "Please configure SMTP_USERNAME "
                    "and SMTP_PASSWORD in backend/.env."
                ),
            )

        if not email_from:

            return self._create_failed_message(
                campaign=campaign,
                recipient=recipient,
                content=content,
                error=(
                    "EMAIL_FROM is missing. "
                    "Please configure EMAIL_FROM in backend/.env."
                ),
            )

        # -----------------------------------------------------
        # 4. Generate provider message ID
        # -----------------------------------------------------

        provider_message_id = (
            f"smtp-{uuid.uuid4()}"
        )

        sent_at = datetime.utcnow()

        try:

            # -------------------------------------------------
            # 5. Create email
            # -------------------------------------------------

            email_message = EmailMessage()

            email_message["Subject"] = (
                campaign.name
            )

            email_message["From"] = (
                email_from
            )

            email_message["To"] = (
                recipient_address
            )

            email_message.set_content(
                content or ""
            )

            # -------------------------------------------------
            # 6. Connect to SMTP
            # -------------------------------------------------

            with smtplib.SMTP(
                smtp_host,
                smtp_port,
                timeout=30,
            ) as smtp:

                # Enable TLS
                smtp.starttls()

                # Authenticate
                smtp.login(
                    smtp_username,
                    smtp_password,
                )

                # Send email
                smtp.send_message(
                    email_message
                )

            # -------------------------------------------------
            # 7. SMTP accepted email
            # -------------------------------------------------

            print(
                "Email successfully sent to:",
                recipient_address,
            )

            print(
                "Subject:",
                campaign.name,
            )

            print(
                "From:",
                email_from,
            )

            return models.Message(
                campaign_id=campaign.id,
                recipient_id=recipient.id,
                channel=models.ChannelEnum.email,
                language=(
                    recipient.language
                    or "English"
                ),
                content=content or "",
                status=(
                    models.MessageStatusEnum.sent
                ),
                recipient_address=(
                    recipient_address
                ),
                provider="smtp",
                provider_message_id=(
                    provider_message_id
                ),
                error_message="",
                retry_count=0,
                sent_at=sent_at,

                # SMTP acceptance is not the same
                # as confirmed final delivery.
                delivered_at=None,
            )

        except Exception as e:

            print(
                "Email sending failed for:",
                recipient_address,
            )

            print(
                "SMTP error:",
                str(e),
            )

            return models.Message(
                campaign_id=campaign.id,
                recipient_id=recipient.id,
                channel=models.ChannelEnum.email,
                language=(
                    recipient.language
                    or "English"
                ),
                content=content or "",
                status=(
                    models.MessageStatusEnum.failed
                ),
                recipient_address=(
                    recipient_address
                ),
                provider="smtp",
                provider_message_id=(
                    provider_message_id
                ),
                error_message=str(e),
                retry_count=0,
                sent_at=sent_at,
                delivered_at=None,
            )

    # =========================================================
    # RESEND FAILED EMAIL
    # =========================================================

    async def resend(
        self,
        message,
        campaign,
        recipient,
    ):
        """
        Retry sending an existing failed email.

        This method updates the existing Message object
        instead of creating a duplicate database record.
        """

        recipient_address = (
            recipient.email or ""
        ).strip()

        # -----------------------------------------------------
        # 1. Validate recipient
        # -----------------------------------------------------

        if not recipient_address:

            message.status = (
                models.MessageStatusEnum.failed
            )

            message.error_message = (
                "Retry failed: recipient does not "
                "have a valid email address."
            )

            message.retry_count = (
                (message.retry_count or 0) + 1
            )

            return message

        # -----------------------------------------------------
        # 2. Read SMTP configuration
        # -----------------------------------------------------

        smtp_host = os.getenv(
            "SMTP_HOST",
            "smtp.gmail.com",
        )

        smtp_port = int(
            os.getenv(
                "SMTP_PORT",
                "587",
            )
        )

        smtp_username = os.getenv(
            "SMTP_USERNAME",
            "",
        ).strip()

        smtp_password = os.getenv(
            "SMTP_PASSWORD",
            "",
        ).strip()

        email_from = os.getenv(
            "EMAIL_FROM",
            smtp_username,
        ).strip()

        # -----------------------------------------------------
        # 3. Increase retry count
        # -----------------------------------------------------

        message.retry_count = (
            (message.retry_count or 0) + 1
        )

        try:

            # -------------------------------------------------
            # 4. Create email again
            # -------------------------------------------------

            email_message = EmailMessage()

            email_message["Subject"] = (
                campaign.name
            )

            email_message["From"] = (
                email_from
            )

            email_message["To"] = (
                recipient_address
            )

            email_message.set_content(
                message.content or ""
            )

            # -------------------------------------------------
            # 5. Connect to SMTP
            # -------------------------------------------------

            with smtplib.SMTP(
                smtp_host,
                smtp_port,
                timeout=30,
            ) as smtp:

                smtp.starttls()

                smtp.login(
                    smtp_username,
                    smtp_password,
                )

                smtp.send_message(
                    email_message
                )

            # -------------------------------------------------
            # 6. Retry successful
            # -------------------------------------------------

            message.status = (
                models.MessageStatusEnum.sent
            )

            message.recipient_address = (
                recipient_address
            )

            message.provider = "smtp"

            message.provider_message_id = (
                f"smtp-retry-{uuid.uuid4()}"
            )

            message.error_message = ""

            message.sent_at = (
                datetime.utcnow()
            )

            message.delivered_at = None

            print(
                "Email retry successfully sent to:",
                recipient_address,
            )

            print(
                "Retry count:",
                message.retry_count,
            )

        except Exception as e:

            # -------------------------------------------------
            # 7. Retry failed
            # -------------------------------------------------

            message.status = (
                models.MessageStatusEnum.failed
            )

            message.error_message = str(e)

            print(
                "Email retry failed for:",
                recipient_address,
            )

            print(
                "SMTP retry error:",
                str(e),
            )

        return message

    # =========================================================
    # CREATE FAILED MESSAGE
    # =========================================================

    @staticmethod
    def _create_failed_message(
        campaign,
        recipient,
        content,
        error,
    ):
        """
        Create a failed Message object.
        """

        return models.Message(
            campaign_id=campaign.id,
            recipient_id=recipient.id,
            channel=models.ChannelEnum.email,
            language=(
                recipient.language
                or "English"
            ),
            content=content or "",
            status=(
                models.MessageStatusEnum.failed
            ),
            recipient_address=(
                recipient.email or ""
            ).strip(),
            provider="smtp",
            provider_message_id="",
            error_message=error,
            retry_count=0,
            sent_at=datetime.utcnow(),
            delivered_at=None,
        )