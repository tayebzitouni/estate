import { Heart } from "lucide-react";
import { redirect } from "next/navigation";

import { PropertyCard } from "@/components/cards/property-card";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SavedPropertiesPage({ params }: { params: { locale: string } }) {
  const session = getCurrentSession();
  if (!session) redirect(`/${params.locale}/login`);

  const saved = await prisma.savedListing.findMany({
    where: { userId: session.userId },
    include: {
      listing: {
        include: {
          media: true,
          amenities: true,
          property: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6 text-brand-emerald" />
        <h1 className="text-3xl font-semibold text-brand-navy">Saved properties</h1>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {saved.map((item) => (
          <PropertyCard key={item.id} listing={item.listing as never} locale={params.locale} />
        ))}
        {saved.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-slate-600 shadow-panel lg:col-span-3">No saved apartments yet.</div>
        ) : null}
      </div>
    </div>
  );
}
