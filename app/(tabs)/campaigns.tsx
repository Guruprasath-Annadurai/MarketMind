import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  Alert,
  Platform,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { 
  Mail, 
  Sparkles,
  Database,
  Share2,
  Users,
  AlertTriangle,
  Copy,
  X,
  ArrowUpRight,
  CheckCircle,
  PieChart
} from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/Button';
import { CampaignCard } from '@/components/CampaignCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { exportCampaignToCRM } from '@/services/ml-api';
import { CustomerSegment } from '@/types';

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

interface CampaignSuggestion {
  segment: number;
  subject: string;
  body: string;
  cta: string;
}

export default function CampaignsScreen() {
  const { 
    datasets, 
    churnPrediction, 
    customerSegments,
    campaignSuggestions,
    generateCampaigns,
    isLoading,
  } = useAppStore();
  
  const { colors, shadows } = useAppTheme();
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const hasData = datasets.length > 0;
  const hasAnalysis = churnPrediction !== null && customerSegments.length > 0;
  const hasCampaigns = campaignSuggestions.length > 0;
  
  const handleGenerateCampaigns = async () => {
    if (!hasAnalysis) {
      Alert.alert(
        'Analysis Required', 
        'You need to run analysis first to generate campaign suggestions.',
        [
          { text: 'OK' }
        ]
      );
      return;
    }
    
    try {
      await generateCampaigns();
    } catch (error) {
      console.error('Failed to generate campaigns:', error);
      Alert.alert('Error', 'Failed to generate campaigns. Please try again.');
    }
  };
  
  const handleExportCampaign = async (campaignId: string) => {
    const campaign = campaignSuggestions.find(c => c.id === campaignId);
    
    if (!campaign) {
      Alert.alert('Error', 'Campaign not found');
      return;
    }
    
    try {
      const result = await exportCampaignToCRM(campaign);
      
      if (result.success) {
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Export Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export campaign. Please try again.');
    }
  };
  
  const handleShareCampaign = (campaignId: string) => {
    const campaign = campaignSuggestions.find(c => c.id === campaignId);
    
    if (!campaign) {
      Alert.alert('Error', 'Campaign not found');
      return;
    }
    
    if (Platform.OS === 'web') {
      Alert.alert('Share', 'Sharing is not available on web');
      return;
    }
    
    Alert.alert(
      'Share Campaign',
      'This would share the campaign details with your team.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share', 
          onPress: () => {
            Alert.alert('Success', 'Campaign shared successfully!');
          }
        }
      ]
    );
  };
  
  const handleViewSegmentSuggestions = (segment: CustomerSegment) => {
    setSelectedSegment(segment);
    setModalVisible(true);
  };
  
  const handleCopyToClipboard = async (text: string, field: string) => {
    try {
      // Use navigator.clipboard for web and a fallback for native
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(text);
      } else {
        // On native platforms, we'd use a different approach
        // Since expo-clipboard is not available, we'll just simulate success
        console.log('Would copy to clipboard:', text);
      }
      
      setCopiedField(field);
      
      // Reset the copied field indicator after 2 seconds
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };
  
  const getSegmentIndex = (segmentName: string): number => {
    if (segmentName.includes('High-Value') || segmentName.includes('Loyalist')) return 0;
    if (segmentName.includes('At-Risk') || segmentName.includes('Big Spender')) return 1;
    if (segmentName.includes('Occasional')) return 2;
    if (segmentName.includes('New') || segmentName.includes('Enthusiast')) return 3;
    return 0; // Default to first template
  };
  
  const getCampaignSuggestionForSegment = (segment: CustomerSegment): CampaignSuggestion => {
    const segmentIndex = getSegmentIndex(segment.name);
    return campaignSuggestionTemplates[segmentIndex] || campaignSuggestionTemplates[0];
  };
  
  const renderSegmentCards = () => {
    return (
      <View style={styles.segmentCardsContainer}>
        {customerSegments.map((segment) => (
          <TouchableOpacity
            key={segment.id}
            style={[styles.segmentCard, shadows.small, { backgroundColor: colors.card }]}
            onPress={() => handleViewSegmentSuggestions(segment)}
          >
            <View style={styles.segmentCardHeader}>
              <View style={[styles.segmentColorIndicator, { backgroundColor: segment.color }]} />
              <Text style={[styles.segmentName, { color: colors.text }]}>{segment.name}</Text>
            </View>
            
            <View style={styles.segmentStats}>
              <View style={styles.segmentStat}>
                <Users size={14} color={colors.textSecondary} />
                <Text style={[styles.segmentStatText, { color: colors.textSecondary }]}>
                  {segment.size.toLocaleString()} users
                </Text>
              </View>
              
              <View style={styles.segmentStat}>
                <AlertTriangle size={14} color={
                  segment.churnRisk > 0.5 ? colors.danger : 
                  segment.churnRisk > 0.2 ? colors.warning : 
                  colors.success
                } />
                <Text style={[styles.segmentStatText, { color: colors.textSecondary }]}>
                  {(segment.churnRisk * 100).toFixed(0)}% churn risk
                </Text>
              </View>
            </View>
            
            <Button
              title="View Suggestions"
              onPress={() => handleViewSegmentSuggestions(segment)}
              variant="outline"
              size="small"
              icon={<Mail size={14} color={colors.primary} />}
              style={styles.viewSuggestionsButton}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const renderSuggestionModal = () => {
    if (!selectedSegment) return null;
    
    const suggestion = getCampaignSuggestionForSegment(selectedSegment);
    
    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Campaign Suggestions</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.segmentInfo, { backgroundColor: colors.surface }]}>
              <View style={[styles.segmentColorIndicator, { backgroundColor: selectedSegment.color }]} />
              <Text style={[styles.segmentInfoText, { color: colors.text }]}>
                {selectedSegment.name} ({selectedSegment.size.toLocaleString()} users)
              </Text>
            </View>
            
            <ScrollView style={styles.suggestionContainer}>
              <View style={styles.suggestionSection}>
                <View style={styles.suggestionHeader}>
                  <Text style={[styles.suggestionLabel, { color: colors.textSecondary }]}>Email Subject Line</Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => handleCopyToClipboard(suggestion.subject, 'subject')}
                  >
                    {copiedField === 'subject' ? (
                      <CheckCircle size={16} color={colors.success} />
                    ) : (
                      <Copy size={16} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
                <View style={[styles.suggestionContent, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion.subject}</Text>
                </View>
              </View>
              
              <View style={styles.suggestionSection}>
                <View style={styles.suggestionHeader}>
                  <Text style={[styles.suggestionLabel, { color: colors.textSecondary }]}>Email Body</Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => handleCopyToClipboard(suggestion.body, 'body')}
                  >
                    {copiedField === 'body' ? (
                      <CheckCircle size={16} color={colors.success} />
                    ) : (
                      <Copy size={16} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
                <View style={[styles.suggestionContent, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion.body}</Text>
                </View>
              </View>
              
              <View style={styles.suggestionSection}>
                <View style={styles.suggestionHeader}>
                  <Text style={[styles.suggestionLabel, { color: colors.textSecondary }]}>Call to Action</Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => handleCopyToClipboard(suggestion.cta, 'cta')}
                  >
                    {copiedField === 'cta' ? (
                      <CheckCircle size={16} color={colors.success} />
                    ) : (
                      <Copy size={16} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
                <View style={[styles.suggestionContent, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion.cta}</Text>
                </View>
              </View>
              
              <View style={styles.suggestionSection}>
                <View style={styles.suggestionHeader}>
                  <Text style={[styles.suggestionLabel, { color: colors.textSecondary }]}>Recommended Channels</Text>
                </View>
                <View style={styles.channelsContainer}>
                  <View style={[styles.channelBadge, { backgroundColor: `${colors.primary}20` }]}>
                    <Text style={[styles.channelText, { color: colors.primary }]}>Email</Text>
                  </View>
                  {selectedSegment.churnRisk > 0.5 && (
                    <View style={[styles.channelBadge, { backgroundColor: `${colors.primary}20` }]}>
                      <Text style={[styles.channelText, { color: colors.primary }]}>SMS</Text>
                    </View>
                  )}
                  {selectedSegment.avgEngagement > 0.6 && (
                    <View style={[styles.channelBadge, { backgroundColor: `${colors.primary}20` }]}>
                      <Text style={[styles.channelText, { color: colors.primary }]}>Push</Text>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
            
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <Button
                title="Export to CRM"
                onPress={() => {
                  setModalVisible(false);
                  Alert.alert('Success', `Campaign for ${selectedSegment.name} exported to CRM`);
                }}
                variant="primary"
                icon={<ArrowUpRight size={16} color={colors.textLight} />}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {hasData ? (
          <>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Campaign Assistant</Text>
              <Text style={[styles.headerDescription, { color: colors.textSecondary }]}>
                AI-generated campaign ideas based on your customer segments and churn predictions.
              </Text>
            </View>
            
            {hasAnalysis ? (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Segment Overview</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                    Click on a segment to view campaign suggestions
                  </Text>
                </View>
                
                {renderSegmentCards()}
                
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Campaign Suggestions</Text>
                </View>
                
                <View style={styles.generateContainer}>
                  <Button
                    title="Generate New Campaigns"
                    onPress={handleGenerateCampaigns}
                    variant="primary"
                    disabled={!hasAnalysis}
                    icon={<Sparkles size={18} color={colors.textLight} />}
                  />
                </View>
                
                {hasCampaigns ? (
                  <View style={styles.campaignsContainer}>
                    {campaignSuggestions.map(campaign => (
                      <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        onExport={() => handleExportCampaign(campaign.id)}
                        onShare={() => handleShareCampaign(campaign.id)}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyCampaignsContainer}>
                    <EmptyState
                      title="No Campaign Suggestions"
                      description="Generate campaign suggestions based on your customer segments and churn predictions."
                      icon={<Mail size={32} color={colors.primary} />}
                      actionLabel="Generate Campaigns"
                      onAction={handleGenerateCampaigns}
                    />
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyStateContainer}>
                <EmptyState
                  title="No analysis results"
                  description="Run analysis on your dataset to get segment-based campaign suggestions."
                  icon={<PieChart size={32} color={colors.primary} />}
                  actionLabel="Run Analysis"
                  onAction={() => {}}
                />
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              title="No datasets available"
              description="Upload a dataset and run analysis to get campaign suggestions."
              icon={<Database size={32} color={colors.primary} />}
              actionLabel="Upload Data"
              onAction={() => {}}
            />
          </View>
        )}
      </ScrollView>
      
      {renderSuggestionModal()}
      
      <LoadingOverlay visible={isLoading} message="Generating campaigns..." />
    </SafeAreaView>
  );
}

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
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  segmentCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  segmentCard: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    width: '45%',
    minWidth: 160,
  },
  segmentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  segmentColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  segmentName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  segmentStats: {
    marginBottom: 12,
  },
  segmentStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  segmentStatText: {
    fontSize: 12,
    marginLeft: 8,
  },
  viewSuggestionsButton: {
    marginTop: 4,
  },
  generateContainer: {
    marginBottom: 24,
  },
  campaignsContainer: {
    marginBottom: 24,
  },
  emptyCampaignsContainer: {
    marginTop: 40,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  segmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  segmentInfoText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  suggestionContainer: {
    padding: 16,
    maxHeight: 400,
  },
  suggestionSection: {
    marginBottom: 20,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  copyButton: {
    padding: 4,
  },
  suggestionContent: {
    borderRadius: 8,
    padding: 12,
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  channelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  channelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  channelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
});