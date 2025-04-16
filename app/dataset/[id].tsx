import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Database, 
  Calendar, 
  Clock, 
  FileText, 
  BarChart2, 
  Trash2, 
  ArrowLeft,
  Download,
  Share2,
  Brain
} from 'lucide-react-native';
import { colors, shadows } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/Button';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export default function DatasetDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { 
    datasets, 
    deleteDataset, 
    runAnalysis, 
    churnPrediction,
    isLoading 
  } = useAppStore();
  
  const [dataset, setDataset] = useState<any>(null);
  
  // Find the dataset with the matching ID
  useEffect(() => {
    if (id && datasets.length > 0) {
      const foundDataset = datasets.find(d => d.id === id);
      setDataset(foundDataset);
    }
  }, [id, datasets]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
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
  
  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Handle delete dataset
  const handleDeleteDataset = () => {
    Alert.alert(
      'Delete Dataset',
      'Are you sure you want to delete this dataset? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteDataset(id as string);
            router.replace('/upload');
          }
        }
      ]
    );
  };
  
  // Handle run analysis
  const handleRunAnalysis = async () => {
    if (!dataset) return;
    
    if (dataset.status !== 'processed' && dataset.status !== 'uploaded') {
      Alert.alert(
        'Dataset Not Ready', 
        'This dataset is still being processed. Please wait until it is ready to run analysis.'
      );
      return;
    }
    
    try {
      await runAnalysis(dataset.id);
      router.push('/analysis');
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Analysis Error', 'There was an error running the analysis. Please try again.');
    }
  };
  
  // Handle download dataset
  const handleDownloadDataset = () => {
    Alert.alert(
      'Download Dataset',
      'This would download the dataset file to your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Download', 
          onPress: () => {
            Alert.alert('Success', 'Dataset downloaded successfully!');
          }
        }
      ]
    );
  };
  
  // Handle share dataset
  const handleShareDataset = () => {
    Alert.alert(
      'Share Dataset',
      'This would share the dataset with other users.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share', 
          onPress: () => {
            Alert.alert('Success', 'Dataset shared successfully!');
          }
        }
      ]
    );
  };
  
  // If dataset not found
  if (!dataset) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Database size={48} color={colors.textTertiary} />
          <Text style={styles.notFoundText}>Dataset not found</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
            icon={<ArrowLeft size={16} color={colors.primary} />}
            style={styles.goBackButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  // Check if analysis has been run on this dataset
  const hasAnalysis = churnPrediction && churnPrediction.datasetId === dataset.id;
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.datasetIconContainer}>
              <Database size={24} color={colors.primary} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.datasetName}>{dataset.name}</Text>
              <Text style={styles.datasetDescription}>{dataset.description}</Text>
            </View>
          </View>
          
          <View style={[
            styles.statusBadge,
            { 
              backgroundColor: dataset.status === 'processed' 
                ? colors.successLight 
                : dataset.status === 'processing' 
                  ? colors.warningLight 
                  : colors.dangerLight 
            }
          ]}>
            <Text style={[
              styles.statusText,
              { 
                color: dataset.status === 'processed' 
                  ? colors.success 
                  : dataset.status === 'processing' 
                    ? colors.warning 
                    : colors.danger 
              }
            ]}>
              {dataset.status.charAt(0).toUpperCase() + dataset.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={[styles.detailsCard, shadows.small]}>
          <Text style={styles.sectionTitle}>Dataset Details</Text>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Calendar size={16} color={colors.textSecondary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Upload Date</Text>
                <Text style={styles.detailValue}>{formatDate(dataset.createdAt)}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Clock size={16} color={colors.textSecondary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Upload Time</Text>
                <Text style={styles.detailValue}>{formatTime(dataset.createdAt)}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <FileText size={16} color={colors.textSecondary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>File Size</Text>
                <Text style={styles.detailValue}>{formatFileSize(dataset.fileSize)}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Database size={16} color={colors.textSecondary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Rows</Text>
                <Text style={styles.detailValue}>{dataset.rowCount.toLocaleString()}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <BarChart2 size={16} color={colors.textSecondary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Columns</Text>
                <Text style={styles.detailValue}>{dataset.columnCount}</Text>
              </View>
            </View>
            
            {dataset.predictionId && (
              <View style={styles.detailItem}>
                <Brain size={16} color={colors.textSecondary} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Prediction ID</Text>
                  <Text style={styles.detailValue}>{dataset.predictionId}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <View style={styles.actionButtonsContainer}>
            <Button
              title="Run Analysis"
              onPress={handleRunAnalysis}
              variant="primary"
              icon={<Brain size={18} color={colors.textLight} />}
              disabled={dataset.status !== 'processed' && dataset.status !== 'uploaded'}
              style={styles.actionButton}
            />
            
            <Button
              title="Download"
              onPress={handleDownloadDataset}
              variant="outline"
              icon={<Download size={16} color={colors.primary} />}
              style={styles.actionButton}
            />
            
            <Button
              title="Share"
              onPress={handleShareDataset}
              variant="outline"
              icon={<Share2 size={16} color={colors.primary} />}
              style={styles.actionButton}
            />
            
            <Button
              title="Delete"
              onPress={handleDeleteDataset}
              variant="danger"
              icon={<Trash2 size={16} color={colors.textLight} />}
              style={styles.actionButton}
            />
          </View>
        </View>
        
        {hasAnalysis && (
          <View style={[styles.analysisCard, shadows.small]}>
            <Text style={styles.sectionTitle}>Analysis Results</Text>
            
            <View style={styles.analysisStats}>
              <View style={styles.analysisStat}>
                <Text style={styles.analysisStatValue}>
                  {(churnPrediction.churnRate * 100).toFixed(1)}%
                </Text>
                <Text style={styles.analysisStatLabel}>Churn Rate</Text>
              </View>
              
              <View style={styles.analysisStat}>
                <Text style={styles.analysisStatValue}>
                  {churnPrediction.predictedChurnCount.toLocaleString()}
                </Text>
                <Text style={styles.analysisStatLabel}>At Risk Users</Text>
              </View>
              
              <View style={styles.analysisStat}>
                <Text style={styles.analysisStatValue}>
                  {(churnPrediction.accuracy * 100).toFixed(0)}%
                </Text>
                <Text style={styles.analysisStatLabel}>Model Accuracy</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.viewAnalysisButton}
              onPress={() => router.push('/analysis')}
            >
              <Text style={styles.viewAnalysisText}>View Full Analysis</Text>
              <ArrowLeft size={16} color={colors.primary} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      <LoadingOverlay visible={isLoading} message="Processing..." />
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  datasetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  datasetName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  datasetDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  detailTextContainer: {
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  actionButton: {
    marginHorizontal: 8,
    marginBottom: 16,
    minWidth: '45%',
  },
  analysisCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  analysisStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  analysisStat: {
    alignItems: 'center',
  },
  analysisStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  analysisStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  viewAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  viewAnalysisText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginRight: 8,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  goBackButton: {
    minWidth: 120,
  },
});