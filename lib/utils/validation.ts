import { z } from "zod";

export const agencySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
});

export const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1, "Color is required"),
  licensePlate: z.string().min(1, "License plate is required"),
  images: z.array(z.string().url()).optional(),
  features: z.array(z.string()).optional(),
  seats: z.number().min(1).max(50),
  transmission: z.enum(["manual", "automatic"]),
  fuelType: z.enum(["gasoline", "diesel", "electric", "hybrid"]),
  pricing: z.object({
    daily: z.number().min(0),
    weekly: z.number().min(0),
    monthly: z.number().min(0),
  }),
  isAvailable: z.boolean(),
});

export const discountSchema = z.object({
  code: z.string().min(1, "Code is required"),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().min(0),
  minRentalDays: z.number().optional(),
  maxRentalDays: z.number().optional(),
  validFrom: z.date(),
  validTo: z.date(),
  isActive: z.boolean(),
});

export const reservationSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(1, "Phone is required"),
  startDate: z.date(),
  endDate: z.date(),
  discountCode: z.string().optional(),
  driverLicenseUrl: z.string().url().optional(),
  idDocumentUrl: z.string().url().optional(),
});

export const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  agencyId: z.string().min(1, "Agency is required"),
});


