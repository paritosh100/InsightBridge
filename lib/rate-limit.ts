/**
 * Minimal fixed-window rate limiter for API routes.
 * ponytail: in-memory, per server instance, so on serverless the effective limit
 * is looser than stated; swap for Upstash/Vercel KV if abuse shows up.
 */

import { NextRequest, NextResponse } from "next/server";

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
    request: NextRequest,
    name: string,
    limit: number,
    windowMs: number,
    userId?: string | null
): NextResponse | null {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const key = `${name}:${userId || ip}`;
    const now = Date.now();

    if (hits.size > 10_000) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    }

    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
        hits.set(key, { count: 1, resetAt: now + windowMs });
        return null;
    }
    if (++entry.count > limit) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } }
        );
    }
    return null;
}
