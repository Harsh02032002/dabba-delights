import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart, CartItem, MenuItem, SellerType } from '@/types';
import { toast } from '@/hooks/use-toast';
import { GST_RATES } from '@/lib/gst';

interface CartContextType {
  cart: Cart;
  addToCart: (item: MenuItem, sellerId: string, sellerName: string, sellerType: SellerType) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => { subtotal: number; deliveryFee: number; platformFee: number; gst: number; total: number };
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const DELIVERY_FEE = 40;
const PLATFORM_FEE = 5;
// GST percentage now comes from GST_RATES which is updated from backend

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          items: Array.isArray(parsed?.items) ? parsed.items : [],
          sellerId: parsed?.sellerId || null,
          sellerName: parsed?.sellerName || null,
        };
      }
    } catch { /* corrupted localStorage */ }
    return { items: [], sellerId: null, sellerName: null };
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: MenuItem, sellerId: string, sellerName: string, sellerType: SellerType) => {
    // Check if cart has items from different seller
    if (cart.sellerId && cart.sellerId !== sellerId && cart.items.length > 0) {
      toast({
        title: "Different Restaurant",
        description: "Your cart has items from another seller. Clear cart to add items from this seller.",
        variant: "destructive",
      });
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.items.find(i => i.menuItem._id === item._id);
      
      if (existingItem) {
        return {
          ...prevCart,
          items: prevCart.items.map(i =>
            i.menuItem._id === item._id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      
      return {
        items: [...prevCart.items, { menuItem: item, quantity: 1, sellerId, sellerName, sellerType }],
        sellerId,
        sellerName,
      };
    });

    toast({
      title: "Added to Cart",
      description: `${item.name} added to your cart`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(i => i.menuItem._id !== itemId);
      return {
        items: newItems,
        sellerId: newItems.length > 0 ? prevCart.sellerId : null,
        sellerName: newItems.length > 0 ? prevCart.sellerName : null,
      };
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.map(i =>
        i.menuItem._id === itemId ? { ...i, quantity } : i
      ),
    }));
  };

  const clearCart = () => {
    setCart({ items: [], sellerId: null, sellerName: null });
  };

  const getTotal = () => {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + ((item.menuItem.discountPrice || item.menuItem.sellingPrice || 0) * item.quantity),
      0
    );
    // Use dynamic GST rate from backend (GST_RATES.FOOD.TOTAL is 0-1 decimal)
    const gstRate = GST_RATES.FOOD.TOTAL; // e.g., 0.05 for 5%
    const gst = subtotal * gstRate;
    // No delivery/platform fee in cart - only at checkout
    const total = subtotal + gst;

    return {
      subtotal,
      deliveryFee: 0, // Hidden from cart
      platformFee: 0, // Hidden from cart
      gst,
      total: cart.items.length > 0 ? total : 0,
    };
  };

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
