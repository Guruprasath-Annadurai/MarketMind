import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowLeft, 
  AlertCircle,
  CheckCircle,
  Building
} from 'lucide-react-native';
import { colors, shadows } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: ''
  });
  
  // Clear any auth errors when component mounts
  useEffect(() => {
    clearError();
  }, []);
  
  const validateForm = () => {
    const errors = {
      name: '',
      email: '',
      company: '',
      password: '',
      confirmPassword: ''
    };
    let isValid = true;
    
    // Name validation
    if (!name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Company validation
    if (!company.trim()) {
      errors.company = 'Company name is required';
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };
  
  const handleRegister = async () => {
    if (!validateForm()) return;
    
    try {
      const success = await register(email, password, name);
      
      if (success) {
        Alert.alert(
          'Registration Successful',
          'Your account has been created successfully. You can now sign in.',
          [
            { 
              text: 'OK', 
              onPress: () => router.replace('/') 
            }
          ]
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Error', 'An unexpected error occurred. Please try again.');
    }
  };
  
  const navigateToLogin = () => {
    router.push('/login');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={navigateToLogin}
          >
            <ArrowLeft size={20} color={colors.text} />
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop' }}
              style={styles.logoImage}
            />
            <Text style={styles.logoText}>MarketMind AI</Text>
            <Text style={styles.logoSubtext}>Customer Intelligence Platform</Text>
          </View>
          
          <View style={[styles.formContainer, shadows.medium]}>
            <Text style={styles.formTitle}>Create Account</Text>
            
            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              leftIcon={<User size={18} color={colors.textSecondary} />}
              error={validationErrors.name}
            />
            
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={colors.textSecondary} />}
              error={validationErrors.email}
            />
            
            <Input
              label="Company"
              placeholder="Enter your company name"
              value={company}
              onChangeText={setCompany}
              leftIcon={<Building size={18} color={colors.textSecondary} />}
              error={validationErrors.company}
            />
            
            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Lock size={18} color={colors.textSecondary} />}
              error={validationErrors.password}
            />
            
            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon={<Lock size={18} color={colors.textSecondary} />}
              error={validationErrors.confirmPassword}
            />
            
            <View style={styles.passwordRequirements}>
              <View style={styles.requirementItem}>
                <CheckCircle size={14} color={password.length >= 6 ? colors.success : colors.textTertiary} />
                <Text style={[
                  styles.requirementText,
                  password.length >= 6 && styles.requirementMet
                ]}>
                  At least 6 characters
                </Text>
              </View>
              
              <View style={styles.requirementItem}>
                <CheckCircle size={14} color={/[A-Z]/.test(password) ? colors.success : colors.textTertiary} />
                <Text style={[
                  styles.requirementText,
                  /[A-Z]/.test(password) && styles.requirementMet
                ]}>
                  At least one uppercase letter
                </Text>
              </View>
              
              <View style={styles.requirementItem}>
                <CheckCircle size={14} color={/[0-9]/.test(password) ? colors.success : colors.textTertiary} />
                <Text style={[
                  styles.requirementText,
                  /[0-9]/.test(password) && styles.requirementMet
                ]}>
                  At least one number
                </Text>
              </View>
            </View>
            
            <Button
              title="Create Account"
              onPress={handleRegister}
              variant="primary"
              style={styles.registerButton}
            />
          </View>
          
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <LoadingOverlay visible={isLoading} message="Creating account..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  formContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    marginLeft: 8,
    flex: 1,
  },
  passwordRequirements: {
    marginBottom: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: 8,
  },
  requirementMet: {
    color: colors.success,
  },
  registerButton: {
    marginBottom: 8,
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
  },
});