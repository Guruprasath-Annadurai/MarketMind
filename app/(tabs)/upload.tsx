import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Upload as UploadIcon, 
  File, 
  FileText, 
  FilePlus,
  Info,
  Brain,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { DatasetCard } from '@/components/DatasetCard';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export default function UploadScreen() {
  const router = useRouter();
  const { datasets, uploadDataset, deleteDataset, selectDataset, isLoading } = useAppStore();
  const { isAuthenticated, userProfile } = useAuthStore();
  const { colors, shadows } = useAppTheme();
  
  const [datasetName, setDatasetName] = useState('');
  const [datasetDescription, setDatasetDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    size: number;
    type: string;
    file?: File | Blob;
  } | null>(null);
  const [errors, setErrors] = useState({ name: '', description: '' });
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);
  
  const validateForm = () => {
    const newErrors = { name: '', description: '' };
    let isValid = true;
    
    if (!datasetName.trim()) {
      newErrors.name = 'Dataset name is required';
      isValid = false;
    }
    
    if (!datasetDescription.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const pickDocument = async () => {
    try {
      // Use document picker for CSV files
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      const asset = result.assets[0];
      
      // For web, we need to get the actual file object
      let fileObject: File | Blob | undefined;
      
      if (Platform.OS === 'web') {
        try {
          // On web, we can get the File object directly
          const response = await fetch(asset.uri);
          fileObject = await response.blob();
        } catch (error) {
          console.error('Error getting file blob:', error);
        }
      }
      
      setSelectedFile({
        uri: asset.uri,
        name: asset.name,
        size: asset.size || 0,
        type: asset.mimeType || 'text/csv',
        file: fileObject,
      });
      
      // If no name is set yet, use the file name (without extension)
      if (!datasetName) {
        const nameWithoutExtension = asset.name.replace(/\.[^/.]+$/, "");
        setDatasetName(nameWithoutExtension);
      }
      
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };
  
  const handleUpload = async () => {
    if (!validateForm()) return;
    
    try {
      if (Platform.OS === 'web' && selectedFile?.file) {
        // On web with a file blob
        const newDataset = await uploadDataset(
          datasetName,
          datasetDescription,
          selectedFile.size,
          undefined,
          selectedFile.file
        );
        
        setDatasetName('');
        setDatasetDescription('');
        setSelectedFile(null);
        
        Alert.alert(
          'Upload Successful',
          'Your dataset has been uploaded and is being processed. You can run analysis once processing is complete.',
          [{ text: 'OK' }]
        );
        
        return;
      } else if (Platform.OS !== 'web' && selectedFile) {
        // On native platforms with a file URI
        const newDataset = await uploadDataset(
          datasetName,
          datasetDescription,
          selectedFile.size,
          selectedFile.uri
        );
        
        setDatasetName('');
        setDatasetDescription('');
        setSelectedFile(null);
        
        Alert.alert(
          'Upload Successful',
          'Your dataset has been uploaded and is being processed. Would you like to run analysis now?',
          [
            { 
              text: 'Later', 
              style: 'cancel' 
            },
            { 
              text: 'Run Analysis', 
              onPress: () => {
                selectDataset(newDataset.id);
                router.push('/analysis');
              }
            }
          ]
        );
        
        return;
      }
      
      // Fallback for simulation (no file selected)
      const newDataset = await uploadDataset(
        datasetName,
        datasetDescription,
        Math.random() * 5 * 1024 * 1024 // Random file size between 0-5MB
      );
      
      setDatasetName('');
      setDatasetDescription('');
      setSelectedFile(null);
      
      Alert.alert(
        'Upload Successful',
        'Your dataset has been uploaded and is being processed. You can run analysis once processing is complete.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Error', 'There was an error uploading your file. Please try again.');
    }
  };
  
  const handleDeleteDataset = (id: string) => {
    Alert.alert(
      'Delete Dataset',
      'Are you sure you want to delete this dataset? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteDataset(id),
        },
      ]
    );
  };
  
  const handleSelectDataset = (id: string) => {
    selectDataset(id);
    router.push(`/dataset/${id}`);
  };
  
  // Filter datasets to only show the current user's datasets
  const userDatasets = datasets.filter(dataset => 
    !dataset.userId || dataset.userId === userProfile?.id
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.uploadSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Upload New Dataset</Text>
          </View>
          
          <View style={[styles.uploadCard, shadows.small, { backgroundColor: colors.card }]}>
            <Input
              label="Dataset Name"
              placeholder="e.g., Q2 Customer Data"
              value={datasetName}
              onChangeText={setDatasetName}
              error={errors.name}
              leftIcon={<FileText size={18} color={colors.textSecondary} />}
            />
            
            <Input
              label="Description"
              placeholder="Describe what this dataset contains"
              value={datasetDescription}
              onChangeText={setDatasetDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={styles.textArea}
              error={errors.description}
              leftIcon={<Info size={18} color={colors.textSecondary} />}
            />
            
            <TouchableOpacity 
              style={[styles.filePickerContainer, { 
                borderColor: colors.border,
                backgroundColor: colors.surface
              }]}
              onPress={pickDocument}
            >
              <View style={styles.filePickerContent}>
                <File size={24} color={colors.primary} />
                <Text style={[styles.filePickerText, { color: colors.primary }]}>
                  {selectedFile ? selectedFile.name : 'Select CSV File'}
                </Text>
              </View>
              {selectedFile && (
                <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.uploadButtonContainer}>
              <Button
                title="Upload Dataset"
                onPress={handleUpload}
                variant="primary"
                icon={<UploadIcon size={18} color={colors.textLight} />}
              />
            </View>
            
            <View style={[styles.supportedFormatsContainer, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.supportedFormatsTitle, { color: colors.primary }]}>Supported Formats:</Text>
              <Text style={[styles.supportedFormatsText, { color: colors.textSecondary }]}>
                CSV, Excel (.xlsx, .xls), JSON
              </Text>
              <Text style={[styles.maxSizeText, { color: colors.textSecondary }]}>
                Maximum file size: 10MB
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.datasetsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Datasets</Text>
            <Text style={[styles.datasetCount, { color: colors.textSecondary }]}>{userDatasets.length} datasets</Text>
          </View>
          
          {userDatasets.length > 0 ? (
            <>
              {userDatasets.map(dataset => (
                <DatasetCard
                  key={dataset.id}
                  dataset={dataset}
                  onSelect={handleSelectDataset}
                  onDelete={handleDeleteDataset}
                />
              ))}
              
              {/* Added Apply ML Models button to match flow diagram */}
              <View style={styles.mlButtonContainer}>
                <Button
                  title="Apply ML Models to Selected Dataset"
                  onPress={() => {
                    if (!useAppStore.getState().selectedDatasetId) {
                      Alert.alert('No Dataset Selected', 'Please select a dataset first.');
                      return;
                    }
                    router.push('/analysis');
                  }}
                  variant="outline"
                  icon={<Brain size={18} color={colors.primary} />}
                />
              </View>
            </>
          ) : (
            <View style={[styles.emptyDatasets, shadows.small, { backgroundColor: colors.card }]}>
              <FilePlus size={32} color={colors.textTertiary} />
              <Text style={[styles.emptyDatasetsText, { color: colors.textSecondary }]}>
                No datasets yet. Upload your first dataset to get started.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <LoadingOverlay visible={isLoading} message="Uploading dataset..." />
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
  uploadSection: {
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
  },
  uploadCard: {
    borderRadius: 12,
    padding: 16,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  filePickerContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  filePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filePickerText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    marginTop: 8,
    fontSize: 12,
  },
  uploadButtonContainer: {
    marginTop: 16,
  },
  supportedFormatsContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  supportedFormatsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  supportedFormatsText: {
    fontSize: 12,
  },
  maxSizeText: {
    fontSize: 12,
    marginTop: 4,
  },
  datasetsSection: {
    marginBottom: 24,
  },
  datasetCount: {
    fontSize: 14,
  },
  emptyDatasets: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDatasetsText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  mlButtonContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
});