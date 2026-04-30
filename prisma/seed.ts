import { PrismaClient, Role, VerificationStatus } from "@prisma/client";

import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function clearBusinessData() {
  await prisma.$transaction([
    prisma.promotion.deleteMany(),
    prisma.subscriptionPlan.deleteMany(),
    prisma.emailVerificationToken.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.moderationCase.deleteMany(),
    prisma.report.deleteMany(),
    prisma.viewingAppointment.deleteMany(),
    prisma.message.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.savedSearch.deleteMany(),
    prisma.savedListing.deleteMany(),
    prisma.amenity.deleteMany(),
    prisma.document.deleteMany(),
    prisma.media.deleteMany(),
    prisma.listing.deleteMany(),
    prisma.property.deleteMany()
  ]);
}

async function upsertAccount(input: {
  email: string;
  password: string;
  role: Role;
  fullName: string;
  city?: string;
  companyName?: string;
}) {
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      passwordHash: hashPassword(input.password),
      role: input.role,
      isActive: true,
      emailVerifiedAt: new Date(),
      pendingEmail: null,
      profile: {
        upsert: {
          create: {
            fullName: input.fullName,
            preferredLang: "ar",
            city: input.city,
            companyName: input.companyName
          },
          update: {
            fullName: input.fullName,
            city: input.city,
            companyName: input.companyName
          }
        }
      },
      verificationProfile: {
        upsert: {
          create: {
            legalName: input.fullName,
            status: VerificationStatus.APPROVED
          },
          update: {
            legalName: input.fullName,
            status: VerificationStatus.APPROVED
          }
        }
      }
    },
    create: {
      email: input.email,
      passwordHash: hashPassword(input.password),
      role: input.role,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          fullName: input.fullName,
          preferredLang: "ar",
          city: input.city,
          companyName: input.companyName
        }
      },
      verificationProfile: {
        create: {
          legalName: input.fullName,
          status: VerificationStatus.APPROVED
        }
      }
    }
  });
}

async function main() {
  await clearBusinessData();

  const [admin, owner, agent] = await Promise.all([
    upsertAccount({
      email: "admin@darak.dz",
      password: "Admin12345",
      role: Role.ADMIN,
      fullName: "Darak Admin",
      city: "Algiers",
      companyName: "Darak"
    }),
    upsertAccount({
      email: "owner@darak.dz",
      password: "Owner12345",
      role: Role.OWNER,
      fullName: "Yasmine Benali",
      city: "Algiers"
    }),
    upsertAccount({
      email: "agent@darak.dz",
      password: "Agent12345",
      role: Role.AGENT,
      fullName: "Karim Immo",
      city: "Oran",
      companyName: "Karim Immo Conseil"
    })
  ]);

  console.log("Seed complete. Business data cleared; only role accounts are ready.", {
    admin: admin.email,
    owner: owner.email,
    agent: agent.email
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
