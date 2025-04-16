import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  User, 
  LogOut, 
  Bell, 
  Lock, 
  Globe, 
  HelpCircle,
  ChevronRight,
  CreditCard,
  Briefcase,
} from 'lucide-react-native';
import { colors, shadows } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';

export default function SettingsScreen() {
  const router = useRouter();
  const { userProfile, logout } = useAppStore();
  
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => {
            logout();
          }
        },
      ]
    );
  };
  
  const handleUpgradePlan = () => {
    Alert.alert(
      'Upgrade Plan',
      'This would navigate to the subscription management page.',
      [{ text: 'OK' }]
    );
  };
  
  // Helper function to format plan name with proper capitalization
  const formatPlanName = (plan?: string) => {
    if (!plan) return 'Free';
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {userProfile?.name ? userProfile.name.charAt(0) : 'U'}
              </Text>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{userProfile?.email || 'user@example.com'}</Text>
              <View style={styles.planBadge}>
                <Text style={styles.planText}>
                  {formatPlanName(userProfile?.plan)} Plan
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => Alert.alert('Edit Profile', 'This would open the profile editor.')}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={[styles.settingsCard, shadows.small]}>
            <TouchableOpacity style={styles.settingsItem} onPress={handleUpgradePlan}>
              <View style={styles.settingsItemLeft}>
                <CreditCard size={20} color={colors.primary} />
                <Text style={styles.settingsItemText}>Subscription</Text>
              </View>
              <View style={styles.settingsItemRight}>
                <Text style={styles.settingsItemValue}>{formatPlanName(userProfile?.plan)}</Text>
                <ChevronRight size={18} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Briefcase size={20} color={colors.primary} />
                <Text style={styles.settingsItemText}>Company</Text>
              </View>
              <View style={styles.settingsItemRight}>
                <Text style={styles.settingsItemValue}>{userProfile?.company || 'Not set'}</Text>
                <ChevronRight size={18} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Lock size={20} color={colors.primary} />
                <Text style={styles.settingsItemText}>Password & Security</Text>
              </View>
              <ChevronRight size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={[styles.settingsCard, shadows.small]}>
            <View style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Bell size={20} color={colors.primary} />
                <Text style={styles.settingsItemText}>Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={notificationsEnabled ? colors.primary : colors.textTertiary}
              />
            </View>
            
            <View style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Globe size={20} color={colors.primary} />
                <Text style={styles.settingsItemText}>Dark Mode</Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={darkModeEnabled ? colors.primary : colors.textTertiary}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <View style={[styles.settingsCard, shadows.small]}>
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <HelpCircle size={20} color={colors.primary} />
                <Text style={styles.settingsItemText}>Help & Support</Text>
              </View>
              <ChevronRight size={18} color={colors.textTertiary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <User size={20} color={colors.primary} />
                <Text style={styles.settingsItemText}>Privacy Policy</Text>
              </View>
              <ChevronRight size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
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
  profileSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...shadows.small,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textLight,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  planBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  planText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  editProfileButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  settingsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemValue: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger + '10',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.danger,
    marginLeft: 8,
  },
  versionText: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 16,
  },
});