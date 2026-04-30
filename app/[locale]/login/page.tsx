import Link from "next/link";
import { Building2, LockKeyhole, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSeededAccounts } from "@/lib/data";

export default function LoginPage({ params }: { params: { locale: string } }) {
  const seededAccounts = getSeededAccounts();

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-semibold text-brand-navy">Access Darak</h1>
          <p className="text-slate-600">
            Darak protects every account with a signed HTTP-only cookie session. Clients can discover approved
            listings, owners manage requests, and admins moderate the marketplace.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-slate-600">
          <div className="flex gap-3 rounded-2xl bg-white p-4 shadow-panel">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-brand-emerald" />
            <span>Only approved listings become visible to clients.</span>
          </div>
          <div className="flex gap-3 rounded-2xl bg-white p-4 shadow-panel">
            <LockKeyhole className="mt-0.5 h-5 w-5 text-brand-emerald" />
            <span>Use one of the seeded role accounts from your private setup notes, then change credentials later.</span>
          </div>
        </div>
        <div className="text-sm text-slate-500">
          Need a client account?{" "}
          <Link className="font-medium text-brand-navy underline" href={`/${params.locale}/register`}>
            Create one here
          </Link>
          .
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 text-sm text-slate-600">
          Seeded roles available: {seededAccounts.map((account) => account.label).join(", ")}.
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm locale={params.locale} />
        </CardContent>
      </Card>
    </div>
  );
}
