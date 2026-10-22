/**
 * Supabase Client - Service Role (server only)
 * Bypasses RLS. Use only in server code that looks rows up by an unguessable
 * reading_id; never import from client components or return raw rows to clients.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        key,
        { auth: { persistSession: false, autoRefreshToken: false } }
    )
}
