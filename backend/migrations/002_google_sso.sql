-- Add Google's unique account ID.
-- Existing accounts keep their current login method.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS google_sub VARCHAR(255);

-- Prevent the same Google account from being linked to multiple users.
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_sub
    ON users (google_sub);
