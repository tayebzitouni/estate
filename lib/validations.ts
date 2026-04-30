import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["TENANT", "OWNER", "AGENT", "PROPERTY_MANAGER"])
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(6).max(30).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal(""))
});

export const listingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  priceDzd: z.number().positive(),
  transactionType: z.enum(["RENT", "SALE"]),
  propertyType: z.enum(["APARTMENT", "VILLA", "STUDIO", "HOUSE", "OFFICE", "SHOP", "LAND", "BUILDING"]),
  wilaya: z.string().min(2),
  commune: z.string().min(2),
  neighborhood: z.string().min(2),
  addressHint: z.string().min(2),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  areaM2: z.number().positive(),
  floor: z.number().min(0).default(0),
  parking: z.boolean().default(false),
  furnished: z.boolean().default(false),
  latitude: z.number(),
  longitude: z.number(),
  amenities: z.array(z.string()).default([])
});

export const appointmentSchema = z.object({
  listingId: z.string().cuid().or(z.string().min(3)),
  requestedAt: z.string().datetime(),
  note: z.string().max(500).optional()
});

export const reportSchema = z.object({
  listingId: z.string().cuid().or(z.string().min(3)),
  reason: z.string().min(10),
  details: z.string().max(1000).optional()
});

export const reviewSchema = z.object({
  listingId: z.string().cuid().or(z.string().min(3)).optional(),
  targetUserId: z.string().cuid().or(z.string().min(3)).optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional().or(z.literal("")),
  comment: z.string().min(10).max(1200)
}).refine((value) => value.listingId || value.targetUserId, {
  message: "Review must target a listing or a user."
});

export const ticketSchema = z.object({
  listingId: z.string().cuid().or(z.string().min(3)).optional(),
  targetUserId: z.string().cuid().or(z.string().min(3)).optional(),
  subject: z.string().min(5).max(120),
  category: z.string().min(3).max(60),
  description: z.string().min(15).max(2000),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL")
});

export const ticketMessageSchema = z.object({
  ticketId: z.string().cuid().or(z.string().min(3)),
  message: z.string().min(2).max(1500)
});

export const savedSearchSchema = z.object({
  name: z.string().min(2),
  filters: z.record(z.any()),
  notifyByEmail: z.boolean().default(true)
});
