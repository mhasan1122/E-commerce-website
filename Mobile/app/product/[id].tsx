import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, formatPrice } from '../../constants/theme';
import { useProduct } from '../../hooks/useProducts';
import { useAddToCart } from '../../hooks/useCart';
import { useAddToWishlist, useRemoveFromWishlist } from '../../hooks/useWishlist';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const productId = Number(id);
  
  const { data: product, isLoading } = useProduct(productId);
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart.mutate(
      { productId, quantity },
      { onSuccess: () => Alert.alert('Added to Cart') }
    );
  };

  const handleWishlist = () => {
    addToWishlist.mutate(productId, { onSuccess: () => Alert.alert('Added to Wishlist') });
  };

  const images = product?.images || [product?.image].filter(Boolean);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loading}>
          <Skeleton height={width} width={width} />
          <View style={styles.skeletonContent}>
            <Skeleton height={24} width="80%" />
            <Skeleton height={20} width="40%" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text>Product not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleWishlist}>
            <Text style={styles.wishlistButton}>♡</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {images.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img }}
              style={styles.image}
              contentFit="cover"
            />
          ))}
        </ScrollView>

        <View style={styles.content}>
          {product.badge && (
            <Badge title={product.badge} variant={product.badge === 'sale' ? 'error' : 'primary'} />
          )}
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          
          <View style={styles.rating}>
            <Text style={styles.ratingText}>★ {product.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({product.reviewCount} reviews)</Text>
          </View>

          <View style={styles.stock}>
            <Text style={styles.stockText}>Stock: {product.stock > 0 ? product.stock : 'Out of stock'}</Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.addButton, product.stock === 0 && styles.addButtonDisabled]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
        >
          <Text style={styles.addButtonText}>
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: theme.spacing.lg, position: 'absolute', top: 40, left: 0, right: 0, zIndex: 10 },
  backButtonContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.white, alignItems: 'center', justifyContent: 'center' },
  backButton: { fontSize: 20, color: theme.colors.text },
  wishlistButton: { fontSize: 24 },
  image: { width, height: width },
  content: { padding: theme.spacing.lg },
  name: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginTop: theme.spacing.md },
  price: { fontSize: theme.fontSize['2xl'], fontWeight: theme.fontWeight.bold, color: theme.colors.primary, marginTop: theme.spacing.sm },
  rating: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm },
  ratingText: { fontSize: theme.fontSize.md, color: theme.colors.accent },
  reviewCount: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginLeft: theme.spacing.xs },
  stock: { marginTop: theme.spacing.sm },
  stockText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginTop: theme.spacing.xl },
  description: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, marginTop: theme.spacing.sm, lineHeight: 22 },
  footer: { flexDirection: 'row', padding: theme.spacing.lg, backgroundColor: theme.colors.white, borderTopWidth: 1, borderTopColor: theme.colors.border, gap: theme.spacing.md },
  quantitySelector: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md },
  quantityButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  quantityButtonText: { fontSize: theme.fontSize.xl, color: theme.colors.text },
  quantityText: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold, paddingHorizontal: theme.spacing.md },
  addButton: { flex: 1, backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, alignItems: 'center' },
  addButtonDisabled: { backgroundColor: theme.colors.secondary },
  addButtonText: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.white },
  loading: { padding: theme.spacing.lg },
  skeletonContent: { padding: theme.spacing.lg, gap: theme.spacing.md },
});