import Link from "next/link";
import { CONTACT_EMAIL, POLICY_UPDATED } from "@/lib/legal";

export const metadata = { title: "Privacy Policy | InsightBridge" };

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[#fafaf8] text-[#1a1a1a]">
            <article className="max-w-2xl mx-auto px-6 py-16 space-y-6 leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:pt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
                <Link href="/" className="text-sm text-[#4a7c59] hover:underline">&larr; Back to InsightBridge</Link>
                <h1 className="text-3xl font-semibold">Privacy Policy</h1>
                <p className="text-sm text-[#777]">Last updated {POLICY_UPDATED}</p>

                <h2>What we collect</h2>
                <ul>
                    <li><strong>Reading inputs:</strong> your name, birth date, birth time (optional), birth city, and optional focus area or career question.</li>
                    <li><strong>Behavioral-patterns answers:</strong> your answers about consistency, decisions, goals, your current state (for example stuck or overwhelmed) and a free-text description. These can be sensitive; they are used to generate your report and are not stored by us.</li>
                    <li><strong>Account data:</strong> your email address and sign-in details if you create an account.</li>
                    <li><strong>Usage data:</strong> page views through Vercel Analytics, a session cookie used to limit voting, and feedback you choose to submit.</li>
                </ul>

                <h2>How we use it</h2>
                <p>To generate your reading or report, show your saved readings to you, improve the product from feedback and usage, and keep the service secure. We do not sell your personal information or share it for advertising.</p>

                <h2>What is stored</h2>
                <ul>
                    <li><strong>Signed in:</strong> your readings and their inputs are saved to your account and visible only to you.</li>
                    <li><strong>Signed out:</strong> your reading is generated and shown in your browser tab only. It is not saved to our database and is lost when you close the tab.</li>
                </ul>

                <h2>Who processes your data</h2>
                <p>Reading inputs are sent to the AI providers that write your reading: OpenAI and, where enabled, Google (Gemini). We use these services to run the app:</p>
                <ul>
                    <li>Supabase: database and sign-in</li>
                    <li>Vercel: hosting and analytics</li>
                    <li>Komoot Photon: birth-city search (the text you type in the city field)</li>
                </ul>
                <p>These providers process data on our behalf and may do so outside your country.</p>

                <h2>Retention and your rights</h2>
                <p>Saved readings are kept until you ask us to delete them. Depending on where you live, you may have the right to access, correct, export or delete your data, to withdraw consent, and to complain to a regulator. To use any of these, email <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We aim to respond within 30 days.</p>

                <h2>Children</h2>
                <p>InsightBridge is not intended for children under 16. Do not use it if you are under 16.</p>

                <h2>Security and changes</h2>
                <p>We restrict access to saved readings to their owners and use encrypted connections. No system is perfectly secure. We will update this page when practices change and revise the date above.</p>

                <p className="text-sm text-[#777] pt-4">Contact: <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
            </article>
        </main>
    );
}
