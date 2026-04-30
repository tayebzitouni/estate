import Link from "next/link";
import { Bath, BedDouble, MapPin, Ruler, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDzd } from "@/lib/utils";

type ListingCardProps = {
  listing: {
    id: string;
    slug: string;
    title: string;
    wilaya: string;
    commune: string;
    neighborhood: string;
    priceDzd: number;
    areaM2: number;
    bedrooms: number;
    bathrooms: number;
    transactionType: string;
    propertyType: string;
    media?: Array<{ url: string; alt?: string | null }>;
    image?: string;
    verificationStatus?: string;
  };
  locale: string;
};

export function PropertyCard({ listing, locale }: ListingCardProps) {
  const image = listing.media?.[0]?.url || listing.image;

  return (
    <Link href={`/${locale}/listing/${listing.slug}`}>
      <Card className="overflow-hidden transition-transform duration-300 hover:-translate-y-1">
        <div className="relative h-56 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={listing.title} className="h-full w-full object-cover" />
          <div className="absolute inset-x-4 top-4 flex items-center justify-between">
            <Badge variant="accent">{listing.transactionType === "RENT" ? "Rent" : "Sale"}</Badge>
            {listing.verificationStatus === "APPROVED" && (
              <Badge className="gap-1 bg-white/90 text-brand-navy">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-emerald" />
                Verified
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1">
            <div className="text-xl font-semibold text-brand-navy">
              {formatDzd(listing.priceDzd, locale === "fr" ? "fr-DZ" : "ar-DZ")}
            </div>
            <h3 className="line-clamp-1 text-base font-semibold text-slate-900">{listing.title}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4" />
              <span>
                {listing.neighborhood}, {listing.commune}, {listing.wilaya}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 rounded-2xl bg-brand-gray/70 p-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-brand-emerald" />
              {listing.bedrooms}
            </div>
            <div className="flex items-center gap-2">
              <Bath className="h-4 w-4 text-brand-emerald" />
              {listing.bathrooms}
            </div>
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-brand-emerald" />
              {listing.areaM2} m²
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
