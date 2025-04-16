import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import { 
  auth, 
  loginWithEmail, 
  registerWithEmail, 
  signInWithGoogle, 
  logoutUser,
  getUserProfile,
  createUserDocumentIfNotExists,
  isDemoMode
} from '@/services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

interface AuthState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  userProfile: {
    id: string;
    name: string;
    email: string;
    company: string;
    plan: 'free' | 'pro' | 'enterprise';
    photoURL?: string;
  } | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<AuthState['userProfile']>) => Promise<boolean>;
  clearError: () => void;
  
  // Initialize auth from Firebase
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      userProfile: null,
      isLoading: false,
      error: null,
      
      initializeAuth: () => {
        // Check if auth is available (might not be if Firebase failed to initialize)
        if (isDemoMode || !auth) {
          console.log('Firebase Auth not initialized, using demo mode');
          
          // For demo purposes, automatically set a demo user
          set({
            user: {
              uid: 'demo-user-id',
              email: 'demo@example.com',
              displayName: 'Demo User',
            } as User,
            isAuthenticated: true,
            userProfile: {
              id: 'demo-user-id',
              name: 'Demo User',
              email: 'demo@example.com',
              company: 'Demo Company',
              plan: 'pro',
            }
          });
          return;
        }
        
        // Listen for auth state changes
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (user) {
            // User is signed in
            try {
              // Ensure user document exists
              await createUserDocumentIfNotExists(user);
              
              // Get user profile from Firestore
              const profileResult = await getUserProfile(user.uid);
              
              if (profileResult.success && profileResult.data) {
                const userData = profileResult.data;
                set({
                  user,
                  isAuthenticated: true,
                  userProfile: {
                    id: user.uid,
                    name: userData.displayName || user.displayName || 'User',
                    email: userData.email || user.email || '',
                    company: userData.company || 'Not set',
                    plan: (userData.plan as 'free' | 'pro' | 'enterprise') || 'free',
                    photoURL: userData.photoURL || user.photoURL || undefined,
                  },
                });
              } else {
                // If we can't get the profile, still authenticate with basic info
                set({
                  user,
                  isAuthenticated: true,
                  userProfile: {
                    id: user.uid,
                    name: user.displayName || 'User',
                    email: user.email || '',
                    company: 'Not set',
                    plan: 'free',
                    photoURL: user.photoURL || undefined,
                  },
                });
              }
            } catch (error) {
              console.error('Error initializing auth:', error);
              set({ error: 'Failed to initialize user profile' });
            }
          } else {
            // User is signed out
            set({
              user: null,
              isAuthenticated: false,
              userProfile: null,
            });
          }
        });
        
        // Clean up subscription on unmount
        return () => unsubscribe();
      },
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Special case for demo login
          if (email === "demo@example.com" && password === "password123") {
            // Create a mock user profile for demo purposes
            set({
              isLoading: false,
              isAuthenticated: true,
              user: {
                uid: 'demo-user-id',
                email: 'demo@example.com',
                displayName: 'Demo User',
              } as User,
              userProfile: {
                id: 'demo-user-id',
                name: 'Demo User',
                email: 'demo@example.com',
                company: 'Demo Company',
                plan: 'pro',
              }
            });
            return true;
          }
          
          // Special case for admin login
          if (email === "admin@example.com" && password === "admin123") {
            // Create a mock admin user profile
            set({
              isLoading: false,
              isAuthenticated: true,
              user: {
                uid: 'admin-user-id',
                email: 'admin@example.com',
                displayName: 'Admin User',
              } as User,
              userProfile: {
                id: 'admin-user-id',
                name: 'Admin User',
                email: 'admin@example.com',
                company: 'MarketMind',
                plan: 'enterprise',
              }
            });
            return true;
          }
          
          const result = await loginWithEmail(email, password);
          
          if (result.success && result.user) {
            // For demo mode, manually set the user
            if (isDemoMode || result.user.uid === 'demo-user-id') {
              set({
                isLoading: false,
                isAuthenticated: true,
                user: result.user,
                userProfile: {
                  id: result.user.uid,
                  name: result.user.displayName || 'Demo User',
                  email: result.user.email || 'demo@example.com',
                  company: 'Demo Company',
                  plan: 'pro',
                }
              });
            } else {
              // Auth state listener will handle setting the user
              set({ isLoading: false });
            }
            return true;
          } else {
            set({ isLoading: false, error: result.error || 'Login failed' });
            return false;
          }
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          return false;
        }
      },
      
      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await registerWithEmail(email, password, name);
          
          if (result.success && result.user) {
            // For demo mode, manually set the user
            if (isDemoMode || result.user.uid === 'demo-user-id') {
              set({
                isLoading: false,
                isAuthenticated: true,
                user: result.user,
                userProfile: {
                  id: result.user.uid,
                  name: name || result.user.displayName || 'New User',
                  email: result.user.email || email,
                  company: 'Not set',
                  plan: 'free',
                }
              });
            } else {
              // Auth state listener will handle setting the user
              set({ isLoading: false });
            }
            return true;
          } else {
            set({ isLoading: false, error: result.error || 'Registration failed' });
            return false;
          }
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          return false;
        }
      },
      
      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await signInWithGoogle();
          
          if (result.success && result.user) {
            // For demo mode, manually set the user
            if (isDemoMode || result.user.uid === 'demo-user-id') {
              set({
                isLoading: false,
                isAuthenticated: true,
                user: result.user,
                userProfile: {
                  id: result.user.uid,
                  name: result.user.displayName || 'Demo Google User',
                  email: result.user.email || 'demo.google@example.com',
                  company: 'Demo Company',
                  plan: 'pro',
                }
              });
            } else {
              // Auth state listener will handle setting the user
              set({ isLoading: false });
            }
            return true;
          } else {
            // Handle the error property if it exists
            const errorMessage = result.error ? String(result.error) : 'Google login failed';
            set({ isLoading: false, error: errorMessage });
            return false;
          }
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          return false;
        }
      },
      
      logout: async () => {
        set({ isLoading: true, error: null });
        
        try {
          await logoutUser();
          // Manually clear the user state for demo mode
          set({
            user: null,
            isAuthenticated: false,
            userProfile: null,
            isLoading: false
          });
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
        }
      },
      
      updateUserProfile: async (data) => {
        const { user, userProfile } = get();
        
        if (!user || !userProfile) {
          set({ error: 'No authenticated user' });
          return false;
        }
        
        try {
          // For demo purposes, just update the local state
          if (isDemoMode || user.uid === 'demo-user-id') {
            set({
              userProfile: {
                ...userProfile,
                ...data,
              }
            });
            return true;
          }
          
          // In a real app, update user profile in Firestore
          if (!db) {
            console.log("Firestore not initialized, only updating local state");
            set({
              userProfile: {
                ...userProfile,
                ...data,
              }
            });
            return true;
          }
          
          const userRef = doc(db, 'users', user.uid);
          
          // Only process data if it's not null
          if (data) {
            const cleanData: Record<string, any> = {};
            
            // Safely iterate over the data object
            Object.entries(data as Record<string, any>).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                cleanData[key] = value;
              }
            });
            
            await updateDoc(userRef, cleanData);
          }
          
          // Update local state
          set({
            userProfile: {
              ...userProfile,
              ...data,
            },
          });
          
          return true;
        } catch (error: any) {
          set({ error: error.message });
          return false;
        }
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'marketmind-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Don't persist sensitive data or loading states
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);