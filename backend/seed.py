"""
Seed the database with demo users, audience, campaigns, messages,
and positive/negative/neutral recipient feedback.

Run with:
    python seed.py
"""

import asyncio
import random
from datetime import datetime, timedelta

from dotenv import load_dotenv

load_dotenv()

from app.database import Base, engine, SessionLocal
from app import models, auth, ai_service


Base.metadata.create_all(bind=engine)

db = SessionLocal()


# ============================================================
# SAMPLE CAMPAIGNS
# ============================================================

SAMPLE_CAMPAIGNS = [
    dict(
        name="Monsoon Health Awareness Drive",
        description=(
            "Remind citizens to boil drinking water and avoid stagnant water "
            "to prevent waterborne diseases during monsoon season"
        ),
        type=models.CampaignTypeEnum.awareness,
        tone="informative",
        channels=["email", "sms"],
    ),
    dict(
        name="Flash Flood Emergency Alert",
        description=(
            "Warn residents in flood-prone areas to move valuables to higher "
            "ground and avoid crossing flooded roads immediately"
        ),
        type=models.CampaignTypeEnum.emergency,
        tone="urgent",
        channels=["sms", "push", "whatsapp"],
    ),
    dict(
        name="Digital Literacy Workshop Enrollment",
        description=(
            "Invite citizens to enroll in free digital literacy workshops "
            "covering online banking, government portals, and cyber safety"
        ),
        type=models.CampaignTypeEnum.education,
        tone="friendly",
        channels=["email", "web"],
    ),
    dict(
        name="New Crop Insurance Scheme Announcement",
        description=(
            "Announce the launch of a new crop insurance scheme for farmers "
            "with details on registration and coverage before the deadline"
        ),
        type=models.CampaignTypeEnum.announcement,
        tone="formal",
        channels=["sms", "email"],
    ),
    dict(
        name="Vaccination Booster Drive",
        description=(
            "Encourage eligible citizens to get their vaccination booster "
            "dose at nearby government health centers this month"
        ),
        type=models.CampaignTypeEnum.awareness,
        tone="friendly",
        channels=["email", "sms", "whatsapp"],
    ),
    dict(
        name="Heatwave Safety Advisory",
        description=(
            "Advise citizens to stay hydrated, avoid outdoor activity during "
            "peak afternoon heat, and recognize signs of heatstroke"
        ),
        type=models.CampaignTypeEnum.emergency,
        tone="urgent",
        channels=["push", "sms", "web"],
    ),
]


# ============================================================
# GUARANTEED FEEDBACK DATA
# ============================================================

SAMPLE_FEEDBACK = [
    {
        "sentiment": "positive",
        "comment": "This was very helpful, thank you for the update!",
    },
    {
        "sentiment": "positive",
        "comment": "Thanks for keeping us informed regularly.",
    },
    {
        "sentiment": "positive",
        "comment": "Appreciate the reminder, very useful information.",
    },
    {
        "sentiment": "negative",
        "comment": "This alert was confusing and arrived too late.",
    },
    {
        "sentiment": "negative",
        "comment": "I am unhappy with the delay in receiving this important information.",
    },
    {
        "sentiment": "negative",
        "comment": "The message was not clear and the information was difficult to understand.",
    },
    {
        "sentiment": "neutral",
        "comment": "Good to know, but I wish this came earlier.",
    },
    {
        "sentiment": "neutral",
        "comment": "Not clear what I am supposed to do next.",
    },
    {
        "sentiment": "neutral",
        "comment": "The information is noted. More details would be useful.",
    },
]


# ============================================================
# SAMPLE RECIPIENTS
# ============================================================

