import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useOrders } from '../../hooks/useOrders';
import { authApi } from '../../lib/auth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: orders } = useOrders();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });

  const handleSave = async () => {
    try {
      await authApi.updateProfile(profile);
      setEditing(false);
      Alert.alert('Success', 'Profile updated');
    } catch (error) {
      Alert.alert('Error', 'Could not update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  const menuItems = [
    { icon: '📦', label: 'My Orders', onPress: () => router.push('/(tabs)/account') },
    { icon: '🎁', label: 'Wishlist', onPress: () => router.push('/(tabs)/wishlist') },
    { icon: '🛒', label: 'Cart', onPress: () => router.push('/(tabs)/cart') },
    { icon: '🔒', label: 'Change Password', onPress: () => {} },
    { icon: '📞', label: 'Contact Support', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
          </View>
          {editing ? (
            <View style={styles.editForm}>
              <Input label="Name" value={profile.name} onChangeText={(text) => setProfile({ ...profile, name: text })} />
              <Input label="Phone" value={profile.phone} onChangeText={(text) => setProfile({ ...profile, phone: text })} />
              <Input label="Address" value={profile.address} onChangeText={(text) => setProfile({ ...profile, address: text })} />
              <View style={styles.editButtons}>
                <Button title="Save" onPress={handleSave} variant="primary" />
                <Button title="Cancel" onPress={() => setEditing(false)} variant="outline" />
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Orders</Text>
          {orders?.slice(0, 3).map((order) => (
            <TouchableOpacity key={order.id} style={styles.orderItem} onPress={() => router.push(`/order/${order.id}`)}>
              <View>
                <Text style={styles.orderId}>Order #{order.id}</Text>
                <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={styles.orderStatus}>
                <Text style={[styles.statusText, { color: order.status === 'delivered' ? theme.colors.success : theme.colors.warning }]}>
                  {order.status}
                </Text>
                <Text style={styles.orderTotal}>৳{(order.total / 100).toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {orders && orders.length > 3 && (
            <TouchableOpacity style={styles.viewAll}>
              <Text style={styles.viewAllText}>View All Orders</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  content: { padding: theme.spacing.lg },
  profile: { alignItems: 'center', backgroundColor: theme.colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.lg },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.md },
  avatarText: { fontSize: theme.fontSize['3xl'], color: theme.colors.white, fontWeight: theme.fontWeight.bold },
  name: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  email: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  editButton: { marginTop: theme.spacing.md },
  editButtonText: { fontSize: theme.fontSize.md, color: theme.colors.primary, fontWeight: theme.fontWeight.semibold },
  editForm: { width: '100%', gap: theme.spacing.md },
  editButtons: { flexDirection: 'row', gap: theme.spacing.md },
  section: { backgroundColor: theme.colors.white, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.lg },
  sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginBottom: theme.spacing.md },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  orderId: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.medium, color: theme.colors.text },
  orderDate: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  orderStatus: { alignItems: 'flex-end' },
  statusText: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold, textTransform: 'capitalize' },
  orderTotal: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, marginTop: theme.spacing.xs },
  viewAll: { alignItems: 'center', marginTop: theme.spacing.md },
  viewAllText: { fontSize: theme.fontSize.md, color: theme.colors.primary },
  menu: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.lg },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  menuIcon: { fontSize: 20, marginRight: theme.spacing.md },
  menuLabel: { fontSize: theme.fontSize.md, color: theme.colors.text },
  logoutButton: { backgroundColor: theme.colors.error, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, alignItems: 'center' },
  logoutText: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.white },
});