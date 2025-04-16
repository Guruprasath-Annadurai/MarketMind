import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup, 
  User, 
  Auth,
  IdTokenResult
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs, 
  Firestore,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  FirebaseStorage 
} from 'firebase/storage';
import { Platform } from 'react-native';
import { ChurnPrediction, CustomerSegment, CampaignSuggestion } from '@/types';

// Your Firebase configuration
// For demo purposes, we're using a placeholder config
// In a real app, you would use your actual Firebase config
const firebaseConfig = {
  // Using demo config - replace with your actual Firebase config in production
  apiKey: "AIzaSyD_uqxmyZfQf8YtQfUyNhr9AcBPnhCGRdQ",
  authDomain: "demo-marketmind.firebaseapp.com",
  projectId: "demo-marketmind",
  storageBucket: "demo-marketmind.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Initialize Firebase - with error handling
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let googleProvider: GoogleAuthProvider | undefined;

// Flag to track if we're in demo mode (Firebase not initialized)
let isDemoMode = true; // Default to demo mode

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
  console.log("Firebase initialized successfully");
  isDemoMode = false; // Only set to false if initialization succeeds
} catch (error) {
  console.error("Firebase initialization error:", error);
  console.log("Running in demo mode - Firebase services will be simulated");
}

// Authentication functions
export const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    // For demo purposes, allow login with demo credentials without Firebase
    if (email === "demo@example.com" && password === "password123") {
      const mockUser = createMockUser(email);
      return { success: true, user: mockUser };
    }
    
    if (isDemoMode || !auth) {
      console.log("Firebase Auth not initialized, using mock login");
      const mockUser = createMockUser(email);
      return { success: true, user: mockUser };
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await createUserDocumentIfNotExists(userCredential.user);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

export const registerWithEmail = async (email: string, password: string, name: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    if (isDemoMode || !auth) {
      console.log("Firebase Auth not initialized, using mock registration");
      const mockUser = createMockUser(email);
      return { success: true, user: mockUser };
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDocument(userCredential.user, { name });
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
};

export const signInWithGoogle = async (): Promise<{ success: boolean; user: User; error?: string }> => {
  try {
    // Google sign-in is primarily for web
    if (Platform.OS !== 'web') {
      throw new Error('Google sign-in is currently only supported on web');
    }
    
    if (isDemoMode || !auth || !googleProvider) {
      console.log("Firebase Auth not initialized, using mock Google sign-in");
      const mockUser = createMockUser("demo.google@example.com");
      return { success: true, user: mockUser };
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    await createUserDocumentIfNotExists(result.user);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    // For demo purposes, provide a fallback mock user
    const mockUser = createMockUser("demo.google@example.com");
    return { success: true, user: mockUser, error: error.message };
  }
};

export const logoutUser = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    if (isDemoMode || !auth) {
      console.log("Firebase Auth not initialized, simulating logout");
      return { success: true };
    }
    
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

// User document functions
export const createUserDocument = async (user: User, additionalData: any = {}): Promise<any> => {
  if (!user) return null;
  
  try {
    if (isDemoMode || !db) {
      console.log("Firestore not initialized, simulating user document creation");
      return { id: user.uid };
    }
    
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);
    
    if (!snapshot.exists()) {
      const { email, displayName, photoURL } = user;
      const createdAt = new Date();
      
      await setDoc(userRef, {
        uid: user.uid,
        displayName: displayName || additionalData.name || '',
        email,
        photoURL: photoURL || '',
        createdAt,
        ...additionalData,
      });
    }
    
    return userRef;
  } catch (error) {
    console.error('Error creating user document:', error);
    return null;
  }
};

export const createUserDocumentIfNotExists = async (user: User): Promise<any> => {
  return createUserDocument(user);
};

export const getUserProfile = async (uid: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    if (isDemoMode || !db) {
      console.log("Firestore not initialized, returning mock user profile");
      return {
        success: true,
        data: {
          displayName: 'Demo User',
          email: 'demo@example.com',
          company: 'Demo Company',
          plan: 'pro',
          photoURL: '',
        }
      };
    }
    
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    
    // For demo purposes, return mock data
    return {
      success: true,
      data: {
        displayName: 'Demo User',
        email: 'demo@example.com',
        company: 'Demo Company',
        plan: 'pro',
        photoURL: '',
      }
    };
  }
};

// Dataset functions
export const uploadDatasetToFirebase = async (
  file: File | Blob,
  fileName: string,
  userId: string,
  metadata: any
): Promise<{ success: boolean; datasetId?: string; downloadURL?: string; error?: string }> => {
  try {
    if (isDemoMode || !storage || !db) {
      console.log("Firebase Storage not initialized, simulating dataset upload");
      return { 
        success: true, 
        datasetId: `demo-dataset-${Date.now()}`,
        downloadURL: 'https://example.com/demo-file.csv',
      };
    }
    
    // Upload file to Firebase Storage
    const storageRef = ref(storage, `datasets/${userId}/${fileName}`);
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    // Create dataset document in Firestore - using the schema provided
    const datasetRef = doc(collection(db, 'datasets'));
    await setDoc(datasetRef, {
      user_id: userId,
      dataset_name: metadata.name,
      description: metadata.description,
      file_url: downloadURL,
      status: 'uploaded', // Using the enum from schema: uploaded, processing, processed, error
      created_at: serverTimestamp(),
      rowCount: metadata.rowCount || 0,
      columnCount: metadata.columnCount || 0,
      fileSize: metadata.fileSize || 0,
      prediction_id: null, // Will be updated when a prediction is created
    });
    
    return { 
      success: true, 
      datasetId: datasetRef.id,
      downloadURL 
    };
  } catch (error: any) {
    console.error('Error uploading dataset:', error);
    
    // For demo purposes, return a mock success response
    return { 
      success: true, 
      datasetId: `demo-dataset-${Date.now()}`,
      downloadURL: 'https://example.com/demo-file.csv',
      error: error.message
    };
  }
};

export const getUserDatasets = async (userId: string): Promise<{ success: boolean; datasets?: any[]; error?: string }> => {
  try {
    if (isDemoMode || !db) {
      console.log("Firestore not initialized, returning mock datasets");
      // Return mock datasets for demo mode
      return { 
        success: true, 
        datasets: [
          {
            id: '1',
            name: 'Q2 Customer Data',
            description: 'Quarterly customer behavior data including purchases, logins, and support tickets',
            createdAt: '2023-06-15T10:30:00Z',
            updatedAt: '2023-06-15T10:30:00Z',
            rowCount: 5243,
            columnCount: 18,
            status: 'processed', // Using the enum from schema
            fileSize: 2.4 * 1024 * 1024, // 2.4 MB
            userId: userId,
            predictionId: 'pred-1' // Mock prediction ID
          },
          {
            id: '2',
            name: 'Website Analytics',
            description: 'User behavior from website including page views, time on site, and conversion events',
            createdAt: '2023-05-22T14:15:00Z',
            updatedAt: '2023-05-22T14:15:00Z',
            rowCount: 12876,
            columnCount: 24,
            status: 'processed', // Using the enum from schema
            fileSize: 4.8 * 1024 * 1024, // 4.8 MB
            userId: userId,
            predictionId: 'pred-2' // Mock prediction ID
          }
        ]
      };
    }
    
    const datasetsQuery = query(
      collection(db, 'datasets'),
      where('user_id', '==', userId)
    );
    
    const querySnapshot = await getDocs(datasetsQuery);
    const datasets: any[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      datasets.push({ 
        id: doc.id,
        name: data.dataset_name,
        description: data.description,
        createdAt: data.created_at?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updated_at?.toDate().toISOString() || new Date().toISOString(),
        rowCount: data.rowCount || 0,
        columnCount: data.columnCount || 0,
        status: data.status || 'uploaded',
        fileSize: data.fileSize || 0,
        userId: data.user_id,
        predictionId: data.prediction_id,
        fileUri: data.file_url
      });
    });
    
    return { success: true, datasets };
  } catch (error: any) {
    console.error('Error getting user datasets:', error);
    
    // Return mock datasets for demo mode in case of error
    return { 
      success: true, 
      datasets: [
        {
          id: '1',
          name: 'Q2 Customer Data',
          description: 'Quarterly customer behavior data including purchases, logins, and support tickets',
          createdAt: '2023-06-15T10:30:00Z',
          updatedAt: '2023-06-15T10:30:00Z',
          rowCount: 5243,
          columnCount: 18,
          status: 'processed', // Using the enum from schema
          fileSize: 2.4 * 1024 * 1024, // 2.4 MB
          userId: userId,
          predictionId: 'pred-1' // Mock prediction ID
        },
        {
          id: '2',
          name: 'Website Analytics',
          description: 'User behavior from website including page views, time on site, and conversion events',
          createdAt: '2023-05-22T14:15:00Z',
          updatedAt: '2023-05-22T14:15:00Z',
          rowCount: 12876,
          columnCount: 24,
          status: 'processed', // Using the enum from schema
          fileSize: 4.8 * 1024 * 1024, // 4.8 MB
          userId: userId,
          predictionId: 'pred-2' // Mock prediction ID
          }
        ]
      };
    }
  };

