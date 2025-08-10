import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CartItem } from "@shared/schema";

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (item: Omit<CartItem, 'id' | 'sessionId' | 'createdAt'>) => Promise<void>;
  updateCartItem: (id: string, updates: Partial<CartItem>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartCount: () => number;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (item: Omit<CartItem, 'id' | 'sessionId' | 'createdAt'>) => {
      const response = await apiRequest('POST', '/api/cart', item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const updateCartItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CartItem> }) => {
      const response = await apiRequest('PUT', `/api/cart/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/cart/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/cart');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const getCartCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const unitPrice = parseFloat(item.unitPrice);
      const brandingCost = parseFloat(item.brandingCost || '0');
      return total + (unitPrice + brandingCost) * item.quantity;
    }, 0);
  };

  const value: CartContextType = {
    items,
    isLoading,
    addToCart: addToCartMutation.mutateAsync,
    updateCartItem: (id: string, updates: Partial<CartItem>) =>
      updateCartItemMutation.mutateAsync({ id, updates }),
    removeFromCart: removeFromCartMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,
    getCartCount,
    getCartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
