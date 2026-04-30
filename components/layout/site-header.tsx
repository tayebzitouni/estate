import Link from "next/link";
import { Building2, CalendarDays, Globe, LifeBuoy, MessageCircle, ShieldCheck, UserCircle } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { NotificationBell } from "@/components/layout/notification-bell";
import { Button } from "@/components/ui/button";
import { Locale } from "@/lib/constants";
import { getCurrentSession } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export async function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const session = getCurrentSession();
  const dashboardHref = session?.role === "ADMIN" ? `/${locale}/admin` : `/${locale}/dashboard`;
  const notificationCount = session
    ? await prisma.notification.count({ where: { userId: session.userId, readAt: null } })
    : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-navy text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold">Darak</div>
            <div className="text-xs text-slate-500">Smart real estate access</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href={`/${locale}/search`} className="text-sm text-slate-700 hover:text-brand-navy">
            {dict.nav.search}
          </Link>
          {session ? (
            <>
              <Link href={`/${locale}/saved-properties`} className="text-sm text-slate-700 hover:text-brand-navy">
                {session.role === "TENANT" ? "Favorites" : "Contact requests"}
              </Link>
              <Link href={dashboardHref} className="text-sm text-slate-700 hover:text-brand-navy">
                {session.role === "ADMIN" ? "Admin Dashboard" : dict.nav.dashboard}
              </Link>
              <Link href={`/${locale}/messages`} className="flex items-center gap-2 text-sm text-slate-700 hover:text-brand-navy">
                <MessageCircle className="h-4 w-4 text-brand-emerald" />
                Messages
              </Link>
              <Link href={`/${locale}/dashboard/appointments`} className="flex items-center gap-2 text-sm text-slate-700 hover:text-brand-navy">
                <CalendarDays className="h-4 w-4 text-brand-emerald" />
                Calendar
              </Link>
              <Link href={`/${locale}/support`} className="flex items-center gap-2 text-sm text-slate-700 hover:text-brand-navy">
                <LifeBuoy className="h-4 w-4 text-brand-emerald" />
                Support
              </Link>
              {session.role === "ADMIN" ? (
                <Link href={`/${locale}/admin/listings`} className="flex items-center gap-2 text-sm text-slate-700 hover:text-brand-navy">
                  <ShieldCheck className="h-4 w-4 text-brand-emerald" />
                  Requests
                </Link>
              ) : null}
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-full bg-brand-gray px-3 py-2 text-xs text-slate-600 sm:flex">
            <Globe className="h-3.5 w-3.5" />
            AR / FR / EN
          </div>
          {session ? (
            <>
              <NotificationBell locale={locale} count={notificationCount} />
              <Button variant="outline" asChild>
                <Link href={`/${locale}/settings`}>
                  <UserCircle className="me-2 h-4 w-4" />
                  Profile
                </Link>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href={`/${locale}/login`}>{dict.nav.login}</Link>
              </Button>
              <Button asChild>
                <Link href={`/${locale}/register`}>{dict.nav.register}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
