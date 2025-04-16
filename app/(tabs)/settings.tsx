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
  Linking
} from 'react-native';
import { 
  User, 
  LogOut, 
  Moon, 
  Sun, 
  Monitor, 
  Shield, 
  Bell, 
  HelpCircle,
  ChevronRight,
  Trash2
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { useThemeStore, ThemeMode } from '@/store/theme-store';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Button } from '@/components/Button';

export default function SettingsScreen() {
  const router = useRouter();
  const { userProfile, logout } = useAuthStore();
  const { clearError } = useAppStore();
  const { themeMode, setThemeMode } = useThemeStore();
  const { colors, shadows, isDarkMode } = useAppTheme();
  
  const handleLogout = async () => {
    try {
      await logout();
      clearError(); // Clear any app errors
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Error', 'Failed to log out. Please try again.');
    }
  };
  
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'This feature is not implemented in the demo.');
          }
        },
      ]
    );
  };
  
  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };
  
  const openPrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy-policy');
  };
  
  const openTermsOfService = () => {
    Linking.openURL('https://example.com/terms-of-service');
  };
  
  const openHelpCenter = () => {
    Linking.openURL('https://example.com/help-center');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.headerDescription, { color: colors.textSecondary }]}>
            Manage your account and app preferences
          </Text>
        </View>
        
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
          
          <View style={[styles.card, { backgroundColor: colors.card }, shadows.small]}>
            <View style={styles.profileInfo}>
              <View style={[styles.profileAvatar, { backgroundColor: colors.primaryLight }]}>
                <User size={24} color={colors.primary} />
              </View>
              <View style={styles.profileDetails}>
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {userProfile?.name || 'User'}
                </Text>
                <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                  {userProfile?.email || 'user@example.com'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.settingsItem, { borderBottomColor: colors.border }]}
              onPress={() => Alert.alert('Profile', 'Edit profile feature is not implemented in the demo.')}
            >
              <Text style={[styles.settingsItemText, { color: colors.text }]}>Edit Profile</Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={handleLogout}
            >
              <Text style={[styles.settingsItemText, { color: colors.danger }]}>Log Out</Text>
              <LogOut size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
          
          <View style={[styles.card, { backgroundColor: colors.card }, shadows.small]}>
            <View style={styles.themeOptions}>
              <TouchableOpacity 
                style={[
                  styles.themeOption, 
                  themeMode === 'light' && [styles.themeOptionSelected, { borderColor: colors.primary }]
                ]}
                onPress={() => handleThemeChange('light')}
              >
                <View style={[styles.themeIconContainer, { backgroundColor: colors.primaryLight }]}>
                  <Sun size={20} color={colors.primary} />
                </View>
                <Text style={[styles.themeOptionText, { color: colors.text }]}>Light</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.themeOption, 
                  themeMode === 'dark' && [styles.themeOptionSelected, { borderColor: colors.primary }]
                ]}
                onPress={() => handleThemeChange('dark')}
              >
                <View style={[styles.themeIconContainer, { backgroundColor: colors.primaryLight }]}>
                  <Moon size={20} color={colors.primary} />
                </View>
                <Text style={[styles.themeOptionText, { color: colors.text }]}>Dark</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.themeOption, 
                  themeMode === 'system' && [styles.themeOptionSelected, { borderColor: colors.primary }]
                ]}
                onPress={() => handleThemeChange('system')}
              >
                <View style={[styles.themeIconContainer, { backgroundColor: colors.primaryLight }]}>
                  <Monitor size={20} color={colors.primary} />
                </View>
                <Text style={[styles.themeOptionText, { color: colors.text }]}>System</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notifications</Text>
          
          <View style={[styles.card, { backgroundColor: colors.card }, shadows.small]}>
            <View style={[styles.settingsItem, { borderBottomColor: colors.border }]}>
              <Text style={[styles.settingsItemText, { color: colors.text }]}>Push Notifications</Text>
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={colors.primary}
              />
            </View>
            
            <View style={[styles.settingsItem, { borderBottomColor: colors.border }]}>
              <Text style={[styles.settingsItemText, { color: colors.text }]}>Email Notifications</Text>
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={colors.primary}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => Alert.alert('Notification Settings', 'This feature is not implemented in the demo.')}
            >
              <Text style={[styles.settingsItemText, { color: colors.text }]}>Manage Notification Settings</Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Help & Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Help & Support</Text>
          
          <View style={[styles.card, { backgroundColor: colors.card }, shadows.small]}>
            <TouchableOpacity 
              style={[styles.settingsItem, { borderBottomColor: colors.border }]}
              onPress={openHelpCenter}
            >
              <Text style={[styles.settingsItemText, { color: colors.text }]}>Help Center</Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingsItem, { borderBottomColor: colors.border }]}
              onPress={openPrivacyPolicy}
            >
              <Text style={[styles.settingsItemText, { color: colors.text }]}>Privacy Policy</Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={openTermsOfService}
            >
              <Text style={[styles.settingsItemText, { color: colors.text }]}>Terms of Service</Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.danger }]}>Danger Zone</Text>
          
          <View style={[styles.card, { backgroundColor: colors.card }, shadows.small]}>
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={handleDeleteAccount}
            >
              <Text style={[styles.settingsItemText, { color: colors.danger }]}>Delete Account</Text>
              <Trash2 size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textTertiary }]}>
            MarketMind AI v1.0.0
          </Text>
        </View>
      </ScrollView>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDetails: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingsItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  themeOption: {
    alignItems: 'center',
    width: '30%',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 8,
    padding: 12,
  },
  themeOptionSelected: {
    borderWidth: 2,
  },
  themeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  versionText: {
    fontSize: 12,
  },
});