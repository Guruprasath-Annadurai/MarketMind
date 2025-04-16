import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  BarChart2, 
  Users, 
  TrendingUp, 
  Database,
  Upload,
} from 'lucide-react-native';
import { colors, shadows } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { MetricCard } from '@/components/MetricCard';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { mockDashboardMetrics } from '@/mocks/data';

export default function DashboardScreen() {
  const router = useRouter();
  const { datasets, selectedDatasetId, fetchUserDatasets } = useAppStore();
  const { userProfile, isAuthenticated } = useAuthStore();
  
  // Fetch user datasets when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserDatasets();
    }
  }, [isAuthenticated]);
  
  // Filter datasets to only show the current user's datasets
  const userDatasets = datasets.filter(dataset => 
    !dataset.userId || dataset.userId === userProfile?.id
  );
  
  const hasData = userDatasets.length > 0;
  
  const navigateToUpload = () => {
    router.push('/upload');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {userProfile?.name || 'User'}
            </Text>
            <Text style={styles.subGreeting}>
              Welcome to your marketing dashboard
            </Text>
          </View>
        </View>
        
        {hasData ? (
          <>
            <View style={styles.metricsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Key Metrics</Text>
              </View>
              
              <View style={styles.metricsGrid}>
                {mockDashboardMetrics.map((metric, index) => (
                  <View key={index} style={styles.metricCardWrapper}>
                    <MetricCard metric={metric} />
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
              </View>
              
              <View style={[styles.activityCard, shadows.small]}>
                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: colors.primaryLight }]}>
                    <Database size={16} color={colors.primary} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Dataset Uploaded</Text>
                    <Text style={styles.activityDescription}>
                      {userDatasets[0]?.name || 'New dataset'} was successfully processed
                    </Text>
                    <Text style={styles.activityTime}>2 hours ago</Text>
                  </View>
                </View>
                
                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: colors.secondaryLight }]}>
                    <BarChart2 size={16} color={colors.secondary} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Analysis Completed</Text>
                    <Text style={styles.activityDescription}>
                      Churn prediction model achieved 87% accuracy
                    </Text>
                    <Text style={styles.activityTime}>1 day ago</Text>
                  </View>
                </View>
                
                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: '#E8F5E9' }]}>
                    <TrendingUp size={16} color={colors.success} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Campaign Generated</Text>
                    <Text style={styles.activityDescription}>
                      4 new campaign suggestions are available
                    </Text>
                    <Text style={styles.activityTime}>2 days ago</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
              </View>
              
              <View style={styles.actionsContainer}>
                <Button
                  title="Upload New Data"
                  onPress={navigateToUpload}
                  variant="primary"
                  style={styles.actionButton}
                  icon={<Upload size={16} color={colors.textLight} />}
                />
                
                <Button
                  title="Run Analysis"
                  onPress={() => router.push('/analysis')}
                  variant="outline"
                  style={styles.actionButton}
                  icon={<BarChart2 size={16} color={colors.primary} />}
                />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              title="No data available"
              description="Upload your first dataset to get started with customer analysis and campaign suggestions."
              icon={<Database size={32} color={colors.primary} />}
              actionLabel="Upload Data"
              onAction={navigateToUpload}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subGreeting: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  metricsContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  metricCardWrapper: {
    width: '50%',
    paddingHorizontal: 6,
  },
  section: {
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
});