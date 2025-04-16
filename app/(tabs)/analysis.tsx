import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { 
  BarChart2, 
  PieChart, 
  TrendingUp, 
  Database, 
  AlertTriangle,
  CheckCircle,
  Users,
  ArrowRight,
  Brain,
  RefreshCw
} from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { SegmentCard } from '@/components/SegmentCard';

export default function AnalysisScreen() {
  const { 
    datasets, 
    selectedDatasetId, 
    selectDataset, 
    runAnalysis, 
    churnPrediction, 
    customerSegments,
    isLoading,
    error
  } = useAppStore();
  
  const { colors, shadows } = useAppTheme();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get the selected dataset or the first one if none is selected
  const selectedDataset = selectedDatasetId 
    ? datasets.find(d => d.id === selectedDatasetId) 
    : datasets[0];
  
  const hasData = datasets.length > 0;
  const hasAnalysis = churnPrediction !== null && customerSegments.length > 0;
  
  const handleRunAnalysis = async () => {
    if (!selectedDataset) {
      Alert.alert('No Dataset Selected', 'Please select a dataset to run analysis on.');
      return;
    }
    
    if (selectedDataset.status !== 'processed' && selectedDataset.status !== 'uploaded') {
      Alert.alert(
        'Dataset Not Ready', 
        'This dataset is still being processed. Please wait until it is ready to run analysis.'
      );
      return;
    }
    
    try {
      await runAnalysis(selectedDataset.id);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Analysis Error', 'There was an error running the analysis. Please try again.');
    }
  };
  
  const renderDatasetSelector = () => {
    if (datasets.length <= 1) return null;
    
    return (
      <View style={styles.datasetSelectorContainer}>
        <Text style={[styles.datasetSelectorLabel, { color: colors.textSecondary }]}>Select Dataset:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.datasetSelectorContent}
        >
          {datasets.map(dataset => (
            <TouchableOpacity
              key={dataset.id}
              style={[
                styles.datasetOption,
                { backgroundColor: colors.card },
                selectedDatasetId === dataset.id && [
                  styles.datasetOptionSelected,
                  { backgroundColor: colors.primaryLight }
                ]
              ]}
              onPress={() => selectDataset(dataset.id)}
            >
              <Text style={[
                styles.datasetOptionText,
                { color: colors.text },
                selectedDatasetId === dataset.id && [
                  styles.datasetOptionTextSelected,
                  { color: colors.primary }
                ]
              ]}>
                {dataset.name}
              </Text>
              {dataset.status !== 'processed' && (
                <View style={[styles.datasetStatusBadge, { backgroundColor: colors.warningLight }]}>
                  <Text style={[styles.datasetStatusText, { color: colors.warning }]}>
                    {dataset.status === 'processing' ? 'Processing' : 'Error'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  const renderAnalysisOverview = () => {
    if (!churnPrediction) return null;
    
    return (
      <View style={styles.overviewContainer}>
        <View style={[styles.predictionCard, shadows.small, { backgroundColor: colors.card }]}>
          <View style={styles.predictionHeader}>
            <Text style={[styles.predictionTitle, { color: colors.text }]}>Churn Prediction Results</Text>
            <Text style={[styles.predictionSubtitle, { color: colors.textSecondary }]}>
              Analysis completed on {new Date(churnPrediction.createdAt).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <View style={[styles.metricIconContainer, { backgroundColor: `${colors.danger}20` }]}>
                <AlertTriangle size={20} color={colors.danger} />
              </View>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {(churnPrediction.churnRate * 100).toFixed(1)}%
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Churn Rate</Text>
            </View>
            
            <View style={styles.metricItem}>
              <View style={[styles.metricIconContainer, { backgroundColor: `${colors.warning}20` }]}>
                <Users size={20} color={colors.warning} />
              </View>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {churnPrediction.predictedChurnCount.toLocaleString()}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>At Risk</Text>
            </View>
            
            <View style={styles.metricItem}>
              <View style={[styles.metricIconContainer, { backgroundColor: `${colors.success}20` }]}>
                <CheckCircle size={20} color={colors.success} />
              </View>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {(churnPrediction.totalCustomers - churnPrediction.predictedChurnCount).toLocaleString()}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Stable</Text>
            </View>
          </View>
          
          <View style={[styles.modelAccuracyContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modelAccuracyTitle, { color: colors.text }]}>Model Performance</Text>
            
            <View style={styles.accuracyMetricsContainer}>
              <View style={styles.accuracyMetric}>
                <Text style={[styles.accuracyMetricValue, { color: colors.text }]}>
                  {(churnPrediction.accuracy * 100).toFixed(0)}%
                </Text>
                <Text style={[styles.accuracyMetricLabel, { color: colors.textSecondary }]}>Accuracy</Text>
              </View>
              
              <View style={styles.accuracyMetric}>
                <Text style={[styles.accuracyMetricValue, { color: colors.text }]}>
                  {(churnPrediction.precision * 100).toFixed(0)}%
                </Text>
                <Text style={[styles.accuracyMetricLabel, { color: colors.textSecondary }]}>Precision</Text>
              </View>
              
              <View style={styles.accuracyMetric}>
                <Text style={[styles.accuracyMetricValue, { color: colors.text }]}>
                  {(churnPrediction.recall * 100).toFixed(0)}%
                </Text>
                <Text style={[styles.accuracyMetricLabel, { color: colors.textSecondary }]}>Recall</Text>
              </View>
              
              <View style={styles.accuracyMetric}>
                <Text style={[styles.accuracyMetricValue, { color: colors.text }]}>
                  {(churnPrediction.f1Score * 100).toFixed(0)}%
                </Text>
                <Text style={[styles.accuracyMetricLabel, { color: colors.textSecondary }]}>F1 Score</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={[styles.segmentsSummaryContainer, { backgroundColor: colors.card }, shadows.small]}>
          <View style={styles.segmentsSummaryHeader}>
            <Text style={[styles.segmentsSummaryTitle, { color: colors.text }]}>Customer Segments</Text>
            <Text style={[styles.segmentsSummarySubtitle, { color: colors.textSecondary }]}>
              {customerSegments.length} segments identified
            </Text>
          </View>
          
          <View style={styles.segmentDistributionContainer}>
            <View style={styles.segmentDistributionHeader}>
              <Text style={[styles.segmentDistributionTitle, { color: colors.text }]}>Segment Distribution</Text>
            </View>
            
            <View style={styles.segmentBars}>
              {customerSegments.map(segment => (
                <View key={segment.id} style={styles.segmentBarContainer}>
                  <View style={styles.segmentBarLabelContainer}>
                    <View 
                      style={[
                        styles.segmentColorIndicator, 
                        { backgroundColor: segment.color }
                      ]} 
                    />
                    <Text style={[styles.segmentBarLabel, { color: colors.text }]} numberOfLines={1}>
                      {segment.name}
                    </Text>
                  </View>
                  
                  <View style={[styles.segmentBarWrapper, { backgroundColor: colors.border }]}>
                    <View 
                      style={[
                        styles.segmentBar, 
                        { 
                          width: `${segment.percentage}%`,
                          backgroundColor: segment.color 
                        }
                      ]} 
                    />
                  </View>
                  
                  <Text style={[styles.segmentBarValue, { color: colors.textSecondary }]}>
                    {segment.percentage}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
          
          <Button
            title="View Detailed Segment Analysis"
            onPress={() => setActiveTab('segments')}
            variant="outline"
            icon={<ArrowRight size={16} color={colors.primary} />}
            style={styles.viewSegmentsButton}
          />
        </View>
      </View>
    );
  };
  
  const renderSegmentsTab = () => {
    if (!customerSegments.length) return null;
    
    return (
      <View style={styles.segmentsContainer}>
        <View style={styles.segmentsHeader}>
          <Text style={[styles.segmentsTitle, { color: colors.text }]}>Customer Segments</Text>
          <Text style={[styles.segmentsSubtitle, { color: colors.textSecondary }]}>
            Detailed analysis of each customer segment
          </Text>
        </View>
        
        {customerSegments.map(segment => (
          <SegmentCard key={segment.id} segment={segment} />
        ))}
      </View>
    );
  };
  
  const renderTabs = () => {
    return (
      <View style={[styles.tabsContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'overview' && [
              styles.activeTabButton,
              { backgroundColor: colors.primaryLight }
            ]
          ]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[
            styles.tabButtonText,
            { color: colors.textSecondary },
            activeTab === 'overview' && [
              styles.activeTabButtonText,
              { color: colors.primary }
            ]
          ]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'segments' && [
              styles.activeTabButton,
              { backgroundColor: colors.primaryLight }
            ]
          ]}
          onPress={() => setActiveTab('segments')}
        >
          <Text style={[
            styles.tabButtonText,
            { color: colors.textSecondary },
            activeTab === 'segments' && [
              styles.activeTabButtonText,
              { color: colors.primary }
            ]
          ]}>
            Segments
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render error message if there's an error
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color={colors.danger} />
          <Text style={[styles.errorTitle, { color: colors.danger }]}>Error</Text>
          <Text style={[styles.errorMessage, { color: colors.text }]}>{error}</Text>
          <Button
            title="Try Again"
            onPress={handleRunAnalysis}
            variant="primary"
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Data Analysis</Text>
          <Text style={[styles.headerDescription, { color: colors.textSecondary }]}>
            Run machine learning models to predict customer churn and identify segments.
          </Text>
        </View>
        
        {hasData ? (
          <>
            {renderDatasetSelector()}
            
            {hasAnalysis ? (
              <>
                {renderTabs()}
                
                {activeTab === 'overview' ? renderAnalysisOverview() : renderSegmentsTab()}
                
                <View style={styles.actionsContainer}>
                  <Button
                    title="Run New Analysis"
                    onPress={handleRunAnalysis}
                    variant="outline"
                    icon={<RefreshCw size={16} color={colors.primary} />}
                    style={styles.actionButton}
                  />
                </View>
              </>
            ) : (
              <View style={styles.runAnalysisContainer}>
                <View style={[styles.selectedDatasetCard, shadows.small, { backgroundColor: colors.card }]}>
                  <Database size={24} color={colors.primary} />
                  <View style={styles.selectedDatasetInfo}>
                    <Text style={[styles.selectedDatasetName, { color: colors.text }]}>
                      {selectedDataset?.name || 'No dataset selected'}
                    </Text>
                    <Text style={[styles.selectedDatasetMeta, { color: colors.textSecondary }]}>
                      {selectedDataset ? `${selectedDataset.rowCount.toLocaleString()} rows, ${selectedDataset.columnCount} columns` : ''}
                    </Text>
                  </View>
                  {selectedDataset && (
                    <View style={[
                      styles.datasetStatusBadge,
                      { 
                        backgroundColor: selectedDataset?.status === 'processed' 
                          ? `${colors.success}20` 
                          : `${colors.warning}20` 
                      }
                    ]}>
                      <Text style={[
                        styles.datasetStatusText,
                        { 
                          color: selectedDataset?.status === 'processed' 
                            ? colors.success 
                            : colors.warning 
                        }
                      ]}>
                        {selectedDataset?.status === 'processed' ? 'Ready' : 'Processing'}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={[styles.analysisCard, shadows.small, { backgroundColor: colors.card }]}>
                  <View style={styles.analysisCardContent}>
                    <Brain size={48} color={colors.primary} />
                    <Text style={[styles.analysisCardTitle, { color: colors.text }]}>
                      Ready to Run Analysis
                    </Text>
                    <Text style={[styles.analysisCardDescription, { color: colors.textSecondary }]}>
                      Our machine learning models will analyze your data to predict customer churn and identify key segments for targeted marketing.
                    </Text>
                    
                    <View style={styles.analysisFeatures}>
                      <View style={styles.analysisFeature}>
                        <CheckCircle size={16} color={colors.success} />
                        <Text style={[styles.analysisFeatureText, { color: colors.text }]}>
                          Churn prediction with 85%+ accuracy
                        </Text>
                      </View>
                      
                      <View style={styles.analysisFeature}>
                        <CheckCircle size={16} color={colors.success} />
                        <Text style={[styles.analysisFeatureText, { color: colors.text }]}>
                          Customer segmentation based on behavior
                        </Text>
                      </View>
                      
                      <View style={styles.analysisFeature}>
                        <CheckCircle size={16} color={colors.success} />
                        <Text style={[styles.analysisFeatureText, { color: colors.text }]}>
                          Actionable insights for marketing campaigns
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <Button
                    title="Run Analysis"
                    onPress={handleRunAnalysis}
                    variant="primary"
                    icon={<Brain size={18} color={colors.textLight} />}
                    disabled={!selectedDataset || (selectedDataset.status !== 'processed' && selectedDataset.status !== 'uploaded')}
                  />
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              title="No datasets available"
              description="Upload a dataset to run analysis and get customer insights."
              icon={<Database size={32} color={colors.primary} />}
              actionLabel="Upload Data"
              onAction={() => {}}
            />
          </View>
        )}
      </ScrollView>
      
      <LoadingOverlay visible={isLoading} message="Running analysis..." />
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
  datasetSelectorContainer: {
    marginBottom: 24,
  },
  datasetSelectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  datasetSelectorContent: {
    paddingRight: 16,
  },
  datasetOption: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  datasetOptionSelected: {
    // backgroundColor set in render
  },
  datasetOptionText: {
    fontSize: 14,
  },
  datasetOptionTextSelected: {
    fontWeight: '500',
  },
  datasetStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  datasetStatusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    // backgroundColor set in render
  },
  tabButtonText: {
    fontSize: 14,
  },
  activeTabButtonText: {
    fontWeight: '500',
  },
  overviewContainer: {
    marginBottom: 24,
  },
  predictionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  predictionHeader: {
    marginBottom: 16,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  predictionSubtitle: {
    fontSize: 12,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
  },
  modelAccuracyContainer: {
    borderRadius: 8,
    padding: 12,
  },
  modelAccuracyTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  accuracyMetricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accuracyMetric: {
    alignItems: 'center',
  },
  accuracyMetricValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  accuracyMetricLabel: {
    fontSize: 10,
  },
  segmentsSummaryContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  segmentsSummaryHeader: {
    marginBottom: 16,
  },
  segmentsSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  segmentsSummarySubtitle: {
    fontSize: 12,
  },
  segmentDistributionContainer: {
    marginBottom: 16,
  },
  segmentDistributionHeader: {
    marginBottom: 12,
  },
  segmentDistributionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  segmentBars: {
    marginBottom: 8,
  },
  segmentBarContainer: {
    marginBottom: 12,
  },
  segmentBarLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  segmentColorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  segmentBarLabel: {
    fontSize: 12,
    flex: 1,
  },
  segmentBarWrapper: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  segmentBar: {
    height: '100%',
    borderRadius: 4,
  },
  segmentBarValue: {
    fontSize: 10,
    textAlign: 'right',
  },
  viewSegmentsButton: {
    marginTop: 8,
  },
  segmentsContainer: {
    marginBottom: 24,
  },
  segmentsHeader: {
    marginBottom: 16,
  },
  segmentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  segmentsSubtitle: {
    fontSize: 12,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 8,
  },
  runAnalysisContainer: {
    marginBottom: 24,
  },
  selectedDatasetCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDatasetInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectedDatasetName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  selectedDatasetMeta: {
    fontSize: 12,
  },
  analysisCard: {
    borderRadius: 12,
    padding: 16,
  },
  analysisCardContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  analysisCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  analysisCardDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  analysisFeatures: {
    width: '100%',
    marginBottom: 8,
  },
  analysisFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisFeatureText: {
    fontSize: 14,
    marginLeft: 12,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    minWidth: 150,
  },
});