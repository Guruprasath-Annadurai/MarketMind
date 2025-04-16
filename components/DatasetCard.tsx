import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Database, Calendar, Trash2 } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Dataset } from '@/types';

interface DatasetCardProps {
  dataset: Dataset;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
}

export const DatasetCard: React.FC<DatasetCardProps> = ({ 
  dataset, 
  onSelect, 
  onDelete,
  isSelected = false,
}) => {
  const { id, name, description, createdAt, rowCount, columnCount, status } = dataset;
  const { colors, shadows } = useAppTheme();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return colors.success;
      case 'processing': return colors.warning;
      case 'error': return colors.danger;
      default: return colors.textSecondary;
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        shadows.small,
        { 
          backgroundColor: colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
          borderWidth: 1
        },
        isSelected && { backgroundColor: colors.primaryLight }
      ]} 
      onPress={() => onSelect(id)}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Database size={18} color={colors.primary} />
          <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>{description}</Text>
      
      <View style={styles.metadataContainer}>
        <View style={styles.metadataItem}>
          <Calendar size={14} color={colors.textSecondary} />
          <Text style={[styles.metadataText, { color: colors.textSecondary }]}>{formatDate(createdAt)}</Text>
        </View>
        <View style={styles.metadataItem}>
          <Text style={[styles.metadataText, { color: colors.textSecondary }]}>{rowCount.toLocaleString()} rows</Text>
        </View>
        <View style={styles.metadataItem}>
          <Text style={[styles.metadataText, { color: colors.textSecondary }]}>{columnCount} columns</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.fileSize, { color: colors.textTertiary }]}>{formatFileSize(dataset.fileSize)}</Text>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => onDelete(id)}
        >
          <Trash2 size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  metadataContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metadataText: {
    fontSize: 12,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileSize: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
});