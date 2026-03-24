-- =============================================================================
-- BOCRA Website — Migration 013: Fix Profile Role Escalation Vulnerability
-- =============================================================================
--
-- SECURITY FIX: The existing "Users can update own profile" policy allows any
-- authenticated user to change their own role to 'admin' by issuing:
--   UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
--
-- Fix: Replace direct UPDATE access with a SECURITY DEFINER function that only
-- allows updating safe columns (full_name, phone, organization). The role and
-- sector columns can only be changed by admin users.
-- =============================================================================

-- Step 1: Drop the vulnerable UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Step 2: Create a SECURITY DEFINER function for safe self-service profile updates
-- This function only accepts safe columns and ignores any attempt to change role/sector.
CREATE OR REPLACE FUNCTION update_own_profile(
  p_full_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_organization TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET
    full_name    = COALESCE(p_full_name, full_name),
    phone        = COALESCE(p_phone, phone),
    organization = COALESCE(p_organization, organization),
    updated_at   = now()
  WHERE id = auth.uid();
END;
$$;

-- Step 3: Create a restricted UPDATE policy for admins only
-- Regular users must use the update_own_profile() function instead.
-- Admins can update any profile (including role/sector assignments).
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Step 4: Grant execute on the function to authenticated users
GRANT EXECUTE ON FUNCTION update_own_profile(TEXT, TEXT, TEXT) TO authenticated;
