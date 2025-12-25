import { ObjectId } from "mongodb";
import { getDatabase } from "./mongodb";

export interface Agency {
  _id?: ObjectId;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  description?: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  _id?: ObjectId;
  agencyId: ObjectId;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  images: string[];
  features: string[];
  seats: number;
  transmission: "manual" | "automatic";
  fuelType: "gasoline" | "diesel" | "electric" | "hybrid";
  pricing: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Discount {
  _id?: ObjectId;
  agencyId: ObjectId;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minRentalDays?: number;
  maxRentalDays?: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reservation {
  _id?: ObjectId;
  agencyId: ObjectId;
  vehicleId: ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  basePrice: number;
  discountCode?: string;
  discountAmount: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  name: string;
  agencyId: ObjectId;
  role: "manager" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

// Collections
export const getAgenciesCollection = async () => {
  const db = await getDatabase();
  return db.collection<Agency>("agencies");
};

export const getVehiclesCollection = async () => {
  const db = await getDatabase();
  return db.collection<Vehicle>("vehicles");
};

export const getReservationsCollection = async () => {
  const db = await getDatabase();
  return db.collection<Reservation>("reservations");
};

export const getDiscountsCollection = async () => {
  const db = await getDatabase();
  return db.collection<Discount>("discounts");
};

export const getUsersCollection = async () => {
  const db = await getDatabase();
  return db.collection<User>("users");
};

