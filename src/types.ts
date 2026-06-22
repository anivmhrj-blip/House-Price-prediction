/**
 * House Price Prediction & Real Estate Valuation Platform
 * Shared TypeScript types & interfaces
 */

export interface Listing {
  id?: string;
  address: string;
  neighborhood: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  buildYear: number;
  propertyType: string;
  status: "Active" | "Sold" | "Pending";
  imageUrl: string;
  createdAt: any; // Firestore Timestamp
}

export interface SavedSearch {
  id?: string;
  userId: string;
  neighborhood: string;
  maxPrice: number;
  minBeds: number;
  propertyType: string;
  activeNotifications: boolean;
  createdAt: any; // Firestore Timestamp
}

export interface Valuation {
  id?: string;
  userId: string;
  neighborhood: string;
  beds: number;
  baths: number;
  sqft: number;
  buildYear: number;
  propertyType: string;
  condition: "Standard" | "Premium" | "Luxury";
  predictedPrice: number;
  explanation: string;
  createdAt: any; // Firestore Timestamp
}

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  listingId?: string;
  read: boolean;
  createdAt: any; // Firestore Timestamp
}

export interface MarketHistoryPoint {
  month: string; // e.g., "Jan 25", "Feb 25"
  avgPriceSqft: number;
  medianPrice: number;
  growthIndicatorYOY: number;
}

export interface MarketTrend {
  id?: string;
  neighborhood: string;
  averagePricePerSqft: number;
  growthRate: number; // e.g. 0.08 for 8%
  monthlyHistory: MarketHistoryPoint[];
}

export enum PropertyCondition {
  STANDARD = "Standard",
  PREMIUM = "Premium",
  LUXURY = "Luxury"
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
  isMock?: boolean;
}
