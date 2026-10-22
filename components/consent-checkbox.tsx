"use client";

import Link from "next/link";

interface ConsentCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    // What the user is agreeing to share, e.g. "my birth details"
    subject?: string;
}

export function ConsentCheckbox({ checked, onChange, subject = "my information" }: ConsentCheckboxProps) {
    return (
        <label className="flex items-start gap-3 text-sm text-[#555] leading-relaxed cursor-pointer">
            <input
                type="checkbox"
                required
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[#3d6b4a]"
            />
            <span>
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="underline hover:text-[#1a1a1a]">Terms</Link> and{" "}
                <Link href="/privacy" target="_blank" className="underline hover:text-[#1a1a1a]">Privacy Policy</Link>, and
                consent to InsightBridge processing {subject}, including sending it to AI service providers to generate my reading.
            </span>
        </label>
    );
}
