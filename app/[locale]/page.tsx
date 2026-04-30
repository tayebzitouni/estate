import Link from "next/link";
import { ArrowUpRight, Building2, CalendarRange, ShieldCheck } from "lucide-react";

import { PropertyCard } from "@/components/cards/property-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SearchFilters } from "@/components/search/search-filters";
import { getPublicListings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";

export default async function LandingPage({ params }: { params: { locale: string } }) {
  const dict = getDictionary(params.locale);
  const listings = await getPublicListings();

  return (
    <div className="pb-20">
      <section className="bg-hero-grid">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 text-white sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
          <div className="space-y-8">
            <Badge className="w-fit bg-white/10 text-white">{dict.home.badge}</Badge>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">{dict.home.title}</h1>
              <p className="max-w-2xl text-lg text-slate-200">{dict.home.subtitle}</p>
            </div>
            <SearchFilters locale={params.locale} />
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="accent" asChild>
                <Link href={`/${params.locale}/search`}>
                  {dict.home.ctaPrimary}
                  <ArrowUpRight className="ms-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`/${params.locale}/dashboard/listings/new`}>{dict.home.ctaSecondary}</Link>
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border-white/10 bg-white/8 text-white">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/10 p-5">
                <div>
                  <div className="text-sm text-slate-200">Verified rental priority</div>
                  <div className="mt-1 text-2xl font-semibold">MVP Focus</div>
                </div>
                <ShieldCheck className="h-10 w-10 text-brand-emerald" />
              </div>
              <div className="grid gap-3">
                {dict.home.stats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/10 p-5">
                    <div className="text-3xl font-semibold">{stat.value}</div>
                    <div className="mt-2 text-sm text-slate-200">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-brand-navy">Featured Algerian listings</h2>
            <p className="mt-2 text-slate-500">Verified homes, offices, and land across key wilayas.</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href={`/${params.locale}/search`}>Explore all</Link>
          </Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {listings.slice(0, 3).map((listing) => (
            <PropertyCard key={listing.id} listing={listing as never} locale={params.locale} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Trust by design",
              text: "Admin review, verification badges, and report workflows reduce fraud risk."
            },
            {
              icon: CalendarRange,
              title: "Fast viewing flow",
              text: "Tenants book appointments directly and owners manage requests from one dashboard."
            },
            {
              icon: Building2,
              title: "Built for growth",
              text: "Starts with rentals and expands cleanly into sales, management, CRM, and AI matching."
            }
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="space-y-4 p-6">
                <div className="w-fit rounded-2xl bg-brand-gray p-3">
                  <item.icon className="h-6 w-6 text-brand-emerald" />
                </div>
                <h3 className="text-xl font-semibold text-brand-navy">{item.title}</h3>
                <p className="text-slate-600">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
