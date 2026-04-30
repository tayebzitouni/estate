import { Card, CardContent } from "@/components/ui/card";

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-brand-navy">User onboarding</h1>
        <p className="text-slate-500">Complete profile, verification, preferred language, and notification setup.</p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {["Profile basics", "Identity verification", "Saved search preferences"].map((item, index) => (
          <Card key={item}>
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gray font-semibold text-brand-navy">
                {index + 1}
              </div>
              <h2 className="text-xl font-semibold text-brand-navy">{item}</h2>
              <p className="mt-2 text-sm text-slate-600">This step is prepared in the flow so users can be guided role by role.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
