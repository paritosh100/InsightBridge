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

        const limited = rateLimit(request, "account-delete", 3, 10 * 60_000, user.id);
        if (limited) return limited;

        const parsed = DeleteSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success || !user.email ||
            parsed.data.email.trim().toLowerCase() !== user.email.toLowerCase()) {
            return NextResponse.json(
                { error: "Email does not match your account" },
                { status: 400 }
            );
        }

        const db = createAdminClient();

        // Feedback this user left on any reading (feedback on their own readings cascades below)
        const feedback = await db.from("reading_feedback").delete().eq("user_id", user.id);
        // Deleting the profile row cascades to readings, stealth_readings, journal_responses;
        // analytics_events and app_name_votes keep their rows with user_id cleared.
        const profile = await db.from("users").delete().eq("id", user.id);
        if (feedback.error || profile.error) {
            console.error("[Account] Delete data failed:", feedback.error ?? profile.error);
            return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
        }

        const { error: authError } = await db.auth.admin.deleteUser(user.id);
        if (authError) {
            // Data is already gone; the user can retry to remove the login
            console.error("[Account] Delete auth user failed:", authError);
            return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
        }

        await supabase.auth.signOut().catch(() => undefined);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Account] Delete error:", error);
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }
}
