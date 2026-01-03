import { differenceInDays } from "date-fns";
import { Vehicle, Discount } from "@/lib/db/models";

export interface PricingCalculation {
  basePrice: number;
  discountAmount: number;
  totalPrice: number;
  dailyRate: number;
  totalDays: number;
}

export function calculatePricing(
  vehicle: Vehicle,
  startDate: Date,
  endDate: Date,
  discount?: Discount
): PricingCalculation {
  const totalDays = differenceInDays(endDate, startDate) + 1;
  
  let dailyRate: number;
  if (totalDays >= 30) {
    dailyRate = vehicle.pricing.monthly / 30;
  } else if (totalDays >= 7) {
    dailyRate = vehicle.pricing.weekly / 7;
  } else {
    dailyRate = vehicle.pricing.daily;
  }

  const basePrice = dailyRate * totalDays;

  let discountAmount = 0;
  if (discount && discount.isActive) {
    const now = new Date();
    if (now >= discount.validFrom && now <= discount.validTo) {
      if (
        (!discount.minRentalDays || totalDays >= discount.minRentalDays) &&
        (!discount.maxRentalDays || totalDays <= discount.maxRentalDays)
      ) {
        if (discount.type === "percentage") {
          discountAmount = (basePrice * discount.value) / 100;
        } else {
          discountAmount = discount.value;
        }
      }
    }
  }

  const totalPrice = Math.max(0, basePrice - discountAmount);

  return {
    basePrice,
    discountAmount,
    totalPrice,
    dailyRate,
    totalDays,
  };
}

export function checkVehicleAvailability(
  vehicleId: string,
  startDate: Date,
  endDate: Date,
  reservations: Array<{ startDate: Date; endDate: Date; status: string }>
): boolean {
  const activeReservations = reservations.filter(
    (r) => r.status === "confirmed" || r.status === "pending"
  );

  for (const reservation of activeReservations) {
    if (
      (startDate >= reservation.startDate && startDate <= reservation.endDate) ||
      (endDate >= reservation.startDate && endDate <= reservation.endDate) ||
      (startDate <= reservation.startDate && endDate >= reservation.endDate)
    ) {
      return false;
    }
  }

  return true;
}


