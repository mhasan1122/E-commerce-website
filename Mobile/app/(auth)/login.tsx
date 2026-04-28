import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { theme } from '../../constants/theme';
import { authApi, AuthCredentials } from '../../lib/auth';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<AuthCredentials>({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!credentials.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(credentials.email)) newErrors.email = 'Invalid email';
    if (!credentials.password) newErrors.password = 'Password is required';
    else if (credentials.password.length < 6) newErrors.password = 'Password must be at least 6 chars';
    setErrors(newErrors);
    console.log('[auth][login] validate', {
      ok: Object.keys(newErrors).length === 0,
      emailPresent: Boolean(credentials.email),
      passwordLength: credentials.password?.length ?? 0,
      errors: newErrors,
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    console.log('[auth][login] pressed', { email: credentials.email });
    if (!validate()) return;
    setLoading(true);
    try {
      console.log('[auth][login] calling api');
      const { token, user } = await authApi.login(credentials);
      console.log('[auth][login] api success', {
        hasToken: Boolean(token),
        userKeys: user ? Object.keys(user as any) : null,
      });
      await setToken(token);
      setUser(user);
      console.log('[auth][login] stored auth; navigating to /(tabs)');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.log('[auth][login] api error', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue shopping</Text>
        </View>
        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={credentials.email}
            onChangeText={(text: string) => setCredentials({ ...credentials, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={credentials.password}
            onChangeText={(text: string) => setCredentials({ ...credentials, password: text })}
            secureTextEntry
            error={errors.password}
          />
          <Button title="Sign In" onPress={handleLogin} loading={loading} style={styles.button} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
  },
  title: {
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  form: {
    gap: theme.spacing.lg,
  },
  button: {
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing['2xl'],
  },
  footerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  link: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
});