import { View, FlatList, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { theme, formatPrice } from '../../constants/theme';
import { useCart, useRemoveFromCart, useUpdateCartItem } from '../../hooks/useCart';
import { CartItem } from '../../lib/cart';

export default function CartScreen() {
  const router = useRouter();
  const { data: cart, isLoading } = useCart();
  const removeItem = useRemoveFromCart();
  const updateItem = useUpdateCartItem();

  const handleRemoveItem = (itemId: number) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem.mutate(itemId) },
    ]);
  };

  const handleQuantityChange = (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    updateItem.mutate({ itemId, quantity });
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.product.image }} style={styles.image} contentFit="cover" />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
        <View style={styles.quantity}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
          >
            <Text style={styles.quantityText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
          >
            <Text style={styles.quantityText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.removeButton}>
        <Text style={styles.removeText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const subtotal = cart?.subtotal || 0;
  const shipping = cart?.shipping || 0;
  const tax = cart?.tax || 0;
  const total = cart?.total || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Cart</Text>
        <Text style={styles.subtitle}>{cart?.items.length || 0} items</Text>
      </View>

      {!cart?.items.length ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart.items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
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
            <TouchableOpacity style={styles.checkoutButton} onPress={() => router.push('/checkout')}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  header: { padding: theme.spacing.lg, backgroundColor: theme.colors.white },
  title: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  subtitle: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  list: { padding: theme.spacing.lg },
  cartItem: { flexDirection: 'row', backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, padding: theme.spacing.md },
  image: { width: 80, height: 80, borderRadius: theme.borderRadius.md },
  itemInfo: { flex: 1, marginLeft: theme.spacing.md },
  itemName: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.medium, color: theme.colors.text },
  itemPrice: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.primary, marginTop: theme.spacing.xs },
  quantity: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm },
  quantityButton: { width: 28, height: 28, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  quantityText: { fontSize: theme.fontSize.lg, color: theme.colors.text },
  quantityValue: { fontSize: theme.fontSize.md, marginHorizontal: theme.spacing.md },
  removeButton: { position: 'absolute', top: theme.spacing.sm, right: theme.spacing.sm },
  removeText: { fontSize: theme.fontSize.xl, color: theme.colors.error },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg },
  emptyIcon: { fontSize: 64, marginBottom: theme.spacing.lg },
  emptyText: { fontSize: theme.fontSize.lg, color: theme.colors.textSecondary },
  shopButton: { marginTop: theme.spacing.lg, backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.lg },
  shopButtonText: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.white },
  summary: { padding: theme.spacing.lg, backgroundColor: theme.colors.white, borderTopWidth: 1, borderTopColor: theme.colors.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  summaryLabel: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  summaryValue: { fontSize: theme.fontSize.md, color: theme.colors.text },
  totalRow: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm, marginTop: theme.spacing.sm },
  totalLabel: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  totalValue: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },
  checkoutButton: { backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.lg, alignItems: 'center', marginTop: theme.spacing.md },
  checkoutButtonText: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.white },
});