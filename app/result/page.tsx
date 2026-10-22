/**
 * Result Page - Display Generated Reading
 * Server component that fetches data and passes to client component
 * Supports both normal and stealth mode readings
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { getAnyReading } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { ResultClient } from "@/components/result-client";
import { StealthResultClient } from "@/components/stealth-result-client";

// Force dynamic rendering (required for Vercel deployment)
export const dynamic = "force-dynamic";

interface ResultPageProps {
    searchParams: Promise<{ rid?: string }>;
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
    const params = await searchParams;
    const readingId = params.rid;

    // Validate reading ID
    if (!readingId) {
        notFound();
    }

    // Fetch reading from either table
    const storedReading = await getAnyReading(readingId);

    if (!storedReading) {
        notFound();
    }

    // Readings saved by a signed-in user are private to them; anonymous
    // readings stay viewable by link.
    if (storedReading.ownerId) {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id !== storedReading.ownerId) {
            const signedIn = !!user;
            return (
                <div className="min-h-screen w-full bg-[#fafaf8] text-[#1a2f2a] flex items-center justify-center px-6">
                    <div className="max-w-md text-center space-y-4">
                        <h1 className="text-2xl font-semibold">
                            {signedIn ? "This reading doesn't belong to you" : "Sign in to view this reading"}
                        </h1>
                        <p className="text-[#1a2f2a]/70">
                            {signedIn
                                ? "It was created by another account, so only its owner can open it."
                                : "This reading is private to the account that created it."}
                        </p>
                        <div className="flex justify-center gap-3 pt-2">
                            {!signedIn && (
                                <Link href={`/login?redirect=${encodeURIComponent(`/result?rid=${readingId}`)}`} className="rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d6b4a]">
                                    Sign in
                                </Link>
                            )}
                            <Link href="/" className="rounded-md border border-[#1a2f2a]/20 px-4 py-2 text-sm font-medium hover:bg-black/5">
                                Get your own reading
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#fafaf8] text-[#1a2f2a]">
            {/* Client Component - render based on mode */}
            <div className="relative z-10">

                {storedReading.mode === 'stealth' ? (
                    <StealthResultClient
                        reading={storedReading.reading}
                        inputs={storedReading.inputs}
                        readingId={readingId}
                    />
                ) : (
                    <ResultClient
                        reading={storedReading.reading}
                        inputs={storedReading.inputs}
                        readingId={readingId}
                    />
                )}
            </div>
        </div>
    );
}