SAMPLE_RECIPIENTS = [
    dict(
        name="Aarav Sharma",
        email="aarav@example.gov.in",
        phone="+919810000001",
        language="Hindi",
        state="Uttar Pradesh",
        city="Lucknow",
        occupation="Teacher",
        organization="Dept. of Education",
        org_hierarchy="District Office",
    ),
    dict(
        name="Priya Iyer",
        email="priya@example.gov.in",
        phone="+919810000002",
        language="Tamil",
        state="Tamil Nadu",
        city="Chennai",
        occupation="Nurse",
        organization="Dept. of Health",
        org_hierarchy="City Hospital",
    ),
    dict(
        name="Rohit Das",
        email="rohit@example.gov.in",
        phone="+919810000003",
        language="Bengali",
        state="West Bengal",
        city="Kolkata",
        occupation="Farmer",
        organization="Dept. of Agriculture",
        org_hierarchy="Block Office",
    ),
    dict(
        name="Sunita Reddy",
        email="sunita@example.gov.in",
        phone="+919810000004",
        language="Telugu",
        state="Telangana",
        city="Hyderabad",
        occupation="Engineer",
        organization="Dept. of Urban Development",
        org_hierarchy="Municipal Corp",
    ),
    dict(
        name="Vikram Patel",
        email="vikram@example.gov.in",
        phone="+919810000005",
        language="Gujarati",
        state="Gujarat",
        city="Ahmedabad",
        occupation="Shopkeeper",
        organization="Dept. of Commerce",
        org_hierarchy="Zonal Office",
    ),
    dict(
        name="Ananya Nair",
        email="ananya@example.gov.in",
        phone="+919810000006",
        language="Malayalam",
        state="Kerala",
        city="Kochi",
        occupation="Student",
        organization="Dept. of Higher Education",
        org_hierarchy="University",
    ),
    dict(
        name="Karan Singh",
        email="karan@example.gov.in",
        phone="+919810000007",
        language="Punjabi",
        state="Punjab",
        city="Amritsar",
        occupation="Police Officer",
        organization="Dept. of Public Safety",
        org_hierarchy="District HQ",
    ),
    dict(
        name="Meera Joshi",
        email="meera@example.gov.in",
        phone="+919810000008",
        language="Marathi",
        state="Maharashtra",
        city="Pune",
        occupation="Doctor",
        organization="Dept. of Health",
        org_hierarchy="Civil Hospital",
    ),
    dict(
        name="Arjun Gowda",
        email="arjun@example.gov.in",
        phone="+919810000009",
        language="Kannada",
        state="Karnataka",
        city="Bengaluru",
        occupation="IT Professional",
        organization="Dept. of Electronics & IT",
        org_hierarchy="State HQ",
    ),
    dict(
        name="Ritu Verma",
        email="ritu@example.gov.in",
        phone="+919810000010",
        language="English",
        state="Delhi",
        city="New Delhi",
        occupation="Administrator",
        organization="Cabinet Secretariat",
        org_hierarchy="Central Office",
    ),
]


# ============================================================
# SEED CAMPAIGNS
# ============================================================

