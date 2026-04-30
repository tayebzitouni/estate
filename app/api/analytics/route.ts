import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [listings, leads, appointments] = await Promise.all([
    prisma.listing.aggregate({
      _sum: { viewsCount: true, leadsCount: true },
      _avg: { responseTimeMins: true }
    }),
    prisma.lead.count(),
    prisma.viewingAppointment.count()
  ]);

  return Response.json({
    totalViews: listings._sum.viewsCount ?? 0,
    totalLeads: leads,
    trackedLeadEvents: listings._sum.leadsCount ?? 0,
    avgResponseTimeMins: listings._avg.responseTimeMins ?? 0,
    appointments
  });
}
