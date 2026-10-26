-- Run once against existing databases before deploying the email-verification code.
-- Existing accounts are treated as verified; new registrations explicitly start
-- with is_email_verified = false.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verification_code_hash VARCHAR(255) NULL;
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verification_attempts INTEGER NOT NULL DEFAULT 0;
