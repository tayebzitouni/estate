import Link from "next/link";
import { CalendarRange, Flag, MapPin, ShieldCheck, Star, UserRound } from "lucide-react";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactRequestForm } from "@/components/listings/contact-request-form";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { ReviewForm } from "@/components/reviews/review-form";
import { TicketForm } from "@/components/tickets/ticket-form";
import { getListingBySlug } from "@/lib/data";
import { formatDzd } from "@/lib/utils";

export default async function ListingDetailsPage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  const listing = await getListingBySlug(params.slug);
  if (!listing) notFound();

  const contactName = listing.owner?.profile?.fullName || listing.agent?.profile?.fullName || "Darak Partner";
  const contactUser = listing.agent ?? listing.owner;
  const ownerReviews = contactUser?.reviewsReceived ?? [];
  const ownerAverage = ownerReviews.length
    ? ownerReviews.reduce((total, review) => total + review.rating, 0) / ownerReviews.length
    : 0;
  const listingAverage = listing.reviews.length
    ? listing.reviews.reduce((total, review) => total + review.rating, 0) / listing.reviews.length
    : 0;
  const images: Array<{ url: string; alt?: string | null }> = listing.media?.length
    ? listing.media
    : [{ url: "https://placehold.co/1200x800", alt: listing.title }];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="accent">{listing.transactionType}</Badge>
              <Badge>{listing.propertyType}</Badge>
              {listing.verificationStatus === "APPROVED" && (
                <Badge className="gap-1 bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin reviewed
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-semibold text-brand-navy">{listing.title}</h1>
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="h-4 w-4" />
              {listing.neighborhood}, {listing.commune}, {listing.wilaya}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {images.slice(0, 2).map((image, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${image.url}-${index}`}
                src={image.url}
                alt={image.alt || listing.title}
                className={`h-72 w-full rounded-3xl object-cover ${index === 0 ? "md:col-span-2" : ""}`}
              />
            ))}
          </div>

          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <div className="text-sm text-slate-500">Bedrooms</div>
                  <div className="mt-1 text-xl font-semibold">{listing.bedrooms}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Bathrooms</div>
                  <div className="mt-1 text-xl font-semibold">{listing.bathrooms}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Area</div>
                  <div className="mt-1 text-xl font-semibold">{listing.areaM2} m²</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Floor</div>
                  <div className="mt-1 text-xl font-semibold">{listing.floor ?? 0}</div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-brand-navy">Description</h2>
                <p className="mt-3 leading-7 text-slate-600">{listing.description}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-brand-navy">Amenities</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.amenities.map((amenity) => (
                    <Badge key={amenity.name}>{amenity.name}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-brand-navy">Apartment reviews</h2>
                  <p className="text-sm text-slate-500">
                    {listing.reviews.length ? `${listingAverage.toFixed(1)}/5 from ${listing.reviews.length} reviews` : "No apartment reviews yet."}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-5 w-5 fill-current" />
                  {listingAverage ? listingAverage.toFixed(1) : "New"}
                </div>
              </div>
              <div className="grid gap-3">
                {listing.reviews.map((review) => (
                  <div key={review.id} className="rounded-3xl bg-brand-gray p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-brand-navy">{review.title || "Review"}</div>
                      <div className="text-sm text-amber-600">{review.rating}/5</div>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>
                    <div className="mt-2 text-xs text-slate-500">
                      By {review.reviewer.profile?.fullName ?? review.reviewer.email}
                    </div>
                  </div>
                ))}
              </div>
              <ReviewForm listingId={listing.id} targetUserId={contactUser?.id} label="Review this apartment or proprietor" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-5 p-6">
              <div className="text-3xl font-semibold text-brand-navy">
                {formatDzd(listing.priceDzd, params.locale === "fr" ? "fr-DZ" : "ar-DZ")}
              </div>
              <div className="rounded-2xl bg-brand-gray p-4 text-sm text-slate-600">
                Listing completeness, admin review, and profile verification are shown before contact.
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div>Contact: {contactName}</div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-current text-amber-500" />
                  Proprietor rating: {ownerAverage ? `${ownerAverage.toFixed(1)}/5` : "No reviews yet"}
                </div>
                <div>Response time: {listing.owner?.profile?.responseTimeMins ?? 120} min</div>
              </div>
              <Button className="w-full" variant="secondary" asChild>
                <Link href={`/${params.locale}/profiles/${contactUser.id}`}>
                  <UserRound className="me-2 h-4 w-4" />
                  View proprietor profile
                </Link>
              </Button>
              <Button className="w-full" variant="accent" asChild>
                <Link href={`/${params.locale}/book-viewing/${listing.id}`}>
                  <CalendarRange className="me-2 h-4 w-4" />
                  Book a viewing
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/${params.locale}/messages?listingId=${listing.id}`}>Message owner or agent</Link>
              </Button>
              <ContactRequestForm listingId={listing.id} />
              <FavoriteButton listingId={listing.id} />
              <div className="rounded-3xl border border-rose-100 bg-rose-50 p-4">
                <div className="mb-3 flex items-center gap-2 font-semibold text-rose-700">
                  <Flag className="h-4 w-4" />
                  Complaint to admin
                </div>
                <TicketForm listingId={listing.id} targetUserId={contactUser?.id} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