async def seed_campaigns():

    manager = (
        db.query(models.User)
        .filter(models.User.username == "manager")
        .first()
    )

    recipients = db.query(models.Recipient).all()

    if not recipients:
        print("No recipients found. Campaigns cannot be seeded.")
        return

    feedback_index = 0

    for camp_def in SAMPLE_CAMPAIGNS:

        existing = (
            db.query(models.Campaign)
            .filter(models.Campaign.name == camp_def["name"])
            .first()
        )

        # ----------------------------------------------------
        # CREATE CAMPAIGN IF IT DOES NOT EXIST
        # ----------------------------------------------------

        if not existing:

            campaign = models.Campaign(
                name=camp_def["name"],
                description=camp_def["description"],
                type=camp_def["type"],
                created_by=manager.id if manager else None,
                segment_filter="{}",
                channels=",".join(camp_def["channels"]),
                status=models.CampaignStatusEnum.completed,
            )

            db.add(campaign)
            db.commit()
            db.refresh(campaign)

            # ------------------------------------------------
            # GENERATE ENGLISH CONTENT
            # ------------------------------------------------

            english = await ai_service.generate_content(
                camp_def["description"],
                camp_def["tone"],
                camp_def["type"].value,
            )

            compliance = ai_service.check_compliance(english)

            db.add(
                models.CampaignContent(
                    campaign_id=campaign.id,
                    language="English",
                    tone=camp_def["tone"],
                    content=english,
                    generated_by_ai=True,
                    compliance_ok=compliance["compliance_ok"],
                    compliance_notes=compliance["compliance_notes"],
                )
            )

            db.commit()

            # ------------------------------------------------
            # CREATE TRANSLATIONS
            # ------------------------------------------------

            available_languages = list(
                ai_service.INDIAN_LANGUAGE_SAMPLES.keys()
            )

            target_langs = random.sample(
                available_languages,
                min(2, len(available_languages)),
            )

            translations = await ai_service.translate_content(
                english,
                camp_def["tone"],
                target_langs,
            )

            content_by_lang = {
                "English": english,
            }

            for lang, text in translations.items():

                compliance = ai_service.check_compliance(text)

                db.add(
                    models.CampaignContent(
                        campaign_id=campaign.id,
                        language=lang,
                        tone=camp_def["tone"],
                        content=text,
                        generated_by_ai=True,
                        compliance_ok=compliance["compliance_ok"],
                        compliance_notes=compliance["compliance_notes"],
                    )
                )

                content_by_lang[lang] = text

            db.commit()

            # ------------------------------------------------
            # CREATE MESSAGES
            # ------------------------------------------------

            send_to = recipients

            created_messages = []

            for recipient in send_to:

                lang_content = content_by_lang.get(
                    recipient.language,
                    english,
                )

                personalized = await ai_service.personalize_content(
                    lang_content,
                    recipient.name,
                    recipient.occupation,
                    recipient.organization,
                    recipient.language,
                    recipient.state,
                    recipient.city,
                    recipient.engagement_score or 0.0,
                )

                for channel in camp_def["channels"]:

                    message_status = random.choices(
                        [
                            models.MessageStatusEnum.delivered,
                            models.MessageStatusEnum.opened,
                            models.MessageStatusEnum.clicked,
                            models.MessageStatusEnum.sent,
                            models.MessageStatusEnum.failed,
                        ],
                        weights=[
                            0.35,
                            0.25,
                            0.15,
                            0.15,
                            0.10,
                        ],
                    )[0]

                    sent_time = (
                        datetime.utcnow()
                        - timedelta(
                            days=random.randint(0, 6),
                            hours=random.randint(0, 23),
                        )
                    )

                    msg = models.Message(
                        campaign_id=campaign.id,
                        recipient_id=recipient.id,
                        channel=models.ChannelEnum(channel),
                        language=recipient.language,
                        content=personalized,
                        status=message_status,
                        sent_at=sent_time,
                        opened_at=(
                            sent_time + timedelta(minutes=20)
                            if message_status.value in ("opened", "clicked")
                            else None
                        ),
                        clicked_at=(
                            sent_time + timedelta(minutes=40)
                            if message_status.value == "clicked"
                            else None
                        ),
                    )

                    db.add(msg)
                    created_messages.append(msg)

            db.commit()

            for msg in created_messages:
                db.refresh(msg)

            print(
                f"Seeded campaign '{campaign.name}' "
                f"with {len(created_messages)} messages."
            )

        else:

            campaign = existing

            print(
                f"Campaign already exists: {campaign.name}"
            )


        # ====================================================
        # ENSURE FEEDBACK EXISTS
        # ====================================================

        existing_feedback = (
            db.query(models.EngagementEvent)
            .join(
                models.Message,
                models.EngagementEvent.message_id == models.Message.id,
            )
            .filter(
                models.Message.campaign_id == campaign.id,
                models.EngagementEvent.event_type == "feedback",
            )
            .count()
        )

        # Add feedback only if this campaign currently has
        # no feedback records.
        if existing_feedback == 0:

            campaign_messages = (
                db.query(models.Message)
                .filter(
                    models.Message.campaign_id == campaign.id
                )
                .all()
            )

            if campaign_messages:

                # Add up to 3 feedback records per campaign.
                # This distributes all 9 feedback entries across
                # the 6 campaigns.
                feedback_to_add = min(
                    3,
                    len(campaign_messages),
                    len(SAMPLE_FEEDBACK) - feedback_index,
                )

                selected_messages = random.sample(
                    campaign_messages,
                    feedback_to_add,
                )

                for index, msg in enumerate(selected_messages):

                    feedback = SAMPLE_FEEDBACK[
                        feedback_index + index
                    ]

                    db.add(
                        models.EngagementEvent(
                            message_id=msg.id,
                            event_type="feedback",
                            sentiment=feedback["sentiment"],
                            comment=feedback["comment"],
                        )
                    )

                feedback_index += feedback_to_add

                db.commit()

                print(
                    f"Added {feedback_to_add} feedback record(s) "
                    f"to '{campaign.name}'."
                )


