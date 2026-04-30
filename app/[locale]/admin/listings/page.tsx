import { ListingReviewActions } from "@/components/admin/listing-review-actions";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminListingsQueuePage() {
  const listings = await prisma.listing.findMany({
    where: { verificationStatus: "PENDING" },
    include: { owner: { include: { profile: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-brand-navy">Admin listing review queue</h1>
      <div className="mt-6 grid gap-4">
        {listings.map((listing) => (
          <Card key={listing.id}>
            <CardContent className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
              <div>
                <div className="text-lg font-semibold text-brand-navy">{listing.title}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {listing.commune}, {listing.wilaya} • {listing.propertyType}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  Owner: {listing.owner.profile?.fullName ?? listing.owner.email}
                </div>
              </div>
              <ListingReviewActions listingId={listing.id} />
            </CardContent>
          </Card>
        ))}
        {listings.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-slate-600 shadow-panel">No pending listings.</div>
        ) : null}
      </div>
    </div>
  );
}
