-- Created on 09-01-2024
-- Requirement: email optional
-- to be added accounts.sql
-- All databases till 09-01-2024 updated with this

ALTER TABLE "ExtBusinessContactsAccM"
    ALTER COLUMN "email" DROP NOT NULL;
