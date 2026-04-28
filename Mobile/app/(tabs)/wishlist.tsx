import { View, FlatList, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { theme, formatPrice } from '../../constants/theme';
import { useWishlist, useRemoveFromWishlist } from '../../hooks/useWishlist';
import { useAddToCart as useAddToCartFromCart } from '../../hooks/useCart';
import { WishlistItem } from '../../lib/wishlist';

export default function WishlistScreen() {
  const router = useRouter();
  const { data: wishlist, isLoading } = useWishlist();
  const removeItem = useRemoveFromWishlist();
  const addToCart = useAddToCartFromCart();

  const handleRemove = (productId: number) => {
    Alert.alert('Remove from Wishlist', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem.mutate(productId) },
    ]);
  };

  const handleMoveToCart = (productId: number) => {
    addToCart.mutate(
      { productId, quantity: 1 },
      { onSuccess: () => Alert.alert('Added to Cart') }
    );
  };

  const renderItem = ({ item }: { item: WishlistItem }) => (
    <View style={styles.wishlistItem}>
      <TouchableOpacity onPress={() => router.push(`/product/${item.product.id}`)}>
        <Image source={{ uri: item.product.image }} style={styles.image} contentFit="cover" />
      </TouchableOpacity>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.product.price)}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cartButton} onPress={() => handleMoveToCart(item.productId)}>
            <Text style={styles.cartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item.productId)}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.subtitle}>{wishlist?.length || 0} items</Text>
      </View>

      {!wishlist?.length ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>❤️</Text>
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.shopButtonText}>Explore Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
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
  wishlistItem: { flexDirection: 'row', backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, padding: theme.spacing.md },
  image: { width: 100, height: 100, borderRadius: theme.borderRadius.md },
  itemInfo: { flex: 1, marginLeft: theme.spacing.md },
  itemName: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.medium, color: theme.colors.text },
  itemPrice: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.primary, marginTop: theme.spacing.xs },
  actions: { flexDirection: 'row', marginTop: theme.spacing.md, gap: theme.spacing.sm },
  cartButton: { backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.md },
  cartButtonText: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold, color: theme.colors.white },
  removeButton: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.error },
  removeButtonText: { fontSize: theme.fontSize.sm, color: theme.colors.error },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg },
  emptyIcon: { fontSize: 64, marginBottom: theme.spacing.lg },
  emptyText: { fontSize: theme.fontSize.lg, color: theme.colors.textSecondary },
  shopButton: { marginTop: theme.spacing.lg, backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.lg },
  shopButtonText: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.white },
});