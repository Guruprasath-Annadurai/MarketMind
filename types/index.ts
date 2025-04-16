// Common types for MarketMind AI

export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: 'free' | 'pro' | 'enterprise';
  avatar?: string;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  rowCount: number;
  columnCount: number;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  fileSize: number;
  fileUri?: string; // Added for real file uploads
  userId?: string; // Added to link datasets to users
  predictionId?: string; // Reference to the latest prediction
}

export interface ChurnPrediction {
  id: string;
  datasetId: string;
  createdAt: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  churnRate: number;
  predictedChurnCount: number;
  totalCustomers: number;
  userId?: string; // Added to link predictions to users
  fileUrl?: string; // URL to the dataset file
}

export interface CustomerSegment {
  id: string;
  name: string;
  size: number;
  percentage: number;
  avgLtv: number;
  avgEngagement: number;
  churnRisk: number;
  color: string;
}

export interface CampaignSuggestion {
  id: string;
  title: string;
  description: string;
  targetSegment: string;
  expectedImpact: number;
  difficulty: 'easy' | 'medium' | 'hard';
  channels: Array<'email' | 'sms' | 'push' | 'social'>;
  createdAt: string;
  // New fields matching the schema
  segment?: number;
  subject?: string;
  body?: string;
  cta?: string;
}

export interface MetricCard {
  title: string;
  value: number | string;
  change?: number;
  icon: string;
  color: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: string;
  }[];
}