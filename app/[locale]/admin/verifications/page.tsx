import { Card, CardContent } from "@/components/ui/card";

export default function AdminVerificationsPage() {
  const queue = [
    { name: "Karim Immobilier", type: "Agent", status: "Pending business review" },
    { name: "Sabrina B.", type: "Owner", status: "Pending ID verification" }
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-brand-navy">Admin user verification queue</h1>
      <div className="mt-6 grid gap-4">
        {queue.map((item) => (
          <Card key={item.name}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <div className="text-lg font-semibold text-brand-navy">{item.name}</div>
                <div className="mt-1 text-sm text-slate-500">{item.type}</div>
              </div>
              <div className="text-sm text-slate-500">{item.status}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
