-- =============================================================================
-- BOCRA Website — Migration 014: Fix Tender Column Types
-- =============================================================================
--
-- SECURITY FIX: The tenders table uses TEXT for date and amount columns,
-- allowing invalid data (e.g. SQL injection payloads as dates, negative amounts).
--
-- This migration:
-- 1. Converts closing_date, publish_date, decision_date from TEXT to DATE
-- 2. Converts amount from TEXT to NUMERIC
-- 3. Adds CHECK constraints for reasonable ranges
--
-- Idempotent: safe to re-run if columns are already converted.
-- =============================================================================

DO $$
DECLARE
  col_type TEXT;
BEGIN
  -- Check if closing_date is still TEXT (i.e. migration hasn't run yet)
  SELECT data_type INTO col_type
    FROM information_schema.columns
   WHERE table_name = 'tenders' AND column_name = 'closing_date';

  IF col_type = 'text' THEN
    -- Step 1: Clean up invalid date values before type conversion
    UPDATE tenders SET closing_date = NULL
      WHERE closing_date IS NOT NULL
      AND closing_date !~ '^\d{4}-\d{2}-\d{2}';

    UPDATE tenders SET publish_date = NULL
      WHERE publish_date IS NOT NULL
      AND publish_date !~ '^\d{4}-\d{2}-\d{2}';

    UPDATE tenders SET decision_date = NULL
      WHERE decision_date IS NOT NULL
      AND decision_date !~ '^\d{4}-\d{2}-\d{2}';

    -- Step 2: Alter date column types
    ALTER TABLE tenders
      ALTER COLUMN closing_date TYPE DATE USING closing_date::DATE,
      ALTER COLUMN publish_date TYPE DATE USING publish_date::DATE,
      ALTER COLUMN decision_date TYPE DATE USING decision_date::DATE;

    RAISE NOTICE 'Converted date columns from TEXT to DATE';
  ELSE
    RAISE NOTICE 'Date columns already converted — skipping';
  END IF;

  -- Check if amount is still TEXT
  SELECT data_type INTO col_type
    FROM information_schema.columns
   WHERE table_name = 'tenders' AND column_name = 'amount';

  IF col_type = 'text' THEN
    -- Clean up amount — strip non-numeric chars, handle empty strings
    UPDATE tenders SET amount = NULL
      WHERE amount IS NOT NULL
      AND (amount = '' OR regexp_replace(amount, '[^0-9.]', '', 'g') = '');

    UPDATE tenders SET amount = regexp_replace(amount, '[^0-9.]', '', 'g')
      WHERE amount IS NOT NULL;

    ALTER TABLE tenders
      ALTER COLUMN amount TYPE NUMERIC USING amount::NUMERIC;

    RAISE NOTICE 'Converted amount column from TEXT to NUMERIC';
  ELSE
    RAISE NOTICE 'Amount column already converted — skipping';
  END IF;

  -- Add CHECK constraints (IF NOT EXISTS via exception handling)
  BEGIN
    ALTER TABLE tenders ADD CONSTRAINT tenders_amount_positive
      CHECK (amount IS NULL OR amount >= 0);
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- constraint already exists
  END;

  BEGIN
    ALTER TABLE tenders ADD CONSTRAINT tenders_closing_date_range
      CHECK (closing_date IS NULL OR closing_date >= '2020-01-01');
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- constraint already exists
  END;
END;
$$;
