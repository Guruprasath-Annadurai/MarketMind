import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Users, 
  Database, 
  BarChart2, 
  Mail, 
  Settings,
  Download,
  RefreshCw,
  UserCheck,
  UserX,
  ChevronRight,
  Search,
  Shield
} from 'lucide-react-native';
import { colors, shadows } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LoadingOverlay } from '@/components/LoadingOverlay';

// Mock admin data
const mockUsers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    company: 'Acme Inc',
    plan: 'pro',
    datasets: 3,
    lastActive: '2023-07-15T10:30:00Z',
    status: 'active'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    company: 'XYZ Corp',
    plan: 'enterprise',
    datasets: 7,
    lastActive: '2023-07-14T16:45:00Z',
    status: 'active'
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael@example.com',
    company: 'ABC Ltd',
    plan: 'free',
    datasets: 1,
    lastActive: '2023-07-10T09:15:00Z',
    status: 'inactive'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    company: 'Tech Solutions',
    plan: 'pro',
    datasets: 4,
    lastActive: '2023-07-13T14:20:00Z',
    status: 'active'
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david@example.com',
    company: 'Global Systems',
    plan: 'enterprise',
    datasets: 12,
    lastActive: '2023-07-15T11:10:00Z',
    status: 'active'
  }
];

// Mock system stats
const mockSystemStats = {
  totalUsers: 127,
  activeUsers: 98,
  totalDatasets: 342,
  totalPredictions: 215,
  totalCampaigns: 156,
  avgProcessingTime: 2.3, // seconds
  systemUptime: 99.8, // percentage
  apiCalls: {
    today: 1243,
    week: 8765,
    month: 34521
  }
};

