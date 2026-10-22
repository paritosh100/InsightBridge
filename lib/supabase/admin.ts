/**
 * Supabase Client - Service Role (server only)
 * Bypasses RLS. Use only in server code that looks rows up by an unguessable
 * reading_id; never import from client components or return raw rows to clients.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
    )
}
