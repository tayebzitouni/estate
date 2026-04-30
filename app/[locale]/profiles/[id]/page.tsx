import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, Mail, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewForm } from "@/components/reviews/review-form";
import { StartMessageButton } from "@/components/messages/start-message-button";
import { TicketForm } from "@/components/tickets/ticket-form";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params
}: {
  params: { locale: string; id: string };
}) {
  const session = getCurrentSession();
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      profile: true,
      reviewsReceived: {
        where: { isPublic: true },
        include: {
          reviewer: { include: { profile: true } },
          listing: { select: { title: true, slug: true } }
        },
        orderBy: { createdAt: "desc" }
      },
      ownedListings: {
        where: { status: "PUBLISHED", verificationStatus: "APPROVED" },
        select: { id: true, title: true, slug: true, wilaya: true, commune: true, priceDzd: true },
        take: 6,
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!user) notFound();

  const average = user.reviewsReceived.length
    ? user.reviewsReceived.reduce((total, review) => total + review.rating, 0) / user.reviewsReceived.length
    : 0;
  const canReview = session && session.userId !== user.id;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-navy text-white">
              <Building2 className="h-9 w-9" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-brand-navy">{user.profile?.fullName ?? user.email}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="accent">{user.role}</Badge>
                {user.emailVerifiedAt ? <Badge>Verified email</Badge> : <Badge variant="warning">Email not verified</Badge>}
              </div>
            </div>
            <p className="leading-7 text-slate-600">{user.profile?.bio ?? "No profile bio yet."}</p>
            <div className="space-y-2 text-sm text-slate-600">
              <div>City: {user.profile?.city ?? "Not set"}</div>
              <div>Company: {user.profile?.companyName ?? "Independent"}</div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-current text-amber-500" />
                {average ? `${average.toFixed(1)}/5 from ${user.reviewsReceived.length} reviews` : "No reviews yet"}
              </div>
            </div>
            {canReview ? (
              <StartMessageButton participantBId={user.id} locale={params.locale} className="w-full" />
            ) : null}
            <div className="rounded-3xl border border-rose-100 bg-rose-50 p-4">
              <div className="mb-3 flex items-center gap-2 font-semibold text-rose-700">
                <Mail className="h-4 w-4" />
                Report to admin
              </div>
              <TicketForm targetUserId={user.id} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-xl font-semibold text-brand-navy">General reviews</h2>
              {user.reviewsReceived.length ? (
                user.reviewsReceived.map((review) => (
                  <div key={review.id} className="rounded-3xl bg-brand-gray p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-brand-navy">{review.title || "Review"}</div>
                      <div className="text-sm text-amber-600">{review.rating}/5</div>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>
                    <div className="mt-2 text-xs text-slate-500">
                      By {review.reviewer.profile?.fullName ?? review.reviewer.email}
                      {review.listing ? ` about ${review.listing.title}` : ""}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No one reviewed this profile yet.</p>
              )}
              {canReview ? <ReviewForm targetUserId={user.id} label="Review this person" /> : null}
            </CardContent>
          </Card>

          {user.role !== "TENANT" ? (
            <Card>
              <CardContent className="space-y-4 p-6">
                <h2 className="text-xl font-semibold text-brand-navy">Approved properties</h2>
                {user.ownedListings.length ? (
                  user.ownedListings.map((listing) => (
                    <Link key={listing.id} href={`/${params.locale}/listing/${listing.slug}`} className="block rounded-3xl bg-brand-gray p-4 hover:bg-slate-100">
                      <div className="font-semibold text-brand-navy">{listing.title}</div>
                      <div className="text-sm text-slate-500">
                        {listing.commune}, {listing.wilaya}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No approved public listings yet.</p>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
