export const locales = ["ar", "fr", "en"] as const;
export type Locale = (typeof locales)[number];

export const wilayas = [
  "Algiers",
  "Oran",
  "Constantine",
  "Annaba",
  "Blida",
  "Sétif",
  "Tlemcen",
  "Béjaïa",
  "Batna",
  "Tizi Ouzou",
  "Sidi Bel Abbès",
  "Mostaganem"
] as const;

export const propertyTypes = [
  "APARTMENT",
  "VILLA",
  "STUDIO",
  "HOUSE",
  "OFFICE",
  "SHOP",
  "LAND",
  "BUILDING"
] as const;

export const transactionTypes = ["RENT", "SALE"] as const;

export const roleLabels = {
  TENANT: "Tenant / Buyer",
  OWNER: "Owner",
  AGENT: "Agent",
  PROPERTY_MANAGER: "Property Manager",
  ADMIN: "Admin / Moderator"
} as const;
