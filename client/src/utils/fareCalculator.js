const rates = {
  Auto: { base: 30, perKm: 8 },
  Sedan: { base: 50, perKm: 12 },
  SUV: { base: 80, perKm: 18 }
};

/**
 * Calculates the estimated RYDO fare for a vehicle and distance.
 *
 * @param {'Auto'|'Sedan'|'SUV'} vehicleType - Selected vehicle type.
 * @param {number} distanceKm - Driving distance in kilometers.
 * @returns {number}
 */
export function calculateFare(vehicleType, distanceKm) {
  const rate = rates[vehicleType];

  if (!rate) {
    return 0;
  }

  return Math.round(rate.base + distanceKm * rate.perKm);
}

export const fareRates = rates;
