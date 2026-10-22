"use client";

/**
 * Temporary Result - renders a signed-out reading kept only in sessionStorage.
 * Nothing is stored server-side; closing the tab loses it.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ResultClient } from "@/components/result-client";
import { StealthResultClient } from "@/components/stealth-result-client";
import { TEMP_READING_ID, TEMP_READING_KEY } from "@/lib/types";

export function TempResult() {
    const [state, setState] = useState<"loading" | "missing" | any>("loading");

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(TEMP_READING_KEY);
            setState(raw ? JSON.parse(raw) : "missing");
        } catch {
            setState("missing");
        }
    }, []);

    if (state === "loading") return null;

    if (state === "missing") {
        return (
            <div className="min-h-screen w-full bg-[#fafaf8] text-[#1a2f2a] flex items-center justify-center px-6">
                <div className="max-w-md text-center space-y-4">
                    <h1 className="text-2xl font-semibold">This reading is no longer available</h1>
                    <p className="text-[#1a2f2a]/70">
                        Readings created without an account are not saved and disappear when you close the tab.
                    </p>
                    <Link href="/" className="inline-block rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d6b4a]">
                        Generate a new reading
                    </Link>
                </div>
            </div>
        );
    }

    return state.mode === "stealth" ? (
        <StealthResultClient reading={state.reading} inputs={{ ...state.inputs, mode: "stealth" }} readingId={TEMP_READING_ID} />
    ) : (
        <ResultClient reading={state.reading} inputs={state.inputs} readingId={TEMP_READING_ID} />
    );
}
