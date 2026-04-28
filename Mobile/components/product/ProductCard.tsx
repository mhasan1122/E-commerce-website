import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Product } from '../../lib/products';
import { theme, formatPrice } from '../../constants/theme';
import { Badge } from '../ui/Badge';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onWishlist?: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - theme.spacing.lg * 3) / 2;

export function ProductCard({ product, onPress, onWishlist }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} contentFit="cover" />
        {product.badge && (
          <View style={styles.badgeContainer}>
            <Badge title={product.badge} variant={product.badge === 'sale' ? 'error' : 'primary'} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        {product.rating > 0 && (
          <View style={styles.rating}>
            <Text style={styles.ratingText}>★ {product.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: theme.spacing.lg,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: CARD_WIDTH,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  badgeContainer: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
  },
  content: {
    padding: theme.spacing.md,
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    height: 40,
  },
  price: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  rating: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
  },
  ratingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.accent,
  },
});