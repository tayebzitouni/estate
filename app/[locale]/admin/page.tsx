import Link from "next/link";
import { AlertTriangle, CheckSquare, ShieldCheck, Users } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminSnapshot } from "@/lib/data";

export default async function AdminPage({ params }: { params: { locale: string } }) {
  const stats = await getAdminSnapshot();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-brand-navy">Admin dashboard</h1>
        <p className="text-slate-500">Moderate listings, review users, investigate fraud, and monitor platform trust.</p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-4">
        <StatCard icon={CheckSquare} label="Pending listings" value={stats.pendingListings} />
        <StatCard icon={Users} label="Pending verifications" value={stats.pendingVerifications} />
        <StatCard icon={AlertTriangle} label="Open reports" value={stats.openReports} />
        <StatCard icon={ShieldCheck} label="Total listings" value={stats.listingCount} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {[
          { href: "listings", title: "Listing review queue", text: "Approve, reject, or request edits before publication." },
          { href: "verifications", title: "User verification queue", text: "Validate owner and agent trust documents." },
          { href: "reports", title: "Fraud and reports", text: "Investigate suspicious listings and create moderation cases." }
        ].map((item) => (
          <Card key={item.href}>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-xl font-semibold text-brand-navy">{item.title}</h2>
              <p className="text-slate-600">{item.text}</p>
              <Button variant="outline" asChild>
                <Link href={`/${params.locale}/admin/${item.href}`}>Open queue</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
