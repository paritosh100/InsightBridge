-- Migration 005: remove public read access to readings, stealth_readings, journal_responses.
-- Deploy the app version using SUPABASE_SERVICE_ROLE_KEY BEFORE running this,
-- otherwise anonymous result pages stop loading.

DROP POLICY IF EXISTS "Users can view all readings" ON public.readings;
CREATE POLICY "Users can view own readings" ON public.readings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view all stealth readings" ON public.stealth_readings;
CREATE POLICY "Users can view own stealth readings" ON public.stealth_readings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own journal responses" ON public.journal_responses;
CREATE POLICY "Users can view own journal responses" ON public.journal_responses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.readings r
            WHERE r.id = journal_responses.reading_id AND r.user_id = auth.uid())
  );
