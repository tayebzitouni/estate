import { Card, CardContent } from "@/components/ui/card";

export default function SavedSearchesPage() {
  const searches = [
    { name: "Hydra rentals under 150k", frequency: "Daily", matches: 12 },
    { name: "Oran villas for sale", frequency: "Instant", matches: 6 }
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-brand-navy">Saved searches and alerts</h1>
      <div className="mt-6 grid gap-4">
        {searches.map((item) => (
          <Card key={item.name}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <div className="text-xl font-semibold text-brand-navy">{item.name}</div>
                <div className="mt-2 text-sm text-slate-500">{item.frequency} alerts enabled</div>
              </div>
              <div className="text-sm text-slate-600">{item.matches} matches</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
