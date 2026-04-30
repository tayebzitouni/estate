import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function getPublicListings() {
  try {
    return await prisma.listing.findMany({
      where: {
        status: "PUBLISHED",
        verificationStatus: "APPROVED"
      },
      include: {
        media: true,
        amenities: true,
        property: true,
        owner: {
          include: {
            profile: true
          }
        },
        agent: {
          include: {
            profile: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  } catch {
    return [];
  }
}

export async function getListingBySlug(slug: string) {
  try {
    return await prisma.listing.findUnique({
      where: { slug },
      include: {
        media: true,
        amenities: true,
        owner: {
          include: { profile: true, reviewsReceived: { where: { isPublic: true } } }
        },
        agent: {
          include: { profile: true, reviewsReceived: { where: { isPublic: true } } }
        },
        property: true,
        reviews: {
          where: { isPublic: true },
          include: { reviewer: { include: { profile: true } } },
          orderBy: { createdAt: "desc" }
        }
      }
    });
  } catch {
    return null;
  }
}

export async function getAdminSnapshot() {
  try {
    const [pendingListings, pendingVerifications, openReports, listingCount, leadCount] = await Promise.all([
      prisma.listing.count({ where: { verificationStatus: "PENDING" } }),
      prisma.verificationProfile.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "OPEN" } }),
      prisma.listing.count(),
      prisma.lead.count()
    ]);

    return { pendingListings, pendingVerifications, openReports, listingCount, leadCount };
  } catch {
    return {
      pendingListings: 0,
      pendingVerifications: 0,
      openReports: 0,
      listingCount: 0,
      leadCount: 0
    };
  }
}

export async function getDashboardSnapshot(session?: { userId: string; role: string } | null) {
  try {
    if (!session) {
      return { listingCount: 0, pendingAppointments: 0, activeLeads: 0 };
    }

    const listingOwnership =
      session.role === "ADMIN"
        ? {}
        : {
            OR: [{ ownerId: session.userId }, { agentId: session.userId }]
          };

    const appointmentOwnership =
      session.role === "ADMIN"
        ? {}
        : session.role === "TENANT"
          ? { requesterId: session.userId }
          : {
              listing: {
                OR: [{ ownerId: session.userId }, { agentId: session.userId }]
              }
            };

    const leadOwnership =
      session.role === "ADMIN"
        ? {}
        : session.role === "TENANT"
          ? { userId: session.userId }
          : {
              listing: {
                OR: [{ ownerId: session.userId }, { agentId: session.userId }]
              }
            };

    const [listingCount, pendingAppointments, activeLeads] = await Promise.all([
      prisma.listing.count({ where: listingOwnership }),
      prisma.viewingAppointment.count({ where: { ...appointmentOwnership, status: "REQUESTED" } }),
      prisma.lead.count({ where: { ...leadOwnership, status: "NEW" } })
    ]);
    return { listingCount, pendingAppointments, activeLeads };
  } catch {
    return { listingCount: 0, pendingAppointments: 0, activeLeads: 0 };
  }
}

export function getSeededAccounts() {
  return [
    { label: "Admin", email: "admin@darak.dz" },
    { label: "Owner", email: "owner@darak.dz" },
    { label: "Agent", email: "agent@darak.dz" }
  ];
}

export function toApiError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function parseBody<T>(value: T) {
  return value as Prisma.InputJsonValue;
}
