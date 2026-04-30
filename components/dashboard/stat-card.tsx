import { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-2 text-3xl font-semibold text-brand-navy">{value}</div>
        </div>
        <div className="rounded-2xl bg-brand-gray p-3">
          <Icon className="h-6 w-6 text-brand-emerald" />
        </div>
      </CardContent>
    </Card>
  );
}
