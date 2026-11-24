import type { PricePoint } from '../types/phone';

/**
 * Generates 365 daily price points leading up to 2026-11-24,
 * incorporating realistic Indian festive e-commerce sale dips
 * (Big Billion Days, Republic Day, Independence Day).
 */
export function generate365DayHistory(
  currentPrice: number,
  _mrp: number,
  lowestPrice: number,
  highestPrice: number,
  seed: number = 42
): {
  history: PricePoint[];
  oneYearLow: number;
  oneYearHigh: number;
  oneYearAvg: number;
} {
  const points: PricePoint[] = [];
  const totalDays = 365;
  const baseDate = new Date('2026-11-24T00:00:00Z');

  // Pseudo-random deterministic generator based on seed
  let currentSeed = seed;
  const pseudoRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  let minPrice = Infinity;
  let maxPrice = -Infinity;
  let sumPrice = 0;

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const month = d.getUTCMonth(); // 0 = Jan, 9 = Oct
    const day = d.getUTCDate();

    let event: string | undefined = undefined;
    let priceMultiplier = 1.0;

    // Flipkart Big Billion Days (early October ~ Oct 7 to Oct 15)
    if (month === 9 && day >= 6 && day <= 15) {
      event = 'Flipkart Big Billion Days';
      priceMultiplier = 0.88;
    } 
    // Republic Day Sale (Jan 14 to Jan 20)
    else if (month === 0 && day >= 14 && day <= 20) {
      event = 'Republic Day Sale';
      priceMultiplier = 0.91;
    }
    // Independence Day Sale (Aug 5 to Aug 11)
    else if (month === 7 && day >= 5 && day <= 11) {
      event = 'Independence Day Sale';
      priceMultiplier = 0.92;
    }
    // Flipkart Big Bachat Days (first week of months)
    else if (day >= 1 && day <= 3 && pseudoRandom() > 0.4) {
      event = 'Big Bachat Days';
      priceMultiplier = 0.95;
    }

    // Baseline price trajectory: starts near launch/mrp-leaning, gradually trends down
    const ageFactor = (totalDays - 1 - i) / totalDays; // 0 (1 yr ago) to 1 (today)
    const baseline = highestPrice - (highestPrice - currentPrice) * (0.3 + 0.7 * ageFactor);
    
    // Slight random market noise (+/- 2%)
    const noise = (pseudoRandom() - 0.5) * 0.04;
    let computedPrice = Math.round((baseline * (1 + noise) * priceMultiplier) / 50) * 50;

    // Apply strict bounds
    if (event === 'Flipkart Big Billion Days' || i === 0 && currentPrice === lowestPrice) {
      computedPrice = Math.min(computedPrice, lowestPrice);
    }
    computedPrice = Math.max(lowestPrice, Math.min(highestPrice, computedPrice));

    // Force day 0 (today) to equal the exact currentPrice
    if (i === 0) {
      computedPrice = currentPrice;
      if (currentPrice === lowestPrice) {
        event = 'Current Price (1-Year Low)';
      }
    }

    if (computedPrice < minPrice) minPrice = computedPrice;
    if (computedPrice > maxPrice) maxPrice = computedPrice;
    sumPrice += computedPrice;

    points.push({
      date: dateStr,
      price: computedPrice,
      event,
    });
  }

  const oneYearAvg = Math.round(sumPrice / totalDays);

  return {
    history: points,
    oneYearLow: minPrice,
    oneYearHigh: maxPrice,
    oneYearAvg,
  };
}