export default function AdminScreen() {
  const router = useRouter();
  const { userProfile, isAuthenticated } = useAuthStore();
  const { isLoading } = useAppStore();
  
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Check if user is admin and redirect if not
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'Please log in to access this page.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
      return;
    }
    
    if (userProfile?.plan !== 'enterprise') {
      Alert.alert(
        'Access Denied',
        'You do not have permission to access the admin panel.',
        [{ text: 'OK', onPress: () => router.replace('/') }]
      );
    }
  }, [isAuthenticated, userProfile, router]);
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.company.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      Alert.alert('Data Refreshed', 'Admin data has been updated.');
    }, 1500);
  };
  
  // Export data
  const handleExport = () => {
    Alert.alert(
      'Export Data',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'CSV', 
          onPress: () => {
            if (Platform.OS === 'web') {
              Alert.alert('Export', 'CSV export initiated. Check your downloads folder.');
            } else {
              Alert.alert('Export', 'CSV export is not available on mobile. Please use the web version.');
            }
          }
        },
        { 
          text: 'JSON', 
          onPress: () => {
            if (Platform.OS === 'web') {
              Alert.alert('Export', 'JSON export initiated. Check your downloads folder.');
            } else {
              Alert.alert('Export', 'JSON export is not available on mobile. Please use the web version.');
            }
          }
        },
      ]
    );
  };
  
  // Toggle user status
  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
    
    // Show confirmation
    const user = users.find(u => u.id === userId);
    const newStatus = user?.status === 'active' ? 'inactive' : 'active';
    Alert.alert('Status Updated', `User ${user?.name} is now ${newStatus}.`);
  };
  
  // View user details
  const viewUserDetails = (userId: string) => {
    const user = users.find(u => u.id === userId);
    
    if (!user) return;
    
    Alert.alert(
      `${user.name}`,
      `Email: ${user.email}
Company: ${user.company}
Plan: ${user.plan}
Datasets: ${user.datasets}
Last Active: ${formatDate(user.lastActive)}
Status: ${user.status}`,
      [
        { text: 'Close', style: 'cancel' },
        { 
          text: 'Edit', 
          onPress: () => {
            Alert.alert('Edit User', 'User editing functionality coming soon.');
          }
        },
      ]
    );
  };
  
  // If not authenticated or not admin, show access denied
  if (!isAuthenticated || userProfile?.plan !== 'enterprise') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDeniedContainer}>
          <Shield size={48} color={colors.danger} />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedDescription}>
            You do not have permission to access the admin panel.
          </Text>
          <Button
            title="Go to Dashboard"
            onPress={() => router.replace('/')}
            variant="primary"
            style={styles.accessDeniedButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerDescription}>
            Manage users, view system statistics, and monitor platform usage.
          </Text>
        </View>
        
        <View style={styles.actionsContainer}>
          <Button
            title="Refresh Data"
            onPress={handleRefresh}
            variant="outline"
            icon={<RefreshCw size={16} color={colors.primary} />}
            style={styles.actionButton}
          />
          
          <Button
            title="Export Data"
            onPress={handleExport}
            variant="outline"
            icon={<Download size={16} color={colors.primary} />}
            style={styles.actionButton}
          />
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, shadows.small]}>
              <Users size={20} color={colors.primary} />
              <Text style={styles.statValue}>{mockSystemStats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            
            <View style={[styles.statCard, shadows.small]}>
              <Database size={20} color={colors.primary} />
              <Text style={styles.statValue}>{mockSystemStats.totalDatasets}</Text>
              <Text style={styles.statLabel}>Datasets</Text>
            </View>
            
            <View style={[styles.statCard, shadows.small]}>
              <BarChart2 size={20} color={colors.primary} />
              <Text style={styles.statValue}>{mockSystemStats.totalPredictions}</Text>
              <Text style={styles.statLabel}>Predictions</Text>
            </View>
            
            <View style={[styles.statCard, shadows.small]}>
              <Mail size={20} color={colors.primary} />
              <Text style={styles.statValue}>{mockSystemStats.totalCampaigns}</Text>
              <Text style={styles.statLabel}>Campaigns</Text>
            </View>
          </View>
          
          <View style={[styles.apiUsageCard, shadows.small]}>
            <Text style={styles.apiUsageTitle}>API Usage</Text>
            
            <View style={styles.apiUsageStats}>
              <View style={styles.apiUsageStat}>
                <Text style={styles.apiUsageValue}>{mockSystemStats.apiCalls.today.toLocaleString()}</Text>
                <Text style={styles.apiUsageLabel}>Today</Text>
              </View>
              
              <View style={styles.apiUsageStat}>
                <Text style={styles.apiUsageValue}>{mockSystemStats.apiCalls.week.toLocaleString()}</Text>
                <Text style={styles.apiUsageLabel}>This Week</Text>
              </View>
              
              <View style={styles.apiUsageStat}>
                <Text style={styles.apiUsageValue}>{mockSystemStats.apiCalls.month.toLocaleString()}</Text>
                <Text style={styles.apiUsageLabel}>This Month</Text>
              </View>
            </View>
            
            <View style={styles.systemMetrics}>
              <View style={styles.systemMetric}>
                <Text style={styles.systemMetricLabel}>Avg. Processing Time:</Text>
                <Text style={styles.systemMetricValue}>{mockSystemStats.avgProcessingTime}s</Text>
              </View>
              
              <View style={styles.systemMetric}>
                <Text style={styles.systemMetricLabel}>System Uptime:</Text>
                <Text style={styles.systemMetricValue}>{mockSystemStats.systemUptime}%</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>User Management</Text>
          
          <View style={styles.searchContainer}>
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<Search size={18} color={colors.textSecondary} />}
            />
          </View>
          
          <View style={[styles.usersTable, shadows.small]}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>User</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Plan</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Datasets</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
              <Text style={[styles.tableHeaderCell, { width: 40 }]}></Text>
            </View>
            
            {filteredUsers.map(user => (
              <View key={user.id} style={styles.tableRow}>
                <View style={[styles.tableCell, { flex: 2 }]}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                
                <View style={[styles.tableCell, { flex: 1 }]}>
                  <View style={[
                    styles.planBadge,
                    { 
                      backgroundColor: 
                        user.plan === 'enterprise' ? colors.secondary + '20' : 
                        user.plan === 'pro' ? colors.primary + '20' : 
                        colors.textTertiary + '20'
                    }
                  ]}>
                    <Text style={[
                      styles.planText,
                      { 
                        color: 
                          user.plan === 'enterprise' ? colors.secondary : 
                          user.plan === 'pro' ? colors.primary : 
                          colors.textSecondary
                      }
                    ]}>
                      {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {user.datasets}
                </Text>
                
                <View style={[styles.tableCell, { flex: 1 }]}>
                  <TouchableOpacity
                    onPress={() => toggleUserStatus(user.id)}
                  >
                    {user.status === 'active' ? (
                      <UserCheck size={18} color={colors.success} />
                    ) : (
                      <UserX size={18} color={colors.danger} />
                    )}
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={[styles.tableCell, { width: 40 }]}
                  onPress={() => viewUserDetails(user.id)}
                >
                  <ChevronRight size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
            
            {filteredUsers.length === 0 && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No users found matching "{searchQuery}"</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>System Settings</Text>
          
          <View style={[styles.settingsCard, shadows.small]}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => Alert.alert('General Settings', 'This feature is coming soon.')}
            >
              <Settings size={18} color={colors.textSecondary} />
              <Text style={styles.settingText}>General Settings</Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => Alert.alert('ML Model Configuration', 'This feature is coming soon.')}
            >
              <Database size={18} color={colors.textSecondary} />
              <Text style={styles.settingText}>ML Model Configuration</Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => Alert.alert('Email Templates', 'This feature is coming soon.')}
            >
              <Mail size={18} color={colors.textSecondary} />
              <Text style={styles.settingText}>Email Templates</Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => Alert.alert('User Permissions', 'This feature is coming soon.')}
            >
              <Users size={18} color={colors.textSecondary} />
              <Text style={styles.settingText}>User Permissions</Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <LoadingOverlay visible={isLoading || isRefreshing} message="Loading data..." />
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
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  actionButton: {
    marginRight: 12,
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    width: '45%',
    minWidth: 140,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  apiUsageCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  apiUsageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  apiUsageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  apiUsageStat: {
    alignItems: 'center',
  },
  apiUsageValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  apiUsageLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  systemMetrics: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
  },
  systemMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  systemMetricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  systemMetricValue: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  usersSection: {
    marginBottom: 24,
  },
  searchContainer: {
    marginBottom: 16,
  },
  usersTable: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
  },
  tableCell: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  planText: {
    fontSize: 12,
    fontWeight: '500',
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
  noResultsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  accessDeniedButton: {
    minWidth: 200,
  },
});