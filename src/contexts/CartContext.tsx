import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Cart, CartItem, MenuItem, SellerType } from '@/types';
import { toast } from '@/hooks/use-toast';
import { GST_RATES } from '@/lib/gst';
import { getItemUnitPrice } from "@/lib/pricing";
import { userAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const EMPTY_CART: Cart = { items: [], sellerId: null, sellerName: null };

// Server cart (GET/PUT /api/user/cart) is shared with the mobile app
const toServerCart = (cart: Cart) => ({
  sellerId: cart.items.length > 0 ? cart.sellerId : null,
  items: cart.items.map(i => ({ menuItemId: i.menuItem._id, quantity: i.quantity, selectedSize: i.selectedSize || null })),
});

const fromServerCart = (data: any): Cart => {
  const items: CartItem[] = (Array.isArray(data?.items) ? data.items : [])
    .filter((i: any) => i?.menuItem?._id)
    .map((i: any) => ({
      menuItem: i.menuItem,
      quantity: i.quantity,
      sellerId: String(data.sellerId || ''),
      sellerName: data.sellerName || 'Restaurant',
      sellerType: data.sellerType || 'home_chef',
      selectedSize: i.selectedSize || undefined,
    }));
  if (items.length === 0) return EMPTY_CART;
  return { items, sellerId: String(data.sellerId || ''), sellerName: data.sellerName || null };
};

const sameCart = (a: Cart, b: Cart) => JSON.stringify(toServerCart(a)) === JSON.stringify(toServerCart(b));

interface CartContextType {
  cart: Cart;
  addToCart: (item: MenuItem, sellerId: string, sellerName: string, sellerType: SellerType, selectedSize?: 'half' | 'full') => void;
  removeFromCart: (itemId: string, selectedSize?: 'half' | 'full') => void;
  updateQuantity: (itemId: string, quantity: number, selectedSize?: 'half' | 'full') => void;
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

  const { userSession } = useAuth();
  const token = userSession?.token || null;
  const cartRef = useRef(cart);
  cartRef.current = cart;
  const prevTokenRef = useRef(token);
  // Token whose server cart has been loaded; local changes are pushed only after that
  const syncedTokenRef = useRef<string | null>(null);
  const skipPushRef = useRef(false);
  const pendingPushRef = useRef(false);

  const applyRemoteCart = (next: Cart) => {
    if (sameCart(next, cartRef.current)) return;
    skipPushRef.current = true;
    setCart(next);
  };

  const pullServerCart = (authToken: string, isLogin: boolean) =>
    userAPI.getCart(authToken)
      .then((res: any) => {
        const server = fromServerCart(res?.data);
        if (server.items.length > 0 || !isLogin) {
          applyRemoteCart(server);
        } else if (cartRef.current.items.length > 0) {
          // Server empty at login: keep what was added before logging in
          userAPI.saveCart(toServerCart(cartRef.current), authToken).catch(() => {});
        }
        syncedTokenRef.current = authToken;
      })
      .catch((err) => console.warn('[Cart] Failed to load server cart:', err?.message));

  // Load the account's cart on login; drop it on logout so the next person doesn't see it
  useEffect(() => {
    const prevToken = prevTokenRef.current;
    prevTokenRef.current = token;
    if (!token) {
      syncedTokenRef.current = null;
      if (prevToken) applyRemoteCart(EMPTY_CART);
      return;
    }
    pullServerCart(token, true);
  }, [token]);

  // Pick up changes made in the app when this tab comes back into focus
  useEffect(() => {
    if (!token) return;
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || pendingPushRef.current) return;
      pullServerCart(token, syncedTokenRef.current !== token);
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [token]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (skipPushRef.current) {
      skipPushRef.current = false;
      return;
    }
    if (!token || syncedTokenRef.current !== token) return;
    pendingPushRef.current = true;
    const timer = setTimeout(() => {
      userAPI.saveCart(toServerCart(cart), token)
        .catch((err) => console.warn('[Cart] Failed to save server cart:', err?.message))
        .finally(() => { pendingPushRef.current = false; });
    }, 400);
    return () => {
      clearTimeout(timer);
      pendingPushRef.current = false;
    };
  }, [cart]);

  const addToCart = (item: MenuItem, sellerId: string, sellerName: string, sellerType: SellerType, selectedSize?: 'half' | 'full') => {
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
      const existingItem = prevCart.items.find(i => i.menuItem._id === item._id && i.selectedSize === selectedSize);
      
      if (existingItem) {
        return {
          ...prevCart,
          items: prevCart.items.map(i =>
            (i.menuItem._id === item._id && i.selectedSize === selectedSize)
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      
      return {
        items: [...prevCart.items, { menuItem: item, quantity: 1, sellerId, sellerName, sellerType, selectedSize }],
        sellerId,
        sellerName,
      };
    });

    toast({
      title: "Added to Cart",
      description: `${item.name}${selectedSize ? ` (${selectedSize === 'half' ? 'Half' : 'Full'} Plate)` : ''} added to your cart`,
    });
  };

  const removeFromCart = (itemId: string, selectedSize?: 'half' | 'full') => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(i => !(i.menuItem._id === itemId && i.selectedSize === selectedSize));
      return {
        items: newItems,
        sellerId: newItems.length > 0 ? prevCart.sellerId : null,
        sellerName: newItems.length > 0 ? prevCart.sellerName : null,
      };
    });
  };

  const updateQuantity = (itemId: string, quantity: number, selectedSize?: 'half' | 'full') => {
    if (quantity <= 0) {
      removeFromCart(itemId, selectedSize);
      return;
    }

    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.map(i =>
        (i.menuItem._id === itemId && i.selectedSize === selectedSize) ? { ...i, quantity } : i
      ),
    }));
  };

  const clearCart = () => {
    setCart(EMPTY_CART);
  };

  const getTotal = () => {
    const subtotal = cart.items.reduce(
      (sum, item) => {
        const price = getItemUnitPrice(item.menuItem, item.selectedSize);
        return sum + (price * item.quantity);
      },
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
