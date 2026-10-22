import Link from "next/link";
import { CONTACT_EMAIL, POLICY_UPDATED } from "@/lib/legal";

export const metadata = { title: "Terms of Service | InsightBridge" };

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#fafaf8] text-[#1a1a1a]">
            <article className="max-w-2xl mx-auto px-6 py-16 space-y-6 leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:pt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
                <Link href="/" className="text-sm text-[#4a7c59] hover:underline">&larr; Back to InsightBridge</Link>
                <h1 className="text-3xl font-semibold">Terms of Service</h1>
                <p className="text-sm text-[#777]">Last updated {POLICY_UPDATED}</p>

                <h2>For reflection and entertainment only</h2>
                <p>InsightBridge produces AI-generated readings and reflections. They are not professional, career, financial, legal, medical or mental-health advice, and they do not predict outcomes. Do not rely on them for decisions. The behavioral-patterns feature is not therapy. If you are in crisis or may harm yourself, contact local emergency services or a crisis line.</p>

                <h2>Your account and use</h2>
                <ul>
                    <li>You must be at least 16 years old.</li>
                    <li>Provide accurate information and keep your sign-in details private.</li>
                    <li>Do not misuse the service: no automated scraping, attempts to break or overload it, or accessing other people&apos;s readings.</li>
                </ul>

                <h2>Your content</h2>
                <p>You keep ownership of what you submit. You allow us to process it to provide the service, including sending it to AI providers as described in the <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>

                <h2>No warranty and limit of liability</h2>
                <p>The service is provided &ldquo;as is&rdquo; without warranties, and readings may be inaccurate. To the extent the law allows, InsightBridge is not liable for indirect or consequential losses arising from your use of the service.</p>

                <h2>Changes and contact</h2>
                <p>We may update these terms and will revise the date above. Questions: <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
            </article>
        </main>
    );
}
