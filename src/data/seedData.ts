import { db, OperationType, handleFirestoreError } from '../firebase';
import { collection, getDocs, doc, setDoc, query, limit } from 'firebase/firestore';
import { Listing, MarketTrend, MarketHistoryPoint } from '../types';

// Unsplash high quality house imagery mapping
const SEED_IMAGES = {
  condo1: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80", // Modern apartment
  condo2: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80", // Premium penthouse
  house1: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80", // Modern villa
  house2: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80", // Kathmandu style modern house
  suburban1: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80", // Premium villa
  suburban2: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80", // Modern residence
  heritage1: "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=600&q=80", // Premium Newari luxury structure
  heritage2: "https://images.unsplash.com/photo-1416331109156-82b1752d6ac5?auto=format&fit=crop&w=600&q=80", // Brick townhouse
};

export const LISTINGS_SEED: Listing[] = [
  {
    address: "74 Siddhi Marg, Baluwatar",
    neighborhood: "Baluwatar, Kathmandu",
    price: 18500000, // 1.85 Crore NPR
    beds: 2,
    baths: 2,
    sqft: 3.6, // 3.6 Aana
    buildYear: 2021,
    propertyType: "Apartment / Condo",
    status: "Active",
    imageUrl: SEED_IMAGES.condo1,
    createdAt: new Date()
  },
  {
    address: "12 Gairidhara Lane, Baluwatar",
    neighborhood: "Baluwatar, Kathmandu",
    price: 45000000, // 4.5 Crore NPR
    beds: 4,
    baths: 4,
    sqft: 8.2, // 8.2 Aana
    buildYear: 2018,
    propertyType: "Independent House",
    status: "Active",
    imageUrl: SEED_IMAGES.house1,
    createdAt: new Date()
  },
  {
    address: "9 Arun Thapa Chowk Rd, Jhamsikhel",
    neighborhood: "Jhamsikhel, Lalitpur",
    price: 52000000, // 5.2 Crore NPR
    beds: 5,
    baths: 4.5,
    sqft: 10.0, // 10 Aana
    buildYear: 2020,
    propertyType: "Modern Bungalow",
    status: "Active",
    imageUrl: SEED_IMAGES.house2,
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    address: "Sanepa Heights Road",
    neighborhood: "Jhamsikhel, Lalitpur",
    price: 23000000, // 2.3 Crore NPR
    beds: 3,
    baths: 2,
    sqft: 4.7, // 4.7 Aana
    buildYear: 2022,
    propertyType: "Apartment / Condo",
    status: "Active",
    imageUrl: SEED_IMAGES.condo2,
    createdAt: new Date()
  },
  {
    address: "24 Swotha Square, Patan",
    neighborhood: "Patan, Lalitpur",
    price: 36000000, // 3.6 Crore NPR
    beds: 3,
    baths: 2,
    sqft: 4.5, // 4.5 Aana
    buildYear: 2017,
    propertyType: "Traditional Newari House",
    status: "Active",
    imageUrl: SEED_IMAGES.heritage1,
    createdAt: new Date()
  },
  {
    address: "Patan Durbar Area West Lane",
    neighborhood: "Patan, Lalitpur",
    price: 49000000, // 4.9 Crore NPR
    beds: 4,
    baths: 3,
    sqft: 6.8, // 6.8 Aana
    buildYear: 2021,
    propertyType: "Modern Bungalow",
    status: "Active",
    imageUrl: SEED_IMAGES.house2,
    createdAt: new Date()
  },
  {
    address: "15 Devkota Sadak, New Baneshwor",
    neighborhood: "Baneshwor, Kathmandu",
    price: 38000000, // 3.8 Crore NPR
    beds: 4,
    baths: 3,
    sqft: 7.0, // 7.0 Aana
    buildYear: 2015,
    propertyType: "Independent House",
    status: "Active",
    imageUrl: SEED_IMAGES.suburban1,
    createdAt: new Date(Date.now() - 7200000)
  },
  {
    address: "Mid-Baneshwor Lane",
    neighborhood: "Baneshwor, Kathmandu",
    price: 29500000, // 2.95 Crore NPR
    beds: 3,
    baths: 2.5,
    sqft: 5.4, // 5.4 Aana
    buildYear: 2012,
    propertyType: "Independent House",
    status: "Active",
    imageUrl: SEED_IMAGES.suburban2,
    createdAt: new Date()
  },
  {
    address: "Muhan Pokhari Road, Budhanilkantha",
    neighborhood: "Budhanilkantha, Kathmandu",
    price: 64000000, // 6.4 Crore NPR
    beds: 5,
    baths: 5,
    sqft: 12.3, // 12.3 Aana
    buildYear: 2023,
    propertyType: "Modern Bungalow",
    status: "Active",
    imageUrl: SEED_IMAGES.heritage1,
    createdAt: new Date()
  },
  {
    address: "Deuba Chowk, Budhanilkantha",
    neighborhood: "Budhanilkantha, Kathmandu",
    price: 31000000, // 3.1 Crore NPR
    beds: 3,
    baths: 3,
    sqft: 6.1, // 6.1 Aana
    buildYear: 2019,
    propertyType: "Traditional Newari House",
    status: "Active",
    imageUrl: SEED_IMAGES.heritage2,
    createdAt: new Date(Date.now() - 1800000)
  },
  {
    address: "Suryabinayak Heights Road",
    neighborhood: "Bhaktapur Durbar Area",
    price: 26000000, // 2.6 Crore NPR
    beds: 4,
    baths: 3,
    sqft: 6.4, // 6.4 Aana
    buildYear: 2016,
    propertyType: "Independent House",
    status: "Active",
    imageUrl: SEED_IMAGES.suburban1,
    createdAt: new Date()
  },
  {
    address: "Taumadhi Square Lane, Bhaktapur",
    neighborhood: "Bhaktapur Durbar Area",
    price: 19000000, // 1.9 Crore NPR
    beds: 3,
    baths: 2,
    sqft: 4.8, // 4.8 Aana
    buildYear: 2005,
    propertyType: "Traditional Newari House",
    status: "Active",
    imageUrl: SEED_IMAGES.heritage2,
    createdAt: new Date()
  }
];