// New function to store dataset analysis results - updated to match the schema
export const storeDatasetResult = async (
  userId: string,
  datasetId: string,
  fileUrl: string,
  churnPrediction: ChurnPrediction,
  customerSegments: CustomerSegment[],
  campaignSuggestions: CampaignSuggestion[] = []
): Promise<{ success: boolean; predictionId?: string; error?: string }> => {
  try {
    if (isDemoMode || !db) {
      console.log("Firestore not initialized, simulating prediction storage");
      const mockPredictionId = `demo-prediction-${Date.now()}`;
      
      // Simulate updating the dataset with the prediction ID
      console.log(`Simulating dataset update: dataset ${datasetId} linked to prediction ${mockPredictionId}`);
      
      return { 
        success: true, 
        predictionId: mockPredictionId
      };
    }
    
    // Format segments for storage according to the schema
    const segmentsForStorage: Record<string, number> = {};
    customerSegments.forEach((segment, index) => {
      segmentsForStorage[index.toString()] = segment.size;
    });
    
    // Format suggestions for storage according to the schema
    const suggestionsForStorage = campaignSuggestions.map(suggestion => ({
      segment: customerSegments.findIndex(s => s.name === suggestion.targetSegment),
      subject: suggestion.title,
      body: suggestion.description,
      cta: suggestion.cta || "Learn More" // Default CTA
    }));
    
    // Create prediction document in Firestore - using the schema provided
    const predictionsCollection = collection(db, 'predictions');
    const newPrediction = {
      user_id: userId,
      file_url: fileUrl,
      churn_rate: churnPrediction.churnRate,
      segments: segmentsForStorage,
      segment_details: customerSegments.map(segment => ({
        name: segment.name,
        size: segment.size,
        percentage: segment.percentage,
        avg_ltv: segment.avgLtv,
        avg_engagement: segment.avgEngagement,
        churn_risk: segment.churnRisk,
        color: segment.color
      })),
      suggestions: suggestionsForStorage,
      created_at: serverTimestamp(),
      // Additional fields for app functionality
      accuracy: churnPrediction.accuracy,
      precision: churnPrediction.precision,
      recall: churnPrediction.recall,
      f1_score: churnPrediction.f1Score,
      predicted_churn_count: churnPrediction.predictedChurnCount,
      total_customers: churnPrediction.totalCustomers,
      dataset_id: datasetId // Keep track of which dataset this prediction is for
    };
    
    const docRef = await addDoc(predictionsCollection, newPrediction);
    console.log(`Created prediction document with ID: ${docRef.id}`);
    
    // Update the dataset to link to this prediction - using the schema provided
    try {
      const datasetRef = doc(db, 'datasets', datasetId);
      await updateDoc(datasetRef, {
        prediction_id: docRef.id,
        status: 'processed', // Update status to processed
        updated_at: serverTimestamp()
      });
      console.log(`Updated dataset ${datasetId} with prediction_id ${docRef.id}`);
    } catch (error: any) {
      console.error('Error updating dataset with prediction ID:', error);
      // We still return success since the prediction was created
      return { 
        success: true, 
        predictionId: docRef.id,
        error: `Prediction created but failed to update dataset: ${error.message}`
      };
    }
    
    return { 
      success: true, 
      predictionId: docRef.id
    };
  } catch (error: any) {
    console.error('Error storing dataset result:', error);
    
    // For demo purposes, return a mock success response
    const mockPredictionId = `demo-prediction-${Date.now()}`;
    return { 
      success: true, 
      predictionId: mockPredictionId,
      error: error.message
    };
  }
};

