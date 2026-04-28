import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, Product, Category, ProductsParams } from '../lib/products';

export const useProducts = (params?: ProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params),
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
  });
};

export const useInvalidateProducts = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };
};