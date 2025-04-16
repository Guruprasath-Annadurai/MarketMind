import { Dataset, ChurnPrediction, CustomerSegment, CampaignSuggestion } from '@/types';

// Mock datasets for demo purposes
export const mockDatasets: Dataset[] = [
  {
    id: '1',
    name: 'Q2 Customer Data',
    description: 'Quarterly customer behavior data including purchases, logins, and support tickets',
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2023-06-15T10:30:00Z',
    rowCount: 5243,
    columnCount: 18,
    status: 'processed', // Updated to match schema enum
    fileSize: 2.4 * 1024 * 1024, // 2.4 MB
    predictionId: 'pred-1' // Added prediction ID reference
  },
  {
    id: '2',
    name: 'Website Analytics',
    description: 'User behavior from website including page views, time on site, and conversion events',
    createdAt: '2023-05-22T14:15:00Z',
    updatedAt: '2023-05-22T14:15:00Z',
    rowCount: 12876,
    columnCount: 24,
    status: 'processed', // Updated to match schema enum
    fileSize: 4.8 * 1024 * 1024, // 4.8 MB
    predictionId: 'pred-2' // Added prediction ID reference
  },
  {
    id: '3',
    name: 'Marketing Campaign Results',
    description: 'Results from Q1 email and social media campaigns including opens, clicks, and conversions',
    createdAt: '2023-04-10T09:45:00Z',
    updatedAt: '2023-04-10T09:45:00Z',
    rowCount: 3567,
    columnCount: 15,
    status: 'processing', // Updated to match schema enum
    fileSize: 1.7 * 1024 * 1024, // 1.7 MB
  }
];

// Mock churn prediction for demo purposes
export const mockChurnPrediction: ChurnPrediction = {
  id: 'pred-1',
  datasetId: '1',
  createdAt: '2023-06-16T14:30:00Z',
  accuracy: 0.87,
  precision: 0.83,
  recall: 0.79,
  f1Score: 0.81,
  churnRate: 0.15,
  predictedChurnCount: 786,
  totalCustomers: 5243,
  userId: 'user-1', // Added user ID reference
  fileUrl: 'https://example.com/datasets/1.csv' // Added file URL
};

// Mock customer segments for demo purposes
export const mockCustomerSegments: CustomerSegment[] = [
  {
    id: 'seg-1',
    name: 'High-Value Loyalists',
    size: 1573,
    percentage: 30,
    avgLtv: 950,
    avgEngagement: 0.89,
    churnRisk: 0.05,
    color: '#4A6FFF',
  },
  {
    id: 'seg-2',
    name: 'At-Risk Big Spenders',
    size: 1311,
    percentage: 25,
    avgLtv: 720,
    avgEngagement: 0.45,
    churnRisk: 0.72,
    color: '#FF6B6B',
  },
  {
    id: 'seg-3',
    name: 'Occasional Buyers',
    size: 1311,
    percentage: 25,
    avgLtv: 220,
    avgEngagement: 0.38,
    churnRisk: 0.28,
    color: '#FFC107',
  },
  {
    id: 'seg-4',
    name: 'New Enthusiasts',
    size: 1048,
    percentage: 20,
    avgLtv: 180,
    avgEngagement: 0.76,
    churnRisk: 0.12,
    color: '#4CAF50',
  }
];

// Mock campaign suggestions for demo purposes
export const mockCampaignSuggestions: CampaignSuggestion[] = [
  {
    id: 'camp-1',
    title: 'Loyalty Rewards Program',
    description: 'Introduce a tiered rewards program for High-Value Loyalists to increase retention and purchase frequency',
    targetSegment: 'High-Value Loyalists',
    expectedImpact: 0.15,
    difficulty: 'medium',
    channels: ['email', 'push'],
    createdAt: '2023-06-17T10:30:00Z',
    segment: 0, // Added segment index
    subject: "Thanks for being a power user 💪",
    body: "You're in our top 10%! Here's an exclusive tip to boost your experience...",
    cta: "Learn More"
  },
  {
    id: 'camp-2',
    title: 'Win-Back Discount Campaign',
    description: 'Offer a limited-time 20% discount to At-Risk Big Spenders to prevent churn and re-engage',
    targetSegment: 'At-Risk Big Spenders',
    expectedImpact: 0.32,
    difficulty: 'easy',
    channels: ['email', 'sms'],
    createdAt: '2023-06-17T10:35:00Z',
    segment: 1, // Added segment index
    subject: "Don't Miss Out! Here's 20% Just for You",
    body: "We noticed you've been inactive. Come back and enjoy 20% off on your next visit!",
    cta: "Claim Offer"
  },
  {
    id: 'camp-3',
    title: 'Seasonal Engagement Campaign',
    description: 'Develop a seasonal campaign to re-engage Occasional Buyers with personalized product recommendations',
    targetSegment: 'Occasional Buyers',
    expectedImpact: 0.22,
    difficulty: 'hard',
    channels: ['email', 'social'],
    createdAt: '2023-06-17T10:40:00Z',
    segment: 2, // Added segment index
    subject: "We miss you! Come back and see what's new",
    body: "It's been a while since your last purchase. We've added new products we think you'll love!",
    cta: "Shop Now"
  },
  {
    id: 'camp-4',
    title: 'Product Education Series',
    description: 'Create a series of educational content for New Enthusiasts to showcase product value and features',
    targetSegment: 'New Enthusiasts',
    expectedImpact: 0.18,
    difficulty: 'medium',
    channels: ['email', 'push'],
    createdAt: '2023-06-17T10:45:00Z',
    segment: 3, // Added segment index
    subject: "Welcome to the family! Here's a special gift",
    body: "Thank you for joining us! To help you get started, here's a special welcome discount on your next purchase.",
    cta: "Get Started"
  }
];