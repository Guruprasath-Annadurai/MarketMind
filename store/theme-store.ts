import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  // Theme state
  themeMode: ThemeMode;
  
  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  
  // Computed
  isDarkMode: () => boolean;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Initial state
      themeMode: 'system',
      
      // Actions
      setThemeMode: (mode: ThemeMode) => {
        set({ themeMode: mode });
      },
      
      // Computed
      isDarkMode: () => {
        const { themeMode } = get();
        const systemColorScheme = useColorScheme();
        
        if (themeMode === 'system') {
          return systemColorScheme === 'dark';
        }
        
        return themeMode === 'dark';
      },
    }),
    {
      name: 'marketmind-theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);