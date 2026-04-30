import Link from "next/link";
import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function NotificationBell({ locale, count }: { locale: string; count: number }) {
  return (
    <Link
      href={`/${locale}/notifications`}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-brand-navy transition-colors hover:bg-brand-gray"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      {count > 0 ? (
        <Badge className="absolute -right-2 -top-2 min-w-6 justify-center bg-rose-100 text-rose-700">
          {count > 9 ? "9+" : count}
        </Badge>
      ) : null}
    </Link>
  );
}
