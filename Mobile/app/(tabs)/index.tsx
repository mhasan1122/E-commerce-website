import { useState } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, ScrollView, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, formatPrice } from '../../constants/theme';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { ProductCard } from '../../components/product/ProductCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { Product, Category } from '../../lib/products';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBadge, setSelectedBadge] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: productsData, isLoading: productsLoading } = useProducts({
    category: selectedCategory,
    badge: selectedBadge,
  });
  
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const handleProductPress = (id: number) => {
    router.push(`/product/${id}`);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard product={item} onPress={() => handleProductPress(item.id)} />
  );

  const CategoryPills = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
      <TouchableOpacity
        style={[styles.categoryPill, !selectedCategory && styles.categoryPillActive]}
        onPress={() => setSelectedCategory('')}
      >
        <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>All</Text>
      </TouchableOpacity>
      {categories?.map((cat: Category) => (
        <TouchableOpacity
          key={cat.id}
          style={[styles.categoryPill, selectedCategory === cat.name && styles.categoryPillActive]}
          onPress={() => setSelectedCategory(cat.name)}
        >
          <Text style={[styles.categoryText, selectedCategory === cat.name && styles.categoryTextActive]}>
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const BadgeFilters = () => (
    <View style={styles.badgeFilters}>
      {['hot', 'new', 'sale'].map((badge) => (
        <TouchableOpacity
          key={badge}
          style={[styles.badgeFilter, selectedBadge === badge && styles.badgeFilterActive]}
          onPress={() => setSelectedBadge(selectedBadge === badge ? '' : badge)}
        >
          <Text style={[styles.badgeFilterText, selectedBadge === badge && styles.badgeFilterTextActive]}>
            {badge.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>E-commerce</Text>
        <Text style={styles.subtitle}>Find your style</Text>
      </View>

      <FlatList
        data={productsData?.products || []}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.heroContainer}>
              <View style={styles.hero}>
                <Text style={styles.heroTitle}>Summer Sale</Text>
                <Text style={styles.heroSubtitle}>Up to 50% off</Text>
              </View>
            </View>
            {categoriesLoading ? <Skeleton height={40} width="100%" /> : <CategoryPills />}
            <BadgeFilters />
            {productsLoading && (
              <View style={styles.loadingGrid}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} height={250} width={(width - theme.spacing.lg * 3) / 2} />
                ))}
              </View>
            )}
          </>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  title: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  list: {
    paddingHorizontal: theme.spacing.lg,
  },
  row: {
    justifyContent: 'space-between',
  },
  heroContainer: {
    marginBottom: theme.spacing.lg,
  },
  hero: {
    width: '100%',
    height: 150,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  heroTitle: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  heroSubtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.white,
    opacity: 0.9,
  },
  categories: {
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  categoryTextActive: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.medium,
  },
  badgeFilters: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  badgeFilter: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
  },
  badgeFilterActive: {
    backgroundColor: theme.colors.accent,
  },
  badgeFilterText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.semibold,
  },
  badgeFilterTextActive: {
    color: theme.colors.white,
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});