import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  BarChart2, 
  PieChart, 
  Upload, 
  Database, 
  Mail, 
  Brain,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Users
} from 'lucide-react-native';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function InsightsScreen() {
  const router = useRouter();
  const { 
    datasets, 
    churnPrediction, 
    customerSegments,
    campaignSuggestions,
    fetchUserDatasets,
    isLoading 
  } = useAppStore();
  
  const { userProfile } = useAuthStore();
  const { colors, shadows } = useAppTheme();
  
  // Fetch user datasets on component mount
  useEffect(() => {
    fetchUserDatasets();
  }, []);
  
  const hasData = datasets.length > 0;
  const hasAnalysis = churnPrediction !== null && customerSegments.length > 0;
  const hasCampaigns = campaignSuggestions.length > 0;
  
  // Get the latest dataset
  const latestDataset = datasets.length > 0 
    ? datasets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  const navigateToUpload = () => {
    router.push('/upload');
  };
  
  const navigateToAnalysis = () => {
    router.push('/analysis');
  };
  
  const navigateToCampaigns = () => {
    router.push('/campaigns');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {userProfile ? `Welcome, ${userProfile.name.split(' ')[0]}` : 'Welcome'}
          </Text>
          <Text style={[styles.headerDescription, { color: colors.textSecondary }]}>
            {userProfile?.email || 'Your personal insights dashboard'}
          </Text>
        </View>
        
        {hasData ? (
          <>
            {/* Latest Dataset Summary */}
            <View style={[styles.card, { backgroundColor: colors.card }, shadows.small]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Latest Dataset</Text>
              </View>
              
              <View style={styles.datasetInfo}>
                <Database size={20} color={colors.primary} />
                <View style={styles.datasetDetails}>
                  <Text style={[styles.datasetName, { color: colors.text }]}>
                    {latestDataset?.name}
                  </Text>
                  <View style={styles.datasetMeta}>
                    <View style={styles.metaItem}>
                      <Calendar size={12} color={colors.textSecondary} />
                      <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                        {latestDataset ? formatDate(latestDataset.createdAt) : ''}
                      </Text>
                    </View>
                    
                    <View style={styles.metaItem}>
                      <Clock size={12} color={colors.textSecondary} />
                      <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                        {latestDataset ? formatTime(latestDataset.createdAt) : ''}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={[
                  styles.statusBadge,
                  { 
                    backgroundColor: latestDataset?.status === 'ready' 
                      ? `${colors.success}20` 
                      : `${colors.warning}20` 
                  }
                ]}>
                  {latestDataset?.status === 'ready' ? (
                    <CheckCircle size={12} color={colors.success} />
                  ) : (
                    <Clock size={12} color={colors.warning} />
                  )}
                  <Text style={[
                    styles.statusText,
                    { 
                      color: latestDataset?.status === 'ready' 
                        ? colors.success 
                        : colors.warning 
                    }
                  ]}>
                    {latestDataset?.status === 'ready' ? 'Processed' : 'Processing'}
                  </Text>
                </View>
              </View>
              
              {latestDataset && (
                <View style={[styles.datasetStats, { backgroundColor: colors.surface }]}>
                  <View style={styles.datasetStat}>
                    <Text style={[styles.datasetStatValue, { color: colors.text }]}>
                      {latestDataset.rowCount.toLocaleString()}
                    </Text>
                    <Text style={[styles.datasetStatLabel, { color: colors.textSecondary }]}>
                      Rows
                    </Text>
                  </View>
                  
                  <View style={styles.datasetStat}>
                    <Text style={[styles.datasetStatValue, { color: colors.text }]}>
                      {latestDataset.columnCount}
                    </Text>
                    <Text style={[styles.datasetStatLabel, { color: colors.textSecondary }]}>
                      Columns
                    </Text>
                  </View>
                  
                  <View style={styles.datasetStat}>
                    <Text style={[styles.datasetStatValue, { color: colors.text }]}>
                      {(latestDataset.fileSize / (1024 * 1024)).toFixed(1)} MB
                    </Text>
                    <Text style={[styles.datasetStatLabel, { color: colors.textSecondary }]}>
                      Size
                    </Text>
                  </View>
                </View>
              )}
            </View>
            
            {/* Prediction Snapshot */}
            {hasAnalysis ? (
              <View style={[styles.card, { backgroundColor: colors.card }, shadows.small]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Churn Prediction Snapshot
                  </Text>
                </View>
                
                <View style={styles.predictionStats}>
                  <View style={styles.predictionStat}>
                    <View style={[styles.predictionStatIcon, { backgroundColor: `${colors.danger}20` }]}>
                      <AlertTriangle size={16} color={colors.danger} />
                    </View>
                    <Text style={[styles.predictionStatValue, { color: colors.text }]}>
                      {(churnPrediction?.churnRate * 100).toFixed(1)}%
                    </Text>
                    <Text style={[styles.predictionStatLabel, { color: colors.textSecondary }]}>
                      Avg Churn
                    </Text>
                  </View>
                  
                  <View style={styles.predictionStat}>
                    <View style={[styles.predictionStatIcon, { backgroundColor: colors.primaryLight }]}>
                      <PieChart size={16} color={colors.primary} />
                    </View>
                    <Text style={[styles.predictionStatValue, { color: colors.text }]}>
                      {customerSegments.length}
                    </Text>
                    <Text style={[styles.predictionStatLabel, { color: colors.textSecondary }]}>
                      Segments
                    </Text>
                  </View>
                  
                  <View style={styles.predictionStat}>
                    <View style={[styles.predictionStatIcon, { backgroundColor: `${colors.warning}20` }]}>
                      <Users size={16} color={colors.warning} />
                    </View>
                    <Text style={[styles.predictionStatValue, { color: colors.text }]}>
                      {churnPrediction?.predictedChurnCount.toLocaleString()}
                    </Text>
                    <Text style={[styles.predictionStatLabel, { color: colors.textSecondary }]}>
                      At Risk
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.viewMoreLink}
                  onPress={navigateToAnalysis}
                >
                  <Text style={[styles.viewMoreText, { color: colors.primary }]}>
                    View detailed analysis
                  </Text>
                  <ArrowRight size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.card, { backgroundColor: colors.card }, shadows.small]}>
                <View style={styles.emptyAnalysisContainer}>
                  <Brain size={32} color={colors.textTertiary} />
                  <Text style={[styles.emptyAnalysisTitle, { color: colors.text }]}>
                    No Analysis Results
                  </Text>
                  <Text style={[styles.emptyAnalysisDescription, { color: colors.textSecondary }]}>
                    Run analysis on your dataset to get churn predictions and customer segments.
                  </Text>
                  <Button
                    title="Run Analysis"
                    onPress={navigateToAnalysis}
                    variant="primary"
                    style={styles.emptyAnalysisButton}
                  />
                </View>
              </View>
            )}
            
            {/* Quick Actions */}
            <View style={[styles.card, { backgroundColor: colors.card }, shadows.small]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Quick Actions</Text>
              </View>
              
              <View style={styles.quickActions}>
                <TouchableOpacity 
                  style={styles.quickAction}
                  onPress={navigateToUpload}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: colors.primaryLight }]}>
                    <Upload size={18} color={colors.primary} />
                  </View>
                  <Text style={[styles.quickActionText, { color: colors.text}]}>
                    Upload Dataset
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickAction}
                  onPress={navigateToAnalysis}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: colors.secondaryLight }]}>
                    <Brain size={18} color={colors.secondary} />
                  </View>
                  <Text style={[styles.quickActionText, {color: colors.text}]}>
                    Run Analysis
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickAction}
                  onPress={navigateToCampaigns}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: `${colors.success}20` }]}>
                    <Mail size={18} color={colors.success} />
                  </View>
                  <Text style={[styles.quickActionText, {color: colors.text}]}>
                    Campaigns
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Recent Campaigns */}
            {hasCampaigns ? (
              <View style={[styles.card, { backgroundColor: colors.card }, shadows.small]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Recent Campaign Suggestions
                  </Text>
                </View>
                
                <View style={styles.campaignsTable}>
                  <View style={styles.campaignsTableHeader}>
                    <Text style={[
                      styles.campaignsTableHeaderCell, 
                      { flex: 1.5, color: colors.textSecondary }
                    ]}>
                      Segment
                    </Text>
                    <Text style={[
                      styles.campaignsTableHeaderCell, 
                      { flex: 2, color: colors.textSecondary }
                    ]}>
                      Subject
                    </Text>
                    <Text style={[
                      styles.campaignsTableHeaderCell, 
                      { flex: 1, color: colors.textSecondary }
                    ]}>
                      CTA
                    </Text>
                  </View>
                  
                  {campaignSuggestions.slice(0, 3).map((campaign, index) => {
                    // Find the template that matches this campaign's target segment
                    const template = campaignSuggestionTemplates.find(t => 
                      t.segment === getSegmentIndex(campaign.targetSegment)
                    ) || campaignSuggestionTemplates[0];
                    
                    return (
                      <View key={campaign.id} style={[
                        styles.campaignsTableRow,
                        { borderBottomColor: colors.border + '30' }
                      ]}>
                        <Text 
                          style={[styles.campaignsTableCell, { flex: 1.5, color: colors.text }]} 
                          numberOfLines={1}
                        >
                          {campaign.targetSegment}
                        </Text>
                        <Text 
                          style={[styles.campaignsTableCell, { flex: 2, color: colors.text }]} 
                          numberOfLines={1}
                        >
                          {template.subject}
                        </Text>
                        <Text 
                          style={[styles.campaignsTableCell, { flex: 1, color: colors.text }]} 
                          numberOfLines={1}
                        >
                          {template.cta}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                
                <TouchableOpacity 
                  style={styles.viewMoreLink}
                  onPress={navigateToCampaigns}
                >
                  <Text style={[styles.viewMoreText, { color: colors.primary }]}>
                    View all campaigns
                  </Text>
                  <ArrowRight size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : hasAnalysis ? (
              <View style={[styles.card, { backgroundColor: colors.card }, shadows.small]}>
                <View style={styles.emptyAnalysisContainer}>
                  <Mail size={32} color={colors.textTertiary} />
                  <Text style={[styles.emptyAnalysisTitle, { color: colors.text }]}>
                    No Campaign Suggestions
                  </Text>
                  <Text style={[styles.emptyAnalysisDescription, { color: colors.textSecondary }]}>
                    Generate campaign suggestions based on your customer segments.
                  </Text>
                  <Button
                    title="Generate Campaigns"
                    onPress={navigateToCampaigns}
                    variant="primary"
                    style={styles.emptyAnalysisButton}
                  />
                </View>
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              title="No datasets available"
              description="Upload a dataset to get started with customer insights and campaign suggestions."
              icon={<Database size={32} color={colors.primary} />}
              actionLabel="Upload Dataset"
              onAction={navigateToUpload}
            />
          </View>
        )}
      </ScrollView>
      
      <LoadingOverlay visible={isLoading} message="Loading insights..." />
    </SafeAreaView>
  );
}

// Campaign suggestion templates for each segment
const campaignSuggestionTemplates = [
  {
    segment: 0, // High-Value Loyalists
    subject: "Don't Miss Out! Here's 20% Just for You",
    body: "We noticed you've been inactive. Come back and enjoy 20% off on your next visit!",
    cta: "Claim Offer"
  },
  {
    segment: 1, // At-Risk Big Spenders
    subject: "Thanks for being a power user 💪",
    body: "You're in our top 10%! Here's an exclusive tip to boost your experience...",
    cta: "Learn More"
  },
  {
    segment: 2, // Occasional Buyers
    subject: "We miss you! Come back and see what's new",
    body: "It's been a while since your last purchase. We've added new products we think you'll love!",
    cta: "Shop Now"
  },
  {
    segment: 3, // New Enthusiasts
    subject: "Welcome to the family! Here's a special gift",
    body: "Thank you for joining us! To help you get started, here's a special welcome discount on your next purchase.",
    cta: "Get Started"
  }
];

// Helper function to get segment index from name
const getSegmentIndex = (segmentName: string): number => {
  if (segmentName.includes('High-Value') || segmentName.includes('Loyalist')) return 0;
  if (segmentName.includes('At-Risk') || segmentName.includes('Big Spender')) return 1;
  if (segmentName.includes('Occasional')) return 2;
  if (segmentName.includes('New') || segmentName.includes('Enthusiast')) return 3;
  return 0; // Default to first template
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  datasetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  datasetDetails: {
    flex: 1,
    marginLeft: 12,
  },
  datasetName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  datasetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  datasetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    padding: 12,
  },
  datasetStat: {
    alignItems: 'center',
  },
  datasetStatValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  datasetStatLabel: {
    fontSize: 12,
  },
  predictionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  predictionStat: {
    alignItems: 'center',
  },
  predictionStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  predictionStatValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  predictionStatLabel: {
    fontSize: 12,
  },
  viewMoreLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    width: '30%',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    textAlign: 'center',
  },
  campaignsTable: {
    marginBottom: 16,
  },
  campaignsTableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  campaignsTableHeaderCell: {
    fontSize: 12,
    fontWeight: '500',
  },
  campaignsTableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  campaignsTableCell: {
    fontSize: 14,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  emptyAnalysisContainer: {
    alignItems: 'center',
    padding: 16,
  },
  emptyAnalysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyAnalysisDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyAnalysisButton: {
    minWidth: 150,
  },
});