import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dataset, ChurnPrediction, CustomerSegment, CampaignSuggestion } from '@/types';
import { mockDatasets } from '@/mocks/data';
import { processDataset, generateCampaigns } from '@/services/ml-api';
import { 
  getUserDatasets, 
  uploadDatasetToFirebase,
  storeDatasetResult,
  updateDatasetWithPrediction,
  isDemoMode
} from '@/services/firebase';
import { useAuthStore } from './auth-store';

interface AppState {
  // Data state
  datasets: Dataset[];
  selectedDatasetId: string | null;
  
  // Analysis state
  churnPrediction: ChurnPrediction | null;
  customerSegments: CustomerSegment[];
  campaignSuggestions: CampaignSuggestion[];
  
  // UI state
  isLoading: boolean;
  activeTab: string;
  error: string | null;
  
  // Actions
  selectDataset: (datasetId: string) => void;
  uploadDataset: (name: string, description: string, fileSize: number, fileUri?: string, file?: File | Blob) => Promise<Dataset>;
  deleteDataset: (datasetId: string) => void;
  runAnalysis: (datasetId: string) => Promise<void>;
  generateCampaigns: () => Promise<void>;
  setActiveTab: (tab: string) => void;
  exportCampaign: (campaignId: string) => Promise<boolean>;
  fetchUserDatasets: () => Promise<void>;
  clearError: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      datasets: [],
      selectedDatasetId: null,
      churnPrediction: null,
      customerSegments: [],
      campaignSuggestions: [],
      isLoading: false,
      activeTab: 'dashboard',
      error: null,
      
      // Actions
      selectDataset: (datasetId: string) => {
        set({ selectedDatasetId: datasetId });
      },
      
