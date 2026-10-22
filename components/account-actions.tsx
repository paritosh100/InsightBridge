"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AccountActions({ email }: { email: string }) {
    const router = useRouter();
    const [confirmEmail, setConfirmEmail] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    const handleExport = async () => {
        setIsExporting(true);
        setExportError(null);
        try {
            const res = await fetch("/api/account/export");
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to export data");
            }
            const url = URL.createObjectURL(await res.blob());
            const link = document.createElement("a");
            link.href = url;
            link.download = "insightbridge-data.json";
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            setExportError(err instanceof Error ? err.message : "Failed to export data");
        } finally {
            setIsExporting(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            const res = await fetch("/api/account/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: confirmEmail }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to delete account");
            }
            router.push("/");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete account");
            setIsDeleting(false);
        }
    };

    const matches = email !== "" && confirmEmail.trim().toLowerCase() === email.toLowerCase();

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-[#e4e4e0] bg-white p-6 space-y-3">
                <h2 className="text-lg font-semibold">Download your data</h2>
                <p className="text-sm text-[#666]">
                    A JSON file with your readings, journal answers, feedback and votes.
                </p>
                {exportError && <p className="text-sm text-red-700">{exportError}</p>}
                <Button onClick={handleExport} disabled={isExporting} variant="outline" className="rounded-full">
                    {isExporting ? "Preparing..." : "Download my data"}
                </Button>
            </section>

            <section className="rounded-2xl border border-red-200 bg-white p-6 space-y-3">
                <h2 className="text-lg font-semibold text-red-700">Delete your account</h2>
                <p className="text-sm text-[#666]">
                    This immediately and permanently deletes your account, readings, journal answers, feedback, votes and activity records.
                    It cannot be undone. Type your email <strong>{email}</strong> to confirm.
                </p>
                <input
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder={email}
                    autoComplete="off"
                    className="w-full rounded-xl border border-[#ddd] px-4 py-2.5 text-sm outline-none focus:border-red-300"
                />
                {error && <p className="text-sm text-red-700">{error}</p>}
                <Button
                    onClick={handleDelete}
                    disabled={!matches || isDeleting}
                    className="rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                    {isDeleting ? "Deleting..." : "Delete my account"}
                </Button>
            </section>
        </div>
    );
}
