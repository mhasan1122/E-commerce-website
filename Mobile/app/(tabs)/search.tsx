import { useState, useEffect, useCallback } from 'react';
import { View, FlatList, TextInput, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { theme } from '../../constants/theme';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { ProductCard } from '../../components/product/ProductCard';
import { Product, Category } from '../../lib/products';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sort, setSort] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { data: categories } = useCategories();
  
  const { data: productsData } = useProducts({
    q: query,
    category: selectedCategory,
    minPrice,
    maxPrice,
    sort,
  });

  const handleProductPress = (id: number) => {
    router.push(`/product/${id}`);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Rating' },
  ];

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard product={item} onPress={() => handleProductPress(item.id)} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={query}
          onChangeText={setQuery}
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>

      <View style={styles.filters}>
        <FlatList
          data={categories || []}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === item.name && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(selectedCategory === item.name ? '' : item.name)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === item.name && styles.categoryChipTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.priceFilter}>
        <Text style={styles.priceLabel}>Price Range</Text>
        <View style={styles.priceInputs}>
          <Text style={styles.priceValue}>৳{(minPrice / 100).toFixed(0)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100000}
            value={maxPrice}
            onValueChange={setMaxPrice}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
          />
          <Text style={styles.priceValue}>৳{(maxPrice / 100).toFixed(0)}</Text>
        </View>
      </View>

      <View style={styles.sortFilter}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[styles.sortOption, sort === option.value && styles.sortOptionActive]}
            onPress={() => setSort(option.value)}
          >
            <Text style={[styles.sortText, sort === option.value && styles.sortTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={productsData?.products || []}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
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
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  filters: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  categoryChipTextActive: {
    color: theme.colors.white,
  },
  priceFilter: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  priceLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    width: 60,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sortFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  sortOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  sortOptionActive: {
    backgroundColor: theme.colors.primary,
  },
  sortText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  sortTextActive: {
    color: theme.colors.white,
  },
  list: {
    padding: theme.spacing.lg,
  },
  row: {
    justifyContent: 'space-between',
  },
});