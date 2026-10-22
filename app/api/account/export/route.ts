/**
 * API Route: Export Account Data
 * GET /api/account/export
 * Returns everything stored about the signed-in user as a JSON download.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// PostgREST caps a single response (default 1000 rows), so read in pages
const PAGE = 1000;
async function fetchAll(
    page: (from: number, to: number) => PromiseLike<{ data: any[] | null; error: any }>
) {
    const rows: any[] = [];
    for (let from = 0; ; from += PAGE) {
        const { data, error } = await page(from, from + PAGE - 1);
        if (error) return { data: null, error };
        rows.push(...(data ?? []));
        if (!data || data.length < PAGE) return { data: rows, error: null };
    }
}

export async function GET(request: NextRequest) {
    try {
        // The user comes from the session only, never from the request
        const { data: { user } } = await (await createClient()).auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Sign in required" }, { status: 401 });
        }

        const limited = rateLimit(request, "account-export", 5, 10 * 60_000, user.id);
        if (limited) return limited;

        const db = createAdminClient();
        const [readings, stealthReadings, feedback, votes, events] = await Promise.all([
            // journal answers come embedded in their reading
            fetchAll((from, to) => db.from("readings").select("*, journal_responses(*)").eq("user_id", user.id).range(from, to)),
            fetchAll((from, to) => db.from("stealth_readings").select("*").eq("user_id", user.id).range(from, to)),
            fetchAll((from, to) => db.from("reading_feedback").select("*").eq("user_id", user.id).range(from, to)),
            fetchAll((from, to) => db.from("app_name_votes").select("selected_name, reading_id, created_at").eq("user_id", user.id).range(from, to)),
            fetchAll((from, to) => db.from("analytics_events").select("event_type, metadata, created_at").eq("user_id", user.id).range(from, to)),
        ]);

        const failed = [readings, stealthReadings, feedback, votes, events].find((r) => r.error);
        if (failed) {
            console.error("[Account] Export query failed:", failed.error);
            return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
        }

        const body = {
            exportedAt: new Date().toISOString(),
            account: { id: user.id, email: user.email, createdAt: user.created_at },
            readings: readings.data,
            stealthReadings: stealthReadings.data,
            feedback: feedback.data,
            appNameVotes: votes.data,
            activityEvents: events.data,
        };

        return new NextResponse(JSON.stringify(body, null, 2), {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": 'attachment; filename="insightbridge-data.json"',
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("[Account] Export error:", error);
        return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
    }
}
