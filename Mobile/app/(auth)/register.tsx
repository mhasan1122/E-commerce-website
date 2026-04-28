import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { theme } from '../../constants/theme';
import { authApi, RegisterData } from '../../lib/auth';
import { useAuthStore } from '../../store/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RegisterData>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    if (!data.name) newErrors.name = 'Name is required';
    if (!data.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = 'Invalid email';
    if (!data.password) newErrors.password = 'Password is required';
    else if (data.password.length < 6) newErrors.password = 'Password must be at least 6 chars';
    setErrors(newErrors);
    console.log('[auth][register] validate', {
      ok: Object.keys(newErrors).length === 0,
      namePresent: Boolean(data.name),
      emailPresent: Boolean(data.email),
      passwordLength: data.password?.length ?? 0,
      errors: newErrors,
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    console.log('[auth][register] pressed', { name: data.name, email: data.email });
    if (!validate()) return;
    setLoading(true);
    try {
      console.log('[auth][register] calling api');
      const { token, user } = await authApi.register(data);
      console.log('[auth][register] api success', {
        hasToken: Boolean(token),
        userKeys: user ? Object.keys(user as any) : null,
      });
      await setToken(token);
      setUser(user);
      console.log('[auth][register] stored auth; navigating to /(tabs)');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.log('[auth][register] api error', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      Alert.alert('Registration Failed', error.response?.data?.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start shopping</Text>
        </View>
        <View style={styles.form}>
          <Input
            label="Name"
            placeholder="Enter your name"
            value={data.name}
            onChangeText={(text: string) => setData({ ...data, name: text })}
            autoCapitalize="words"
            error={errors.name}
          />
          <Input
            label="Email"
            placeholder="Enter your email"
            value={data.email}
            onChangeText={(text: string) => setData({ ...data, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <Input
            label="Password"
            placeholder="Create a password"
            value={data.password}
            onChangeText={(text: string) => setData({ ...data, password: text })}
            secureTextEntry
            error={errors.password}
          />
          <Button title="Sign Up" onPress={handleRegister} loading={loading} style={styles.button} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.link}>Sign In</Text>
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