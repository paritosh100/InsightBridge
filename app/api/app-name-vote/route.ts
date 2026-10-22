/**
 * API Route: Submit App Name Vote
 * POST /api/app-name-vote
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        const { selectedName, readingId } = await request.json();

        // Validate input
        const validNames = ['pellucid', 'intuitwithme', 'insightbridge'];
        if (!selectedName || !validNames.includes(selectedName)) {
            return NextResponse.json(
                { error: 'Invalid app name selection' },
                { status: 400 }
            );
        }

        // Get user ID if authenticated
        const { data: { user } } = await (await createClient()).auth.getUser();

        const limited = rateLimit(request, 'app-name-vote', 5, 10 * 60_000, user?.id);
        if (limited) return limited;

        // Signed-out voters are identified by a keyed hash of their IP, not a cookie they can delete.
        // Shared networks (office, school) therefore share one vote.
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
        const sessionId = createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!).update(ip).digest('hex');

        // One vote per user or per IP; unique indexes (migration 006) also enforce this under races
        const supabase = createAdminClient();
        const { error } = await supabase
            .from('app_name_votes')
            .insert({
                user_id: user?.id || null,
                session_id: user ? null : sessionId,
                selected_name: selectedName,
                reading_id: typeof readingId === 'string' ? readingId.slice(0, 64) : null,
            });

        if (error?.code === '23505') {
            return NextResponse.json(
                { error: 'You have already voted' },
                { status: 409 }
            );
        }

        if (error) {
            console.error('Error saving vote:', error);
            return NextResponse.json(
                { error: 'Failed to save vote' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in app name vote API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET endpoint to retrieve vote counts
export async function GET() {
    try {
        const supabase = createAdminClient();

        const { data: votes, error } = await supabase
            .from('app_name_votes')
            .select('selected_name');

        if (error) {
            throw error;
        }

        // Count votes for each option
        const voteCounts = votes.reduce((acc, vote) => {
            acc[vote.selected_name] = (acc[vote.selected_name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const total = votes.length;

        return NextResponse.json({
            total,
            votes: voteCounts,
            percentages: {
                pellucid: total > 0 ? ((voteCounts.pellucid || 0) / total * 100).toFixed(1) : 0,
                intuitwithme: total > 0 ? ((voteCounts.intuitwithme || 0) / total * 100).toFixed(1) : 0,
                insightbridge: total > 0 ? ((voteCounts.insightbridge || 0) / total * 100).toFixed(1) : 0,
            }
        });
    } catch (error) {
        console.error('Error fetching vote counts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch vote counts' },
            { status: 500 }
        );
    }
}
