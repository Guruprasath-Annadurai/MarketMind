import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users, DollarSign, Activity, AlertTriangle } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { CustomerSegment } from '@/types';

interface SegmentCardProps {
  segment: CustomerSegment;
}

export const SegmentCard: React.FC<SegmentCardProps> = ({ segment }) => {
  const { name, size, percentage, avgLtv, avgEngagement, churnRisk, color } = segment;
  const { colors, shadows } = useAppTheme();
  
  const getChurnRiskLevel = (risk: number) => {
    if (risk < 0.1) return 'Low';
    if (risk < 0.3) return 'Medium';
    return 'High';
  };
  
  const getChurnRiskColor = (risk: number) => {
    if (risk < 0.1) return colors.success;
    if (risk < 0.3) return colors.warning;
    return colors.danger;
  };
  
  return (
    <View style={[styles.card, shadows.small, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.colorIndicator, { backgroundColor: color }]} />
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Users size={16} color={colors.textSecondary} />
          <View style={styles.statTextContainer}>
            <Text style={[styles.statValue, { color: colors.text }]}>{size.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{percentage}% of total</Text>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <DollarSign size={16} color={colors.textSecondary} />
          <View style={styles.statTextContainer}>
            <Text style={[styles.statValue, { color: colors.text }]}>${avgLtv}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg. LTV</Text>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <Activity size={16} color={colors.textSecondary} />
          <View style={styles.statTextContainer}>
            <Text style={[styles.statValue, { color: colors.text }]}>{(avgEngagement * 100).toFixed(0)}%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Engagement</Text>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <AlertTriangle size={16} color={getChurnRiskColor(churnRisk)} />
          <View style={styles.statTextContainer}>
            <Text style={[styles.statValue, { color: getChurnRiskColor(churnRisk) }]}>
              {getChurnRiskLevel(churnRisk)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Churn Risk</Text>
          </View>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  statTextContainer: {
    marginLeft: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
  },
});