// Historical valuation per sqft database over last 5 years in NPR (2021 to 2026)
function generateHistory(basePrice: number, growthRate: number): MarketHistoryPoint[] {
  const years = [2021, 2022, 2023, 2024, 2025, 2026];
  const points: MarketHistoryPoint[] = [];
  let currentVal = basePrice;

  years.forEach((y, i) => {
    // Add seasonal variations around the Nepalese economic adjustments
    const season1 = 1 + (Math.random() * 0.05 - 0.02);
    const season2 = 1 + (Math.random() * 0.05 - 0.02);

    const priceQ2 = Math.round(currentVal * season1);
    points.push({
      month: `Q2 ${String(y).substring(2)}`,
      avgPriceSqft: priceQ2,
      medianPrice: priceQ2 * 5.5,
      growthIndicatorYOY: i === 0 ? 0 : growthRate * 100
    });

    // Compound values for the next period
    currentVal = Math.round(currentVal * (1 + (growthRate / 2)));

    const priceQ4 = Math.round(currentVal * season2);
    points.push({
      month: `Q4 ${String(y).substring(2)}`,
      avgPriceSqft: priceQ4,
      medianPrice: priceQ4 * 5.5,
      growthIndicatorYOY: growthRate * 100
    });

    currentVal = Math.round(currentVal * (1 + (growthRate / 2)));
  });

  return points;
}

export const TRENDS_SEED: MarketTrend[] = [
  {
    neighborhood: "Baluwatar, Kathmandu",
    averagePricePerSqft: 4800000, // 48 Lakhs per Aana
    growthRate: 0.108,
    monthlyHistory: generateHistory(3600000, 0.108)
  },
  {
    neighborhood: "Jhamsikhel, Lalitpur",
    averagePricePerSqft: 4200000, // 42 Lakhs per Aana
    growthRate: 0.095,
    monthlyHistory: generateHistory(3100000, 0.095)
  },
  {
    neighborhood: "Patan, Lalitpur",
    averagePricePerSqft: 4000000, // 40 Lakhs per Aana
    growthRate: 0.088,
    monthlyHistory: generateHistory(2900000, 0.088)
  },
  {
    neighborhood: "Baneshwor, Kathmandu",
    averagePricePerSqft: 3500000, // 35 Lakhs per Aana
    growthRate: 0.082,
    monthlyHistory: generateHistory(2600000, 0.082)
  },
  {
    neighborhood: "Budhanilkantha, Kathmandu",
    averagePricePerSqft: 2800000, // 28 Lakhs per Aana
    growthRate: 0.076,
    monthlyHistory: generateHistory(2100000, 0.076)
  },
  {
    neighborhood: "Bhaktapur Durbar Area",
    averagePricePerSqft: 2000000, // 20 Lakhs per Aana
    growthRate: 0.055,
    monthlyHistory: generateHistory(1600000, 0.055)
  }
];

/**
 * Seeding system initialization. Sets up data safely on first boot.
 */
export async function seedFirestoreDatabaseIfEmpty() {
  try {
    const listingsQuery = query(collection(db, 'listings'), limit(1));
    const listingsSnap = await getDocs(listingsQuery);

    if (listingsSnap.empty) {
      console.log("[SEED] Initializing Firestore database collections with seed data for Kathmandu Valley...");

      // 1. Seed Listings
      for (const item of LISTINGS_SEED) {
        // Construct standard alphanumeric document ID matching validation rules (isValidId / lowercase words dashes)
        const itemSlug = item.address.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        await setDoc(doc(db, 'listings', itemSlug), item);
      }

      // 2. Seed Market Trends
      for (const item of TRENDS_SEED) {
        const trendSlug = item.neighborhood.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const payload = {
          neighborhood: item.neighborhood,
          averagePricePerSqft: item.averagePricePerSqft,
          growthRate: item.growthRate,
          monthlyHistory: JSON.stringify(item.monthlyHistory) // Rule: Stored as serialized string mapping schemas
        };
        await setDoc(doc(db, 'marketTrends', trendSlug), payload);
      }

      console.log("[SEED] Database seeding complete.");
    } else {
      console.log("[SEED] Database listings are already seeded or have content.");
    }
  } catch (error) {
    console.error("[SEED] Seeding was omitted due to permissions or database status.", error);
  }
}
