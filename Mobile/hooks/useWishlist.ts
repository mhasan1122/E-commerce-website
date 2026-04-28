import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi, WishlistItem } from '../lib/wishlist';

export const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.getWishlist(),
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: number | { productId: number }) => 
      wishlistApi.addItem(typeof productId === 'object' ? productId.productId : productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: number | { productId: number }) => 
      wishlistApi.removeItem(typeof productId === 'object' ? productId.productId : productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
};

export const useInvalidateWishlist = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['wishlist'] });
  };
};