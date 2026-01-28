import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart, CartItem, MenuItem, SellerType } from '@/types';
import { toast } from '@/hooks/use-toast';

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
const GST_PERCENTAGE = 5;

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : { items: [], sellerId: null, sellerName: null };
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
      (sum, item) => sum + (item.menuItem.discountPrice || item.menuItem.price) * item.quantity,
      0
    );
    const gst = (subtotal * GST_PERCENTAGE) / 100;
    const total = subtotal + DELIVERY_FEE + PLATFORM_FEE + gst;

    return {
      subtotal,
      deliveryFee: cart.items.length > 0 ? DELIVERY_FEE : 0,
      platformFee: cart.items.length > 0 ? PLATFORM_FEE : 0,
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
