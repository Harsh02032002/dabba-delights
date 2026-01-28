import { useCart } from '@/contexts/CartContext';
import { UserLayout } from '@/layouts/UserLayout';
import { Button } from '@/components/ui/button';
import { EmptyCart } from '@/components/shared/EmptyState';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { VegBadge } from '@/components/shared/Badge';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotal, itemCount } = useCart();
  const navigate = useNavigate();
  const totals = getTotal();

  if (cart.items.length === 0) {
    return (
      <UserLayout>
        <div className="container mx-auto px-4 py-12">
          <EmptyCart onBrowse={() => navigate('/')} />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Your Cart</h1>
            <p className="text-muted-foreground">
              {itemCount} items from {cart.sellerName}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.menuItem._id}
                className="bg-card rounded-2xl p-4 shadow-card flex gap-4"
              >
                <img
                  src={item.menuItem.image}
                  alt={item.menuItem.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <VegBadge isVeg={item.menuItem.isVeg} />
                        <h3 className="font-semibold text-foreground">{item.menuItem.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.menuItem.description}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.menuItem._id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 bg-secondary rounded-xl p-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => updateQuantity(item.menuItem._id, item.quantity - 1)}
                      >
                        <Minus size={14} />
                      </Button>
                      <span className="w-6 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => updateQuantity(item.menuItem._id, item.quantity + 1)}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                    
                    <p className="font-bold text-foreground">
                      ₹{(item.menuItem.discountPrice || item.menuItem.price) * item.quantity}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="ghost" className="text-destructive" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 shadow-card sticky top-24">
              <h3 className="font-semibold text-lg text-foreground mb-4">Order Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">₹{totals.deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-medium">₹{totals.platformFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (5%)</span>
                  <span className="font-medium">₹{totals.gst.toFixed(2)}</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{totals.total.toFixed(2)}</span>
              </div>
              
              <Link to="/checkout">
                <Button variant="gradient" size="lg" className="w-full mt-6">
                  <ShoppingBag size={18} />
                  Proceed to Checkout
                </Button>
              </Link>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                By placing this order, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
