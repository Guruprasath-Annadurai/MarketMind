import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  Platform,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { BarChart2, PieChart, TrendingUp, RefreshCw } from 'lucide-react-native';
import { colors, shadows } from '@/constants/colors';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { useAppStore } from '@/store/app-store';
import { useAppTheme } from '@/hooks/useAppTheme';

// Power BI embed URL - replace with your actual embed URL in production
const POWER_BI_EMBED_URL = "https://app.powerbi.com/view?r=eyJrIjoiZGE2MWJlYWUtYmYzYi00MjUzLWI1YzAtZGRiNTZmMDcxZWYzIiwidCI6ImRiODQ5ZGM1LTBhYTAtNDQxYy1hYjEwLWVjYTY3MjA2OWMwYiIsImMiOjZ9";

export default function DashboardScreen() {
  const { datasets, churnPrediction, customerSegments } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [webViewError, setWebViewError] = useState<string | null>(null);
  const { colors, shadows } = useAppTheme();
  
  const hasData = datasets.length > 0;
  const hasAnalysis = churnPrediction !== null && customerSegments.length > 0;
  
  const handleWebViewLoad = () => {
    setIsLoading(false);
  };
  
  const handleWebViewError = () => {
    setIsLoading(false);
    setWebViewError("Failed to load Power BI dashboard. Please check your internet connection and try again.");
  };
  
  // Set a timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        setWebViewError("Dashboard loading timed out. Please try refreshing.");
      }, 15000); // 15 second timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading]);
  
  // Ensure WebView is only imported on native platforms
  const renderPowerBIDashboard = () => {
    if (Platform.OS === 'web') {
      // For web, use an iframe directly
      return (
        <View style={styles.webViewContainer}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading dashboard...</Text>
            </View>
          )}
          <Text style={styles.webMessage}>
            Power BI dashboard would be displayed here in a web environment.
          </Text>
        </View>
      );
    } else {
      // For native platforms, dynamically import WebView to avoid issues
      try {
        // Using require instead of import to avoid issues with web
        const WebView = require('react-native-webview').WebView;
        
        return (
          <View style={styles.webViewContainer}>
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading dashboard...</Text>
              </View>
            )}
            <WebView
              source={{ uri: POWER_BI_EMBED_URL }}
              style={styles.webView}
              onLoad={handleWebViewLoad}
              onError={handleWebViewError}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </View>
        );
      } catch (error) {
        console.error('Error loading WebView:', error);
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>WebView Error</Text>
            <Text style={styles.errorMessage}>
              Unable to load WebView component. Please ensure react-native-webview is installed.
            </Text>
          </View>
        );
      }
    }
  };
  
  const renderDashboardContent = () => {
    if (webViewError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Dashboard Error</Text>
          <Text style={styles.errorMessage}>{webViewError}</Text>
          <Button
            title="Retry"
            onPress={() => {
              setWebViewError(null);
              setIsLoading(true);
            }}
            variant="primary"
            icon={<RefreshCw size={16} color={colors.textLight} />}
            style={styles.retryButton}
          />
        </View>
      );
    }
    
    return (
      <>
        <View style={styles.dashboardHeader}>
          <Text style={styles.dashboardTitle}>Business Intelligence Dashboard</Text>
          <Text style={styles.dashboardDescription}>
            Interactive visualizations of your customer data, churn predictions, and segment analysis.
          </Text>
        </View>
        
        <View style={styles.metricsContainer}>
          <View style={[styles.metricCard, shadows.small]}>
            <View style={styles.metricIconContainer}>
              <BarChart2 size={24} color={colors.primary} />
            </View>
            <Text style={styles.metricTitle}>Churn Rate</Text>
            <Text style={styles.metricValue}>
              {churnPrediction ? `${(churnPrediction.churnRate * 100).toFixed(1)}%` : '--'}
            </Text>
            <Text style={styles.metricDescription}>
              Predicted customer churn rate
            </Text>
          </View>
          
          <View style={[styles.metricCard, shadows.small]}>
            <View style={[styles.metricIconContainer, { backgroundColor: colors.secondaryLight }]}>
              <PieChart size={24} color={colors.secondary} />
            </View>
            <Text style={styles.metricTitle}>Segments</Text>
            <Text style={styles.metricValue}>
              {customerSegments.length || '--'}
            </Text>
            <Text style={styles.metricDescription}>
              Customer segments identified
            </Text>
          </View>
          
          <View style={[styles.metricCard, shadows.small]}>
            <View style={[styles.metricIconContainer, { backgroundColor: colors.successLight }]}>
              <TrendingUp size={24} color={colors.success} />
            </View>
            <Text style={styles.metricTitle}>Avg. LTV</Text>
            <Text style={styles.metricValue}>
              {customerSegments.length > 0 
                ? `$${Math.round(customerSegments.reduce((sum, segment) => sum + segment.avgLtv, 0) / customerSegments.length)}`
                : '--'
              }
            </Text>
            <Text style={styles.metricDescription}>
              Average customer lifetime value
            </Text>
          </View>
        </View>
        
        {renderPowerBIDashboard()}
        
        <View style={styles.dashboardFooter}>
          <Text style={styles.footerText}>
            Data refreshed: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </Text>
        </View>
      </>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {hasData && hasAnalysis ? (
          renderDashboardContent()
        ) : (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              title={!hasData ? "No datasets available" : "No analysis results"}
              description={!hasData 
                ? "Upload a dataset to view the BI dashboard."
                : "Run analysis on your dataset to view the BI dashboard."
              }
              icon={<BarChart2 size={32} color={colors.primary} />}
              actionLabel={!hasData ? "Upload Data" : "Run Analysis"}
              onAction={() => {}}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  dashboardHeader: {
    marginBottom: 24,
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  dashboardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    width: width >= 768 ? (width - 64) / 3 : (width - 48) / 2,
    minWidth: 140,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  webViewContainer: {
    height: 600,
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 120,
  },
  dashboardFooter: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
});