import { PropertyCard } from "@/components/cards/property-card";
import { ListingsMap } from "@/components/maps/listings-map";
import { SearchFilters } from "@/components/search/search-filters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPublicListings } from "@/lib/data";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  params: { locale: string };
  searchParams: {
    q?: string;
    wilaya?: string;
    type?: string;
    maxPrice?: string;
    bedrooms?: string;
  };
};

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const listings = await getPublicListings();
  const filtered = listings.filter((listing) => {
    const q = searchParams.q?.toLowerCase().trim();
    const maxPrice = Number(searchParams.maxPrice);
    const bedrooms = Number(searchParams.bedrooms);
    const text = `${listing.title} ${listing.description} ${listing.wilaya} ${listing.commune} ${listing.neighborhood}`.toLowerCase();

    if (q && !text.includes(q)) return false;
    if (searchParams.wilaya && listing.wilaya !== searchParams.wilaya) return false;
    if (searchParams.type && listing.propertyType !== searchParams.type) return false;
    if (searchParams.maxPrice && listing.priceDzd > maxPrice) return false;
    if (searchParams.bedrooms && listing.bedrooms < bedrooms) return false;

    return true;
  });
  const mapped = filtered.map((item) => ({
    id: item.id,
    title: item.title,
    latitude: item.property?.latitude ?? 36.7538,
    longitude: item.property?.longitude ?? 3.0588,
    wilaya: item.wilaya,
    commune: item.commune
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-brand-navy">Search properties in Algeria</h1>
        <p className="text-slate-500">Filter by wilaya, property type, budget, bedrooms, and transaction mode.</p>
      </div>

      <div className="mt-8">
        <SearchFilters locale={params.locale} initialValues={searchParams} />
      </div>

      <Tabs defaultValue="list" className="mt-8">
        <TabsList>
          <TabsTrigger value="list">List view</TabsTrigger>
          <TabsTrigger value="map">Map view</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-6 grid gap-6 lg:grid-cols-3">
          {filtered.map((listing) => (
            <PropertyCard key={listing.id} listing={listing as never} locale={params.locale} />
          ))}
          {filtered.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-slate-600 shadow-panel lg:col-span-3">
              No approved listings match these filters yet.
            </div>
          ) : null}
        </TabsContent>
        <TabsContent value="map" className="mt-6">
          <ListingsMap listings={mapped} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
