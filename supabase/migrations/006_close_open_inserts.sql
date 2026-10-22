-- Migration 006: remove public INSERT (and vote SELECT) policies. All writes now go
-- through server code using the service role key. Deploy that code BEFORE running this,
-- otherwise saving readings, analytics and votes fails.

DROP POLICY IF EXISTS "Users can create own readings" ON public.readings;
DROP POLICY IF EXISTS "Users can create own stealth readings" ON public.stealth_readings;
DROP POLICY IF EXISTS "Users can create journal responses" ON public.journal_responses;
DROP POLICY IF EXISTS "Users can create analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Anyone can insert app name votes" ON public.app_name_votes;
-- The vote table exposed user_id and session_id to everyone; counts are served by the API.
DROP POLICY IF EXISTS "Anyone can view app name vote counts" ON public.app_name_votes;

-- Keep the earliest vote per user / per session, then enforce one vote each.
DELETE FROM public.app_name_votes v USING public.app_name_votes d
  WHERE v.user_id IS NOT NULL AND v.user_id = d.user_id
    AND (v.created_at, v.id) > (d.created_at, d.id);
DELETE FROM public.app_name_votes v USING public.app_name_votes d
  WHERE v.session_id IS NOT NULL AND v.session_id = d.session_id
    AND (v.created_at, v.id) > (d.created_at, d.id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_app_name_votes_user ON public.app_name_votes(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_app_name_votes_session ON public.app_name_votes(session_id) WHERE session_id IS NOT NULL;
