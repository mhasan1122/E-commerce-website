import { View, Text, ScrollView, StyleSheet, Image, ResizeMode } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { theme, formatPrice } from '../../constants/theme';
import { useOrder } from '../../hooks/useOrders';
import { Order, OrderStatus } from '../../lib/orders';
import { Skeleton } from '../../components/ui/Skeleton';

const statusSteps: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const orderId = Number(id);
  
  const { data: order, isLoading } = useOrder(orderId);
  const currentStep = statusSteps.indexOf(order?.status || 'pending');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.backButton} onPress={() => router.back()}>←</Text>
          <Text style={styles.title}>Order Details</Text>
        </View>
        <View style={styles.loading}>
          <Skeleton height={200} />
          <View style={{ padding: 16, gap: 12 }}>
            <Skeleton height={20} width="60%" />
            <Skeleton height={16} width="80%" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text>Order not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.backButton} onPress={() => router.back()}>←</Text>
          <Text style={styles.title}>Order #{order.id}</Text>
        </View>

        <View style={styles.statusTimeline}>
          {statusSteps.map((step, index) => (
            <View key={step} style={styles.statusStep}>
              <View
                style={[
                  styles.statusDot,
                  index <= currentStep && styles.statusDotActive,
                ]}
              >
                {index <= currentStep && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text
                style={[
                  styles.statusLabel,
                  index <= currentStep && styles.statusLabelActive,
                ]}
              >
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressName}>{order.shippingAddress.name}</Text>
            <Text style={styles.addressText}>{order.shippingAddress.phone}</Text>
            <Text style={styles.addressText}>{order.shippingAddress.address}</Text>
            <Text style={styles.addressText}>
              {order.shippingAddress.city}, {order.shippingAddress.district}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Image
                source={{ uri: item.product.image }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(order.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>{formatPrice(order.shipping)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>{formatPrice(order.tax)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.white, gap: theme.spacing.md },
  backButton: { fontSize: 20, color: theme.colors.text },
  title: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  loading: { padding: theme.spacing.lg },
  statusTimeline: { flexDirection: 'row', padding: theme.spacing.lg, backgroundColor: theme.colors.white, marginBottom: theme.spacing.lg },
  statusStep: { flex: 1, alignItems: 'center' },
  statusDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.xs },
  statusDotActive: { backgroundColor: theme.colors.success },
  checkmark: { fontSize: 12, color: theme.colors.white },
  statusLabel: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted },
  statusLabelActive: { color: theme.colors.success, fontWeight: theme.fontWeight.semibold },
  section: { padding: theme.spacing.lg, backgroundColor: theme.colors.white, marginBottom: theme.spacing.lg },
  sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginBottom: theme.spacing.md },
  addressCard: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.md },
  addressName: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.text },
  addressText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  orderItem: { flexDirection: 'row', padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  itemImage: { width: 60, height: 60, borderRadius: theme.borderRadius.md },
  itemInfo: { flex: 1, marginLeft: theme.spacing.md },
  itemName: { fontSize: theme.fontSize.md, color: theme.colors.text },
  itemQuantity: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  itemPrice: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.primary },
  summary: { backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  summaryLabel: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  summaryValue: { fontSize: theme.fontSize.md, color: theme.colors.text },
  totalRow: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm, marginTop: theme.spacing.sm },
  totalLabel: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  totalValue: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },
});