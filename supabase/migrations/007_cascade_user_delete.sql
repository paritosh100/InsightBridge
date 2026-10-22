-- Migration 007: deleting an auth user (account deletion) now cascades to the profile row
-- and, through it, to readings, stealth_readings, journal_responses and their feedback.
-- Deploy the account-deletion code and run this before relying on /api/account/delete.

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE public.users
  ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
