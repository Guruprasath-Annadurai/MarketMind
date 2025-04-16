import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mail, ArrowUpRight, Clock, Target, BarChart, Share2 } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { CampaignSuggestion } from '@/types';

interface CampaignCardProps {
  campaign: CampaignSuggestion;
  onExport?: () => void;
  onShare?: () => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ 
  campaign,
  onExport,
  onShare,
}) => {
  const { title, description, targetSegment, expectedImpact, difficulty, channels } = campaign;
  const { colors, shadows } = useAppTheme();
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return colors.success;
      case 'medium': return colors.warning;
      case 'hard': return colors.danger;
      default: return colors.textSecondary;
    }
  };
  
  return (
    <View style={[styles.card, shadows.small, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Mail size={18} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
      </View>
      
      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={3}>{description}</Text>
      
      <View style={styles.metadataContainer}>
        <View style={styles.metadataItem}>
          <Target size={14} color={colors.textSecondary} />
          <Text style={[styles.metadataText, { color: colors.textSecondary }]}>{targetSegment}</Text>
        </View>
        
        <View style={styles.metadataItem}>
          <BarChart size={14} color={colors.textSecondary} />
          <Text style={[styles.metadataText, { color: colors.textSecondary }]}>+{(expectedImpact * 100).toFixed(0)}% impact</Text>
        </View>
        
        <View style={styles.metadataItem}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={[
            styles.metadataText, 
            { color: getDifficultyColor(difficulty) }
          ]}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.channelsContainer}>
          {channels.map((channel, index) => (
            <View key={index} style={[styles.channelBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.channelText, { color: colors.primary }]}>{channel}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.actionsContainer}>
          {onShare && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onShare}
            >
              <Share2 size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          
          {onExport && (
            <TouchableOpacity 
              style={[styles.exportButton, { backgroundColor: colors.primaryLight }]}
              onPress={onExport}
            >
              <Text style={[styles.exportText, { color: colors.primary }]}>Export</Text>
              <ArrowUpRight size={14} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
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
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  metadataContainer: {
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  channelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  channelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  channelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exportText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
});