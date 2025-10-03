-- Created on 09-01-2024
-- Requirement: email optional
-- to be added accounts.sql
-- All databases till 09-01-2024 updated with this

ALTER TABLE "ExtBusinessContactsAccM"
    ALTER COLUMN "email" DROP NOT NULL;

-- Created on 28-09-2025
-- to be added accounts.sql
-- All databases till 28-09-2025 updated with this
ALTER TABLE "AccM"
    ADD COLUMN IF NOT EXISTS "isHidden" boolean NOT NULL DEFAULT false;