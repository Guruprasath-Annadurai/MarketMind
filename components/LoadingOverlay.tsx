import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  timeout?: number; // Timeout in milliseconds
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  timeout = 30000, // Default 30 second timeout
}) => {
  const { colors } = useAppTheme();
  const [showTimeout, setShowTimeout] = useState(false);
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (visible) {
      // Reset timeout message when overlay becomes visible
      setShowTimeout(false);
      
      // Set a timeout to show a message if loading takes too long
      timeoutId = setTimeout(() => {
        setShowTimeout(true);
      }, timeout);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [visible, timeout]);
  
  if (!visible) return null;
  
  return (
    <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message && (
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>
        )}
        
        {showTimeout && (
          <Text style={[styles.timeoutMessage, { color: colors.warning }]}>
            This is taking longer than expected. Please wait...
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 200,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  timeoutMessage: {
    marginTop: 12,
    fontSize: 12,
    textAlign: 'center',
  },
});