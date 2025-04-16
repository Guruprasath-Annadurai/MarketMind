import { Dataset, ChurnPrediction, CustomerSegment, CampaignSuggestion } from '@/types';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { storeDatasetResult, updateDatasetWithPrediction } from './firebase';
import { useAuthStore } from '@/store/auth-store';

// API endpoint for the Flask ML service
const API_URL = 'https://marketmind-api.onrender.com/predict';

/**
 * This service connects to a Flask ML API for churn prediction and customer segmentation.
 */

// Simulate API delay for web platform where we can't make actual API calls
const simulateApiDelay = (ms: number = 2000) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * PredictWithMLAPI - Main function to process a dataset by sending it to the Flask ML API
 * This matches the flow diagram's PredictWithMLAPI function
 * 
 * @param dataset The dataset to process
 * @returns Prediction results including churn and segments
 */
export const processDataset = async (dataset: Dataset): Promise<{
  churnPrediction: ChurnPrediction;
  customerSegments: CustomerSegment[];
}> => {
  try {
    // For web platform, we'll use the simulation since we can't upload files easily
    if (Platform.OS === 'web') {
      console.log('Using simulated ML API for web platform');
      return simulateProcessDataset(dataset);
    }
    
    // For native platforms, we'll try to connect to the real API
    // This assumes the dataset has a fileUri property that points to the local file
    if (!dataset.fileUri) {
      console.log('Dataset file URI is missing, using simulation');
      return simulateProcessDataset(dataset);
    }
    
    try {
      // Create form data for the file upload
      const formData = new FormData();
      formData.append('file', {
        uri: dataset.fileUri,
        name: 'dataset.csv',
        type: 'text/csv'
      } as any);
      
      console.log('Sending request to ML API:', API_URL);
      
      // Send the request to the Flask API - This is the PredictWithMLAPI call
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API request failed: ${response.status} ${errorText}`);
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Received response from ML API:', data);
      
      // Transform the API response into our app's data model
      const churnPrediction: ChurnPrediction = {
        id: `pred-${Date.now()}`,
        datasetId: dataset.id,
        createdAt: new Date().toISOString(),
        accuracy: data.summary?.model_accuracy || 0.85,
        precision: data.summary?.model_precision || 0.83,
        recall: data.summary?.model_recall || 0.79,
        f1Score: data.summary?.model_f1 || 0.81,
        churnRate: data.summary?.avg_churn || 0.15,
        predictedChurnCount: Math.round(dataset.rowCount * (data.summary?.avg_churn || 0.15)),
        totalCustomers: dataset.rowCount,
        userId: useAuthStore.getState().user?.uid,
        fileUrl: dataset.fileUri
      };
      
      // Transform segment data
      const segmentColors = ['#4A6FFF', '#FF6B6B', '#FFC107', '#4CAF50'];
      const customerSegments: CustomerSegment[] = Object.entries(data.summary?.segment_counts || {})
        .map(([segmentId, count], index) => {
          const segmentName = data.segment_names?.[segmentId] || `Segment ${segmentId}`;
          const size = Number(count);
          const percentage = (size / dataset.rowCount) * 100;
          
          return {
            id: `seg-${segmentId}-${Date.now()}`,
            name: segmentName,
            size,
            percentage: parseFloat(percentage.toFixed(1)),
            avgLtv: data.segment_metrics?.[segmentId]?.avg_ltv || (500 - (index * 100)),
            avgEngagement: data.segment_metrics?.[segmentId]?.avg_engagement || (0.9 - (index * 0.2)),
            churnRisk: data.segment_metrics?.[segmentId]?.churn_risk || (0.1 + (index * 0.2)),
            color: segmentColors[index % segmentColors.length],
          };
        });
      
      // Store the results in Firebase
      const { user } = useAuthStore.getState();
      if (user) {
        try {
          // Step 3: Store prediction result and get prediction_id
          const result = await storeDatasetResult(
            user.uid,
            dataset.id,
            dataset.fileUri,
            churnPrediction,
            customerSegments
          );
          
          if (result.success && result.predictionId) {
            // Update the churnPrediction with the predictionId from Firebase
            churnPrediction.id = result.predictionId;
            
            // Step 4: Ensure dataset is updated with prediction_id
            // This is handled in storeDatasetResult, but we double-check here
            if (result.error && result.error.includes("failed to update dataset")) {
              console.log("Attempting to update dataset with prediction ID again...");
              await updateDatasetWithPrediction(dataset.id, result.predictionId);
            }
          }
          
          console.log('Dataset results stored successfully');
        } catch (error) {
          console.error('Error storing dataset results:', error);
        }
      }
      
      return {
        churnPrediction,
        customerSegments,
      };
    } catch (error) {
      console.error('Error in API call:', error);
      // Fall back to simulation if the API call fails
      return simulateProcessDataset(dataset);
    }
  } catch (error) {
    console.error('Error processing dataset with ML API:', error);
    // Fall back to simulation if the API call fails
    console.log('Falling back to simulated ML API');
    return simulateProcessDataset(dataset);
  }
};

/**
 * Simulates generating campaign suggestions based on customer segments
 * @param segments Customer segments to target
 * @returns Campaign suggestions
 */
export const generateCampaigns = async (
  segments: CustomerSegment[]
): Promise<CampaignSuggestion[]> => {
  try {
    // For web platform or if we want to use simulation
    if (Platform.OS === 'web') {
      return simulateGenerateCampaigns(segments);
    }
    
    // In a real implementation, we would call the Flask API here
    // For now, we'll use the simulation
    const suggestions = await simulateGenerateCampaigns(segments);
    
    // Store the campaign suggestions in Firebase
    const { user } = useAuthStore.getState();
    const { churnPrediction, customerSegments } = useAppStore.getState();
    
    if (user && churnPrediction) {
      try {
        await storeDatasetResult(
          user.uid,
          churnPrediction.datasetId,
          churnPrediction.fileUrl || '', // Use the fileUrl from the churnPrediction
          churnPrediction,
          customerSegments,
          suggestions
        );
        console.log('Campaign suggestions stored successfully');
      } catch (error) {
        console.error('Error storing campaign suggestions:', error);
      }
    }
    
    return suggestions;
    
    // Example of how to call a real API:
    /*
    const response = await fetch('https://marketmind-api.onrender.com/generate-campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ segments }),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.campaigns;
    */
  } catch (error) {
    console.error('Error generating campaigns:', error);
    return simulateGenerateCampaigns(segments);
  }
};

/**
 * Simulates exporting a campaign to a CRM system
 * @param campaign The campaign to export
 * @returns Success status
 */
export const exportCampaignToCRM = async (
  campaign: CampaignSuggestion
): Promise<{ success: boolean; message: string }> => {
  try {
    // Simulate API call delay
    await simulateApiDelay(1500);
    
    // Simulate a successful export 95% of the time
    const isSuccessful = Math.random() > 0.05;
    
    if (isSuccessful) {
      return {
        success: true,
        message: `Campaign "${campaign.title}" successfully exported to CRM system.`,
      };
    } else {
      return {
        success: false,
        message: 'Failed to export campaign. CRM API connection timed out.',
      };
    }
  } catch (error) {
    console.error('Error exporting campaign:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while exporting the campaign.',
    };
  }
};

// ========== SIMULATION FUNCTIONS ==========
// These are used as fallbacks when the real API can't be reached

/**
 * Simulates processing a dataset and generating predictions
 */
const simulateProcessDataset = async (dataset: Dataset): Promise<{
  churnPrediction: ChurnPrediction;
  customerSegments: CustomerSegment[];
}> => {
  // Simulate API call delay
  await simulateApiDelay(3000);
  
  try {
    // Generate a deterministic but seemingly random churn rate based on dataset id
    const datasetIdSum = dataset.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const churnRate = (datasetIdSum % 20 + 5) / 100; // Between 5% and 25%
    
    // Calculate predicted churn count
    const predictedChurnCount = Math.round(dataset.rowCount * churnRate);
    
    // Generate a churn prediction
    const churnPrediction: ChurnPrediction = {
      id: `pred-${Date.now()}`,
      datasetId: dataset.id,
      createdAt: new Date().toISOString(),
      accuracy: 0.75 + (datasetIdSum % 20) / 100, // Between 75% and 95%
      precision: 0.70 + (datasetIdSum % 25) / 100, // Between 70% and 95%
      recall: 0.65 + (datasetIdSum % 30) / 100, // Between 65% and 95%
      f1Score: 0.72 + (datasetIdSum % 23) / 100, // Between 72% and 95%
      churnRate,
      predictedChurnCount,
      totalCustomers: dataset.rowCount,
      userId: useAuthStore.getState().user?.uid,
      fileUrl: dataset.fileUri
    };
    
    // Generate customer segments
    const segmentCount = 4; // Fixed at 4 segments for simplicity
    const segments: CustomerSegment[] = [];
    const segmentNames = [
      'High-Value Loyalists',
      'At-Risk Big Spenders',
      'Occasional Buyers',
      'New Enthusiasts'
    ];
    const segmentColors = ['#4A6FFF', '#FF6B6B', '#FFC107', '#4CAF50'];
    
    // Distribute customers among segments
    let remainingCustomers = dataset.rowCount;
    
    for (let i = 0; i < segmentCount; i++) {
      const isLast = i === segmentCount - 1;
      const segmentSize = isLast 
        ? remainingCustomers 
        : Math.round(dataset.rowCount * (0.15 + (Math.sin(datasetIdSum + i) * 0.1 + 0.1)));
      
      remainingCustomers -= segmentSize;
      
      const percentage = (segmentSize / dataset.rowCount) * 100;
      
      segments.push({
        id: `seg-${i}-${Date.now()}`,
        name: segmentNames[i],
        size: segmentSize,
        percentage: parseFloat(percentage.toFixed(1)),
        avgLtv: 100 + (i === 0 ? 850 : i === 1 ? 720 : i === 2 ? 220 : 80),
        avgEngagement: i === 0 ? 0.89 : i === 1 ? 0.45 : i === 2 ? 0.38 : 0.76,
        churnRisk: i === 0 ? 0.05 : i === 1 ? 0.72 : i === 2 ? 0.28 : 0.12,
        color: segmentColors[i],
      });
    }
    
    // Store the results in Firebase
    const { user } = useAuthStore.getState();
    if (user) {
      try {
        // Step 3: Store prediction result and get prediction_id
        const result = await storeDatasetResult(
          user.uid,
          dataset.id,
          dataset.fileUri || '',
          churnPrediction,
          segments
        );
        
        if (result.success && result.predictionId) {
          // Update the churnPrediction with the predictionId from Firebase
          churnPrediction.id = result.predictionId;
          
          // Step 4: Ensure dataset is updated with prediction_id
          // This is handled in storeDatasetResult, but we double-check here
          if (result.error && result.error.includes("failed to update dataset")) {
            console.log("Attempting to update dataset with prediction ID again...");
            await updateDatasetWithPrediction(dataset.id, result.predictionId);
          }
        }
        
        console.log('Simulated dataset results stored successfully');
      } catch (error) {
        console.error('Error storing simulated dataset results:', error);
      }
    }
    
    return {
      churnPrediction,
      customerSegments: segments,
    };
  } catch (error) {
    console.error('Error in simulated processing:', error);
    
    // Provide fallback data in case of any error
    const fallbackChurnPrediction: ChurnPrediction = {
      id: `pred-fallback-${Date.now()}`,
      datasetId: dataset.id,
      createdAt: new Date().toISOString(),
      accuracy: 0.85,
      precision: 0.83,
      recall: 0.79,
      f1Score: 0.81,
      churnRate: 0.15,
      predictedChurnCount: Math.round(dataset.rowCount * 0.15),
      totalCustomers: dataset.rowCount,
      userId: useAuthStore.getState().user?.uid,
      fileUrl: dataset.fileUri
    };
    
    const fallbackSegments: CustomerSegment[] = [
      {
        id: `seg-fallback-0-${Date.now()}`,
        name: 'High-Value Loyalists',
        size: Math.round(dataset.rowCount * 0.3),
        percentage: 30,
        avgLtv: 950,
        avgEngagement: 0.89,
        churnRisk: 0.05,
        color: '#4A6FFF',
      },
      {
        id: `seg-fallback-1-${Date.now()}`,
        name: 'At-Risk Big Spenders',
        size: Math.round(dataset.rowCount * 0.25),
        percentage: 25,
        avgLtv: 720,
        avgEngagement: 0.45,
        churnRisk: 0.72,
        color: '#FF6B6B',
      },
      {
        id: `seg-fallback-2-${Date.now()}`,
        name: 'Occasional Buyers',
        size: Math.round(dataset.rowCount * 0.25),
        percentage: 25,
        avgLtv: 220,
        avgEngagement: 0.38,
        churnRisk: 0.28,
        color: '#FFC107',
      },
      {
        id: `seg-fallback-3-${Date.now()}`,
        name: 'New Enthusiasts',
        size: Math.round(dataset.rowCount * 0.2),
        percentage: 20,
        avgLtv: 180,
        avgEngagement: 0.76,
        churnRisk: 0.12,
        color: '#4CAF50',
      }
    ];
    
    return {
      churnPrediction: fallbackChurnPrediction,
      customerSegments: fallbackSegments,
    };
  }
};

/**
 * Simulates generating campaign suggestions
 */
const simulateGenerateCampaigns = async (
  segments: CustomerSegment[]
): Promise<CampaignSuggestion[]> => {
  // Simulate API call delay
  await simulateApiDelay(2000);
  
  try {
    const campaignTemplates = [
      {
        segmentIndex: 0, // High-Value Loyalists
        title: 'Loyalty Rewards Program',
        description: 'Introduce a tiered rewards program for High-Value Loyalists to increase retention and purchase frequency',
        expectedImpact: 0.15,
        difficulty: 'medium' as const,
        channels: ['email', 'push'] as Array<'email' | 'sms' | 'push' | 'social'>,
        subject: "Thanks for being a power user 💪",
        body: "You're in our top 10%! Here's an exclusive tip to boost your experience...",
        cta: "Learn More"
      },
      {
        segmentIndex: 1, // At-Risk Big Spenders
        title: 'Win-Back Discount Campaign',
        description: 'Offer a limited-time 20% discount to At-Risk Big Spenders to prevent churn and re-engage',
        expectedImpact: 0.32,
        difficulty: 'easy' as const,
        channels: ['email', 'sms'] as Array<'email' | 'sms' | 'push' | 'social'>,
        subject: "Don't Miss Out! Here's 20% Just for You",
        body: "We noticed you've been inactive. Come back and enjoy 20% off on your next visit!",
        cta: "Claim Offer"
      },
      {
        segmentIndex: 2, // Occasional Buyers
        title: 'Seasonal Engagement Campaign',
        description: 'Develop a seasonal campaign to re-engage Occasional Buyers with personalized product recommendations',
        expectedImpact: 0.22,
        difficulty: 'hard' as const,
        channels: ['email', 'social'] as Array<'email' | 'sms' | 'push' | 'social'>,
        subject: "We miss you! Come back and see what's new",
        body: "It's been a while since your last purchase. We've added new products we think you'll love!",
        cta: "Shop Now"
      },
      {
        segmentIndex: 3, // New Enthusiasts
        title: 'Product Education Series',
        description: 'Create a series of educational content for New Enthusiasts to showcase product value and features',
        expectedImpact: 0.18,
        difficulty: 'medium' as const,
        channels: ['email', 'push'] as Array<'email' | 'sms' | 'push' | 'social'>,
        subject: "Welcome to the family! Here's a special gift",
        body: "Thank you for joining us! To help you get started, here's a special welcome discount on your next purchase.",
        cta: "Get Started"
      },
    ];
    
    // Generate campaign suggestions based on segments
    const suggestions: CampaignSuggestion[] = campaignTemplates.map((template, index) => {
      const targetSegment = segments[template.segmentIndex] || segments[0];
      
      return {
        id: `camp-${index}-${Date.now()}`,
        title: template.title,
        description: template.description,
        targetSegment: targetSegment.name,
        expectedImpact: template.expectedImpact,
        difficulty: template.difficulty,
        channels: [...template.channels], // Create a new array to avoid readonly issues
        createdAt: new Date().toISOString(),
        segment: template.segmentIndex,
        subject: template.subject,
        body: template.body,
        cta: template.cta
      };
    });
    
    return suggestions;
  } catch (error) {
    console.error('Error in simulated campaign generation:', error);
    
    // Provide fallback campaigns in case of any error
    return [
      {
        id: `camp-fallback-0-${Date.now()}`,
        title: 'Loyalty Rewards Program',
        description: 'Introduce a tiered rewards program to increase retention and purchase frequency',
        targetSegment: 'High-Value Loyalists',
        expectedImpact: 0.15,
        difficulty: 'medium',
        channels: ['email', 'push'],
        createdAt: new Date().toISOString(),
        segment: 0,
        subject: "Thanks for being a power user 💪",
        body: "You're in our top 10%! Here's an exclusive tip to boost your experience...",
        cta: "Learn More"
      },
      {
        id: `camp-fallback-1-${Date.now()}`,
        title: 'Win-Back Discount Campaign',
        description: 'Offer a limited-time 20% discount to prevent churn and re-engage',
        targetSegment: 'At-Risk Big Spenders',
        expectedImpact: 0.32,
        difficulty: 'easy',
        channels: ['email', 'sms'],
        createdAt: new Date().toISOString(),
        segment: 1,
        subject: "Don't Miss Out! Here's 20% Just for You",
        body: "We noticed you've been inactive. Come back and enjoy 20% off on your next visit!",
        cta: "Claim Offer"
      }
    ];
  }
};

// Import useAppStore at the end to avoid circular dependency issues
import { useAppStore } from '@/store/app-store';