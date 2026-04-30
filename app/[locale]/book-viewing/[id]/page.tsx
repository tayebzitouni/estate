import { BookingForm } from "@/components/appointments/booking-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BookViewingPage({ params }: { params: { locale: string; id: string } }) {
  const listing = await prisma.listing.findUnique({ where: { id: params.id } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Book a viewing{listing ? ` for ${listing.title}` : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingForm listingId={params.id} locale={params.locale} />
        </CardContent>
      </Card>
    </div>
  );
}
