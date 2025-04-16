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
  LogIn, 
  UserPlus, 
  AlertCircle,
  ChevronRight
} from 'lucide-react-native';
import { colors, shadows } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: ''
  });
  
  // Clear any auth errors when component mounts
  useEffect(() => {
    clearError();
  }, []);
  
  const validateForm = () => {
    const errors = {
      email: '',
      password: ''
    };
    let isValid = true;
    
    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
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
    
    setValidationErrors(errors);
    return isValid;
  };
  
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      const success = await login(email, password);
      
      if (success) {
        // Navigation will be handled by the protected route hook in _layout.tsx
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Error', 'An unexpected error occurred. Please try again.');
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      const success = await loginWithGoogle();
      
      if (success) {
        // Navigation will be handled by the protected route hook in _layout.tsx
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Login Error', 'An unexpected error occurred with Google login. Please try again.');
    }
  };
  
  const navigateToRegister = () => {
    router.push('/register');
  };
  
  const handleDemoLogin = async () => {
    try {
      const success = await login('demo@example.com', 'password123');
      
      if (success) {
        // Navigation will be handled by the protected route hook in _layout.tsx
      }
    } catch (error) {
      console.error('Demo login error:', error);
      Alert.alert('Login Error', 'An unexpected error occurred. Please try again.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop' }}
              style={styles.logoImage}
            />
            <Text style={styles.logoText}>MarketMind AI</Text>
            <Text style={styles.logoSubtext}>Customer Intelligence Platform</Text>
          </View>
          
          <View style={[styles.formContainer, shadows.medium]}>
            <Text style={styles.formTitle}>Sign In</Text>
            
            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
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
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Lock size={18} color={colors.textSecondary} />}
              error={validationErrors.password}
            />
            
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <Button
              title="Sign In"
              onPress={handleLogin}
              variant="primary"
              icon={<LogIn size={18} color={colors.textLight} />}
              style={styles.signInButton}
            />
            
            <View style={styles.orContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>
            
            <Button
              title="Sign In with Google"
              onPress={handleGoogleLogin}
              variant="outline"
              style={styles.googleButton}
            />
            
            <Button
              title="Try Demo Account"
              onPress={handleDemoLogin}
              variant="outline"
              style={styles.demoButton}
            />
          </View>
          
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity 
              style={styles.registerButton}
              onPress={navigateToRegister}
            >
              <Text style={styles.registerButtonText}>Sign Up</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <LoadingOverlay visible={isLoading} message="Signing in..." />
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
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 24,
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
    marginBottom: 24,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
  },
  signInButton: {
    marginBottom: 16,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  orText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: 16,
  },
  googleButton: {
    marginBottom: 12,
  },
  demoButton: {
    backgroundColor: colors.secondaryLight,
    borderColor: colors.secondary,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
});