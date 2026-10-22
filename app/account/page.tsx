import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AccountActions } from "@/components/account-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your account | InsightBridge" };

export default async function AccountPage() {
    const { data: { user } } = await (await createClient()).auth.getUser();
    if (!user) redirect("/login?redirect=/account");

    return (
        <main className="min-h-screen bg-[#fafaf8] text-[#1a1a1a]">
            <div className="max-w-xl mx-auto px-6 py-16 space-y-8">
                <Link href="/" className="text-sm text-[#4a7c59] hover:underline">&larr; Back to InsightBridge</Link>
                <div>
                    <h1 className="text-3xl font-semibold">Your account</h1>
                    <p className="text-[#666] mt-1">{user.email}</p>
                </div>
                <AccountActions email={user.email ?? ""} />
            </div>
        </main>
    );
}
