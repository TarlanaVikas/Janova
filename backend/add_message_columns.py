import sqlite3
from pathlib import Path

# Database is expected to be in the backend folder
DB_PATH = Path(__file__).parent / "mcapp.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Get existing columns
cursor.execute("PRAGMA table_info(messages)")
existing_columns = {row[1] for row in cursor.fetchall()}

columns_to_add = {
    "recipient_address": "TEXT DEFAULT ''",
    "provider": "TEXT DEFAULT ''",
    "provider_message_id": "TEXT DEFAULT ''",
    "error_message": "TEXT DEFAULT ''",
    "retry_count": "INTEGER DEFAULT 0",
    "delivered_at": "DATETIME",
}

for column_name, column_definition in columns_to_add.items():
    if column_name not in existing_columns:
        print(f"Adding column: {column_name}")
        cursor.execute(
            f"ALTER TABLE messages ADD COLUMN {column_name} {column_definition}"
        )
    else:
        print(f"Already exists: {column_name}")

conn.commit()
conn.close()

print("\nDatabase update completed successfully.")