# ============================================================
# MAIN SEED FUNCTION
# ============================================================

def run():

    # --------------------------------------------------------
    # ADMIN
    # --------------------------------------------------------

    if not db.query(models.User).filter(
        models.User.username == "admin"
    ).first():

        admin = models.User(
            username="admin",
            email="admin@platform.gov.in",
            hashed_password=auth.hash_password("admin123"),
            role=models.RoleEnum.admin,
            organization="Platform Administration",
        )

        db.add(admin)

        print(
            "Created admin user -> "
            "username: admin / password: admin123"
        )


    # --------------------------------------------------------
    # CAMPAIGN MANAGER
    # --------------------------------------------------------

    if not db.query(models.User).filter(
        models.User.username == "manager"
    ).first():

        manager = models.User(
            username="manager",
            email="manager@platform.gov.in",
            hashed_password=auth.hash_password("manager123"),
            role=models.RoleEnum.campaign_manager,
            organization="Dept. of Public Communication",
        )

        db.add(manager)

        print(
            "Created campaign manager -> "
            "username: manager / password: manager123"
        )


    # --------------------------------------------------------
    # RECIPIENTS
    # --------------------------------------------------------

    if db.query(models.Recipient).count() == 0:

        for recipient in SAMPLE_RECIPIENTS:
            db.add(
                models.Recipient(
                    **recipient
                )
            )

        print(
            f"Seeded {len(SAMPLE_RECIPIENTS)} sample recipients"
        )


    # --------------------------------------------------------
# TEMPLATES
# --------------------------------------------------------

templates = [

    # 1. Existing - Awareness
    models.Template(
        name="Public Health Awareness",
        category=models.CampaignTypeEnum.awareness,
        content=(
            "Stay informed about seasonal health precautions "
            "and vaccination drives in your area."
        ),
        language="English",
    ),

    # 2. Existing - Emergency
    models.Template(
        name="Emergency Weather Alert",
        category=models.CampaignTypeEnum.emergency,
        content=(
            "A severe weather warning has been issued for "
            "your region. Please take necessary precautions."
        ),
        language="English",
    ),

    # 3. Existing - Education
    models.Template(
        name="Workshop / Training Invitation",
        category=models.CampaignTypeEnum.education,
        content=(
            "You are invited to a free training session. "
            "Registration details and schedule are provided below."
        ),
        language="English",
    ),

    # 4. Existing - Announcement
    models.Template(
        name="Policy / Scheme Announcement",
        category=models.CampaignTypeEnum.announcement,
        content=(
            "A new government scheme has been launched. "
            "Please review the eligibility criteria and "
            "application process."
        ),
        language="English",
    ),

    # 5. New - Education
    models.Template(
        name="Digital Skills Learning Program",
        category=models.CampaignTypeEnum.education,
        content=(
            "Enroll in our digital skills learning program to improve "
            "your knowledge of online services, digital tools, and "
            "safe internet practices."
        ),
        language="English",
    ),

    # 6. New - Awareness
    models.Template(
        name="Clean Community Awareness Drive",
        category=models.CampaignTypeEnum.awareness,
        content=(
            "Join the community cleanliness drive and help keep your "
            "neighborhood clean. Dispose of waste responsibly and "
            "support a healthier environment for everyone."
        ),
        language="English",
    ),
]

# Add only templates that do not already exist
# This prevents duplicate templates when teammates run seed.py
for template_data in templates:

    existing_template = (
        db.query(models.Template)
        .filter(
            models.Template.name == template_data.name
        )
        .first()
    )

    if not existing_template:
        db.add(template_data)

        print(
            f"Added template: {template_data.name}"
        )

db.commit()


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    try:

        run()

        asyncio.run(
            seed_campaigns()
        )

        print(
            "Seeding complete."
        )

    finally:

        db.close()