      // This implements the "Store Dataset" step in the flow diagram
      uploadDataset: async (name: string, description: string, fileSize: number, fileUri?: string, file?: File | Blob) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user } = useAuthStore.getState();
          
          if (!user) {
            throw new Error('User not authenticated');
          }
          
          let newDataset: Dataset;
          
          // If we have a file, upload to Firebase
          if (file) {
            const fileName = `${Date.now()}-${name.replace(/\s+/g, '-').toLowerCase()}.csv`;
            
            // Step 1: Create dataset metadata and get dataset ID
            const uploadResult = await uploadDatasetToFirebase(
              file,
              fileName,
              user.uid,
              {
                name,
                description,
                fileSize,
                rowCount: Math.floor(Math.random() * 10000) + 1000, // Placeholder
                columnCount: Math.floor(Math.random() * 20) + 5, // Placeholder
              }
            );
            
            if (!uploadResult.success) {
              throw new Error(uploadResult.error || 'Upload failed');
            }
            
            newDataset = {
              id: uploadResult.datasetId || Date.now().toString(), // Fallback ID if datasetId is undefined
              name,
              description,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              rowCount: Math.floor(Math.random() * 10000) + 1000,
              columnCount: Math.floor(Math.random() * 20) + 5,
              status: 'uploaded', // Updated to match schema enum
              fileSize,
              fileUri: uploadResult.downloadURL || '',
              userId: user.uid, // Link to the user
            };
          } else {
            // Create a mock dataset for demo purposes
            newDataset = {
              id: Date.now().toString(),
              name,
              description,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              rowCount: Math.floor(Math.random() * 10000) + 1000,
              columnCount: Math.floor(Math.random() * 20) + 5,
              status: 'uploaded', // Updated to match schema enum
              fileSize,
              fileUri: fileUri || '',
              userId: user.uid, // Link to the user
            };
          }
          
          set(state => ({
            datasets: [...state.datasets, newDataset],
            selectedDatasetId: newDataset.id, // Auto-select the new dataset
            isLoading: false,
          }));
          
          // Simulate processing completion after 3 seconds
          setTimeout(() => {
            set(state => ({
              datasets: state.datasets.map(d => 
                d.id === newDataset.id ? { ...d, status: 'processed' } : d
              ),
            }));
          }, 3000);
          
          return newDataset;
        } catch (error: any) {
          console.error('Upload error:', error);
          set({ 
            isLoading: false,
            error: error.message || 'Failed to upload dataset'
          });
          throw error;
        }
      },
      
      deleteDataset: (datasetId: string) => {
        set(state => ({
          datasets: state.datasets.filter(d => d.id !== datasetId),
          selectedDatasetId: state.selectedDatasetId === datasetId ? null : state.selectedDatasetId,
          // If we delete a dataset that has analysis results, clear those too
          churnPrediction: state.churnPrediction?.datasetId === datasetId ? null : state.churnPrediction,
          customerSegments: state.churnPrediction?.datasetId === datasetId ? [] : state.customerSegments,
          campaignSuggestions: state.churnPrediction?.datasetId === datasetId ? [] : state.campaignSuggestions,
        }));
      },
      
      // This implements the "Apply ML Models" and "PredictWithMLAPI" steps in the flow diagram
      runAnalysis: async (datasetId: string) => {
        set({ isLoading: true, error: null });
        
        // Add a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          set({ 
            isLoading: false,
            error: 'Analysis timed out. Please try again.'
          });
        }, 30000); // 30 second timeout
        
        try {
          const dataset = get().datasets.find(d => d.id === datasetId);
          
          if (!dataset) {
            clearTimeout(timeoutId);
            throw new Error('Dataset not found');
          }
          
          if (dataset.status !== 'processed' && dataset.status !== 'uploaded') {
            clearTimeout(timeoutId);
            throw new Error('Dataset is still processing. Please wait until it is ready.');
          }
          
          // Update dataset status to processing
          set(state => ({
            datasets: state.datasets.map(d => 
              d.id === datasetId ? { ...d, status: 'processing' } : d
            ),
          }));
          
          // Step 2: Call our ML API service - This is the "PredictWithMLAPI" step in the flow diagram
          const { churnPrediction, customerSegments } = await processDataset(dataset);
          
          clearTimeout(timeoutId); // Clear the timeout on success
          
          // Step 4: Update dataset status to processed and link to prediction
          set(state => ({
            churnPrediction,
            customerSegments,
            isLoading: false,
            datasets: state.datasets.map(d => 
              d.id === datasetId ? { 
                ...d, 
                status: 'processed',
                predictionId: churnPrediction.id 
              } : d
            ),
          }));
          
          // Double-check that the dataset has been updated with the prediction ID
          const updatedDataset = get().datasets.find(d => d.id === datasetId);
          if (updatedDataset && (!updatedDataset.predictionId || updatedDataset.predictionId !== churnPrediction.id)) {
            console.log(`Dataset ${datasetId} not properly linked to prediction ${churnPrediction.id}, fixing...`);
            
            // Update the dataset with the prediction ID if it's not already set
            try {
              await updateDatasetWithPrediction(datasetId, churnPrediction.id);
              
              // Update local state to reflect the change
              set(state => ({
                datasets: state.datasets.map(d => 
                  d.id === datasetId ? { 
                    ...d, 
                    predictionId: churnPrediction.id 
                  } : d
                ),
              }));
              
              console.log(`Successfully linked dataset ${datasetId} to prediction ${churnPrediction.id}`);
            } catch (linkError) {
              console.error('Error linking dataset to prediction:', linkError);
              // Don't throw this error as we still want to show the results
            }
          }
          
          return;
          
        } catch (error: any) {
          clearTimeout(timeoutId); // Clear the timeout on error
          console.error('Analysis error:', error);
          
          // Update dataset status back to uploaded if there was an error
          set(state => ({
            isLoading: false,
            error: error.message || 'Failed to run analysis',
            datasets: state.datasets.map(d => 
              d.id === datasetId ? { ...d, status: 'error' } : d
            ),
          }));
          
          throw error;
        }
      },
      
      // This generates campaign suggestions based on the segments
      generateCampaigns: async () => {
        set({ isLoading: true, error: null });
        
        // Add a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          set({ 
            isLoading: false,
            error: 'Campaign generation timed out. Please try again.'
          });
        }, 20000); // 20 second timeout
        
        try {
          const { customerSegments, churnPrediction } = get();
          
          if (!customerSegments.length) {
            clearTimeout(timeoutId);
            throw new Error('No customer segments available');
          }
          
          if (!churnPrediction) {
            clearTimeout(timeoutId);
            throw new Error('No churn prediction available');
          }
          
          // Call our ML API service
          const suggestions = await generateCampaigns(customerSegments);
          
          clearTimeout(timeoutId); // Clear the timeout on success
          
          set({
            campaignSuggestions: suggestions,
            isLoading: false,
          });
          
          // Store the campaign suggestions in Firebase
          const { user } = useAuthStore.getState();
          if (user) {
            try {
              await storeDatasetResult(
                user.uid,
                churnPrediction.datasetId,
                churnPrediction.fileUrl || '', // We don't have the file URL here, but it's already stored
                churnPrediction,
                customerSegments,
                suggestions
              );
              console.log('Campaign suggestions stored successfully after generation');
            } catch (storeError) {
              console.error('Error storing campaign suggestions after generation:', storeError);
              // Don't throw this error as we still want to show the suggestions
            }
          }
          
        } catch (error: any) {
          clearTimeout(timeoutId); // Clear the timeout on error
          console.error('Campaign generation error:', error);
          set({ 
            isLoading: false,
            error: error.message || 'Failed to generate campaigns'
          });
          throw error;
        }
      },
      
      setActiveTab: (tab: string) => {
        set({ activeTab: tab });
      },
      
      exportCampaign: async (campaignId: string) => {
        set({ isLoading: true, error: null });
        
        // Add a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          set({ 
            isLoading: false,
            error: 'Export timed out. Please try again.'
          });
        }, 10000); // 10 second timeout
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          clearTimeout(timeoutId); // Clear the timeout on success
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          clearTimeout(timeoutId); // Clear the timeout on error
          console.error('Export error:', error);
          set({ 
            isLoading: false,
            error: error.message || 'Failed to export campaign'
          });
          return false;
        }
      },
      
      // Fetch datasets for the current user
      fetchUserDatasets: async () => {
        set({ isLoading: true, error: null });
        
        // Add a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          set({ 
            isLoading: false,
            error: 'Fetching datasets timed out. Please try again.'
          });
        }, 15000); // 15 second timeout
        
        try {
          const { user } = useAuthStore.getState();
          
          if (!user) {
            clearTimeout(timeoutId);
            // If no user, clear datasets
            set({ datasets: [], isLoading: false });
            return;
          }
          
          // Get datasets from Firebase
          const result = await getUserDatasets(user.uid);
          
          clearTimeout(timeoutId); // Clear the timeout on success
          
          if (result.success && result.datasets) {
            set({ 
              datasets: result.datasets,
              isLoading: false 
            });
          } else {
            // If error, use mock data for demo
            set({ 
              datasets: mockDatasets.map(dataset => ({
                ...dataset,
                userId: user.uid,
                status: 'processed' // Updated to match schema enum
              })),
              isLoading: false 
            });
          }
        } catch (error: any) {
          clearTimeout(timeoutId); // Clear the timeout on error
          console.error('Error fetching datasets:', error);
          
          // In case of error, use mock data
          const { user } = useAuthStore.getState();
          if (user) {
            set({ 
              datasets: mockDatasets.map(dataset => ({
                ...dataset,
                userId: user.uid,
                status: 'processed' // Updated to match schema enum
              })),
              isLoading: false,
              error: error.message || 'Failed to fetch datasets'
            });
          } else {
            set({ 
              isLoading: false,
              error: error.message || 'Failed to fetch datasets'
            });
          }
        }
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'marketmind-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedDatasetId: state.selectedDatasetId,
      }),
    }
  )
);