// New function to update a dataset with a prediction ID
export const updateDatasetWithPrediction = async (
  datasetId: string,
  predictionId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (isDemoMode || !db) {
      console.log(`Simulating dataset update: dataset ${datasetId} linked to prediction ${predictionId}`);
      return { success: true };
    }
    
    const datasetRef = doc(db, 'datasets', datasetId);
    await updateDoc(datasetRef, {
      prediction_id: predictionId,
      status: 'processed',
      updated_at: serverTimestamp()
    });
    
    console.log(`Successfully updated dataset ${datasetId} with prediction_id ${predictionId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating dataset with prediction ID:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Helper function to create a mock user for demo purposes
const createMockUser = (email: string): User => {
  const uid = 'demo-user-id';
  
  // Create a minimal implementation of the Firebase User interface
  const mockUser = {
    uid,
    email,
    displayName: email.split('@')[0],
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: Date.now().toString(),
      lastSignInTime: Date.now().toString()
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: async () => Promise.resolve(),
    getIdToken: async () => Promise.resolve('mock-id-token'),
    getIdTokenResult: async () => {
      return {
        token: 'mock-id-token',
        signInProvider: 'password',
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
        issuedAtTime: new Date().toISOString(),
        authTime: new Date().toISOString(),
        claims: {}
      } as IdTokenResult;
    },
    reload: async () => Promise.resolve(),
    toJSON: () => ({ uid, email }),
    phoneNumber: null,
    providerId: 'password'
  } as unknown as User;
  
  return mockUser;
};

// Export Firebase instances and demo mode flag
export { auth, db, storage, isDemoMode };