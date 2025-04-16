import { useColorScheme } from 'react-native';
import { colors, darkColors, shadows, darkShadows } from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';

export function useAppTheme() {
  const { themeMode } = useThemeStore();
  const systemColorScheme = useColorScheme();
  
  // Determine if we should use dark mode
  const isDarkMode = 
    themeMode === 'dark' || 
    (themeMode === 'system' && systemColorScheme === 'dark');
  
  // Return the appropriate theme colors and shadows
  return {
    colors: isDarkMode ? darkColors : colors,
    shadows: isDarkMode ? darkShadows : shadows,
    isDarkMode,
  };
}