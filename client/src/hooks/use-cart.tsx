import { useContext } from "react";
import { CartProvider, useCart as useCartContext } from "@/components/cart/cart-provider";

export const useCart = () => {
  return useCartContext();
};
