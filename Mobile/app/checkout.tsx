import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, formatPrice } from '../constants/theme';
import { useCart, useClearCart } from '../hooks/useCart';
import { useCreateOrder } from '../hooks/useOrders';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ShippingAddress } from '../lib/orders';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: cart } = useCart();
  const clearCart = useClearCart();
  const createOrder = useCreateOrder();
  
  const [address, setAddress] = useState<ShippingAddress>({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    district: '',
  });

  const handlePlaceOrder = async () => {
    if (!address.name || !address.phone || !address.address || !address.city || !address.district) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const order = await createOrder.mutateAsync({ shippingAddress: address, paymentMethod: 'cod' });
      await clearCart.mutateAsync();
      router.replace(`/order/${order.id}`);
    } catch (error) {
      Alert.alert('Error', 'Could not place order');
    }
  };

  const subtotal = cart?.subtotal || 0;
  const shipping = cart?.shipping || 0;
  const tax = cart?.tax || 0;
  const total = cart?.total || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <View style={styles.form}>
          <Input
            label="Full Name"
            value={address.name}
            onChangeText={(text: string) => setAddress({ ...address, name: text })}
            placeholder="Enter your name"
          />
          <Input
            label="Phone"
            value={address.phone}
            onChangeText={(text: string) => setAddress({ ...address, phone: text })}
            keyboardType="phone-pad"
            placeholder="Enter your phone"
          />
          <Input
            label="Address"
            value={address.address}
            onChangeText={(text: string) => setAddress({ ...address, address: text })}
            placeholder="Enter your address"
          />
          <Input
            label="City"
            value={address.city}
            onChangeText={(text: string) => setAddress({ ...address, city: text })}
            placeholder="Enter city"
          />
          <Input
            label="District"
            value={address.district}
            onChangeText={(text: string) => setAddress({ ...address, district: text })}
            placeholder="Enter district"
          />
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentMethod}>
          <View style={styles.paymentOption}>
            <Text style={styles.paymentText}>Cash on Delivery (COD)</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>{formatPrice(shipping)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>{formatPrice(tax)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`Place Order - ${formatPrice(total)}`}
          onPress={handlePlaceOrder}
          loading={createOrder.isPending}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  header: { padding: theme.spacing.lg, backgroundColor: theme.colors.white },
  title: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  content: { padding: theme.spacing.lg },
  sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.md },
  form: { gap: theme.spacing.md },
  paymentMethod: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md },
  paymentOption: { flexDirection: 'row', alignItems: 'center' },
  paymentText: { fontSize: theme.fontSize.md, color: theme.colors.text },
  summary: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  summaryLabel: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  summaryValue: { fontSize: theme.fontSize.md, color: theme.colors.text },
  totalRow: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm, marginTop: theme.spacing.sm },
  totalLabel: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  totalValue: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },
  footer: { padding: theme.spacing.lg, backgroundColor: theme.colors.white, borderTopWidth: 1, borderTopColor: theme.colors.border },
});