import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { MetricCard as MetricCardType } from '@/types';

interface MetricCardProps {
  metric: MetricCardType;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const { title, value, change, color } = metric;
  const { colors, shadows } = useAppTheme();
  
  const isPositiveChange = change && change > 0;
  const changeColor = isPositiveChange ? colors.success : colors.danger;
  
  return (
    <View style={[styles.card, shadows.small, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      </View>
      <Text style={[styles.value, { color: color || colors.text }]}>{value}</Text>
      {change !== undefined && (
        <View style={styles.changeContainer}>
          {isPositiveChange ? (
            <ArrowUpRight size={16} color={changeColor} />
          ) : (
            <ArrowDownRight size={16} color={changeColor} />
          )}
          <Text style={[styles.changeText, { color: changeColor }]}>
            {Math.abs(change)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flex: 1,
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});