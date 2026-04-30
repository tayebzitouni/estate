import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage({ params }: { params: { locale: string } }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Create your Darak account</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm locale={params.locale} />
        </CardContent>
      </Card>
    </div>
  );
}
