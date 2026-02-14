export interface Review {
  id: number;
  clientName: string;
  rating: number;
  comment: string;
  clientImage?: string;
  date?: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  imageUrl: string;
}

export interface CraftsmanProfileData {
  id: number;
  name: string;
  jobTitle: string;
  avatarUrl: string;
  coverUrl: string;
  rating: number;
  experienceYears: number;
  address: string;
  governorate?: string;
  phone: string;
  about: string;
  priceRange?: string;
  workDays?: string[];
  specialization: string[];
  paymentMethods: string[];
  services: string[];
  reviews: Review[];
  portfolio: PortfolioItem[];
}
