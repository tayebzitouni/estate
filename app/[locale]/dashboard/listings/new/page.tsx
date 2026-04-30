import { ListingWizard } from "@/components/forms/listing-wizard";

export default function NewListingPage({ params }: { params: { locale: string } }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-brand-navy">Add property listing</h1>
        <p className="text-slate-500">Create, save as draft, and submit a listing for Darak verification.</p>
      </div>
      <div className="mt-8">
        <ListingWizard locale={params.locale} />
      </div>
    </div>
  );
}
