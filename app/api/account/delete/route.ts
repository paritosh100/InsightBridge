/**
 * API Route: Delete Account
 * POST /api/account/delete  { email }
 * Permanently deletes the signed-in user's data and login. The caller must
 * type the account's email to confirm.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const DeleteSchema = z.object({ email: z.string().max(320) });

export async function POST(request: NextRequest) {
    try {
        // The user comes from the session only, never from the request
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Sign in required" }, { status: 401 });
        }

        const parsed = DeleteSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success || !user.email ||
            parsed.data.email.trim().toLowerCase() !== user.email.toLowerCase()) {
            return NextResponse.json(
                { error: "Email does not match your account" },
                { status: 400 }
            );
        }

        // Only count attempts that pass the confirmation, so typos never lock the user out
        const limited = rateLimit(request, "account-delete", 3, 10 * 60_000, user.id);
        if (limited) return limited;

        const db = createAdminClient();

        // Rows that would otherwise survive with only user_id cleared
        const leftovers = await Promise.all([
            db.from("reading_feedback").delete().eq("user_id", user.id),
            db.from("analytics_events").delete().eq("user_id", user.id),
            db.from("app_name_votes").delete().eq("user_id", user.id),
        ]);
        const leftoverError = leftovers.find((r) => r.error)?.error;
        if (leftoverError) {
            console.error("[Account] Delete data failed:", leftoverError);
            return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
        }

        // One step for the rest: migration 007 cascades the auth user to the profile row, readings,
        // stealth_readings, journal_responses and feedback on them.
        const { error: authError } = await db.auth.admin.deleteUser(user.id);
        if (authError) {
            console.error("[Account] Delete auth user failed:", authError);
            return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
        }

        // Clear this browser's cookies; the session is already invalid server-side
        await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Account] Delete error:", error);
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }
}
