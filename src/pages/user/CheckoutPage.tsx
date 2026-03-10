import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { userAPI, paymentAPI, apiRequest } from "@/lib/api";
import { UserLayout } from "@/layouts/UserLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { MapPin, IndianRupee, Loader2, CreditCard, Banknote, ArrowLeft, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

// Load Razorpay SDK dynamically
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type PaymentMethod = "razorpay" | "cod" | "wallet";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { cart, getTotal, clearCart, itemCount } = useCart();

  const cartItems = cart?.items || [];
  const totals = getTotal();
  const totalAmount = totals?.total || 0;

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Fetch wallet balance
  const { data: walletData } = useQuery({
    queryKey: ['user-wallet-balance'],
    queryFn: async () => {
      const res = await apiRequest('/user/wallet/transactions');
      return res?.data || res || {};
    },
    enabled: isLoggedIn,
  });
  const walletBalance = Number(walletData?.balance || 0);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (cartItems.length === 0) {
      navigate("/cart");
      return;
    }
  }, [isLoggedIn, cartItems, navigate]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeliveryAddress((prev) => ({ ...prev, [name]: value }));
  };

  const validateAddress = () => {
    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.pincode) {
      toast({ title: "Please fill in all address fields", variant: "destructive" });
      return false;
    }
    return true;
  };

  const buildOrderPayload = (method: string) => ({
    items: cartItems.map((item: any) => ({
      menuItemId: item.menuItem._id,
      name: item.menuItem.name,
      price: item.menuItem.discountPrice || item.menuItem.price,
      quantity: item.quantity,
      image: item.menuItem.image,
    })),
    sellerId: cart.sellerId,
    deliveryAddress,
    paymentMethod: method,
    totalAmount,
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    platformFee: totals.platformFee,
    gstAmount: totals.gst,
  });

  const placeOrderWithWallet = async () => {
    if (!validateAddress()) return;
    if (walletBalance < totalAmount) {
      toast({ title: "Insufficient Balance", description: `Your wallet has ₹${walletBalance}. You need ₹${totalAmount.toFixed(0)}.`, variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const orderResponse = await userAPI.placeOrder(buildOrderPayload("wallet"));
      toast({ title: "Order placed! 🎉", description: "Paid from wallet balance" });
      
      // Generate invoice immediately
      try {
        await userAPI.generateInvoice(orderResponse.order?._id || orderResponse._id);
        toast({ title: "Invoice generated! 📄", description: "Your invoice is ready for download" });
      } catch (invoiceErr: any) {
        console.log("Invoice generation failed:", invoiceErr);
        // Don't show error to user, order is still placed
      }
      
      clearCart();
      navigate("/orders");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const placeOrderWithCOD = async () => {
    if (!validateAddress()) return;
    setIsLoading(true);
    try {
      const orderResponse = await userAPI.placeOrder(buildOrderPayload("cod"));
      toast({ title: "Order placed successfully!", description: "Pay on delivery" });
      
      // Generate invoice immediately
      try {
        await userAPI.generateInvoice(orderResponse.order?._id || orderResponse._id);
        toast({ title: "Invoice generated! 📄", description: "Your invoice is ready for download" });
      } catch (invoiceErr: any) {
        console.log("Invoice generation failed:", invoiceErr);
        // Don't show error to user, order is still placed
      }
      
      clearCart();
      navigate("/orders");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!validateAddress()) return;
    setIsLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !(window as any).Razorpay) {
        toast({ title: "Razorpay SDK not loaded. Please try another method.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      const response = await paymentAPI.createRazorpayOrder({
        amount: totalAmount,
        currency: "INR",
        orderId: `ORDER-${Date.now()}`,
        description: `Order from Dabba Nation - ${cartItems.length} items`,
      });
      if (!response?.success) throw new Error(response?.message || "Failed to create order");

      const options = {
        key: response.key,
        amount: response.amount,
        currency: response.currency,
        order_id: response.orderId,
        name: 'Dabba Nation',
        description: `Order - ${cartItems.length} items`,
        handler: async (paymentRes: any) => {
          try {
            const verifyRes = await paymentAPI.verifyRazorpayPayment({
              razorpayOrderId: paymentRes.razorpay_order_id,
              razorpayPaymentId: paymentRes.razorpay_payment_id,
              razorpaySignature: paymentRes.razorpay_signature,
            });
            if (verifyRes?.verified || verifyRes?.success) {
              // Now place the order
              const orderResponse = await userAPI.placeOrder(buildOrderPayload("razorpay"));
              toast({ title: "Payment successful! Order placed. 🎉" });
              // Generate invoice immediately
              try {
                await userAPI.generateInvoice(orderResponse.order?._id || orderResponse._id);
                toast({ title: "Invoice generated! 📄", description: "Your invoice is ready for download" });
              } catch (invoiceErr: any) {
                console.log("Invoice generation failed:", invoiceErr);
                // Don't show error to user, order is still placed
              }
              clearCart();
              navigate("/orders");
            } else {
              throw new Error("Verification failed");
            }
          } catch (err: any) {
            toast({ title: "Payment verification failed", description: err.message, variant: "destructive" });
          }
        },
        prefill: { name: user?.name || "", email: user?.email || "", contact: user?.phone || "" },
        theme: { color: "#E86F2A" },
        modal: { ondismiss: () => setIsLoading(false) },
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', () => { setIsLoading(false); });
      razorpay.open();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === "wallet") placeOrderWithWallet();
    else if (paymentMethod === "cod") placeOrderWithCOD();
    else handleRazorpayPayment();
  };

  const insufficientWallet = walletBalance < totalAmount;

  return (
    <UserLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-display font-bold text-foreground">Checkout</h1>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-primary" /> Delivery Address
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input id="street" name="street" value={deliveryAddress.street} onChange={handleAddressChange} placeholder="123 Main St, Flat 4B" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={deliveryAddress.city} onChange={handleAddressChange} placeholder="Mumbai" />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={deliveryAddress.state} onChange={handleAddressChange} placeholder="Maharashtra" />
                  </div>
                </div>
                <div className="w-1/2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" name="pincode" value={deliveryAddress.pincode} onChange={handleAddressChange} placeholder="400001" />
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-primary" /> Payment Method
              </h2>
              <div className="space-y-3">
                {/* Wallet */}
                <label className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  paymentMethod === "wallet" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30",
                  insufficientWallet && "opacity-60"
                )}>
                  <input type="radio" name="payment" checked={paymentMethod === "wallet"} onChange={() => !insufficientWallet && setPaymentMethod("wallet")} disabled={insufficientWallet} className="accent-primary" />
                  <Wallet size={24} className="text-success" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">Wallet</p>
                      <span className={cn("text-sm font-bold", insufficientWallet ? "text-destructive" : "text-success")}>
                        ₹{walletBalance.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {insufficientWallet 
                        ? `Insufficient balance (need ₹${totalAmount.toFixed(0)})` 
                        : "Pay instantly from your wallet balance"}
                    </p>
                  </div>
                </label>

                {/* Razorpay */}
                <label className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  paymentMethod === "razorpay" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                )}>
                  <input type="radio" name="payment" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} className="accent-primary" />
                  <CreditCard size={24} className="text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Razorpay</p>
                    <p className="text-xs text-muted-foreground">UPI • Cards • Netbanking • Wallets</p>
                  </div>
                </label>

                {/* COD */}
                <label className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                )}>
                  <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-primary" />
                  <Banknote size={24} className="text-success" />
                  <div>
                    <p className="font-medium text-foreground">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                  </div>
                </label>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                {cartItems.map((item: any) => (
                  <div key={item.menuItem._id} className="flex justify-between">
                    <span className="text-muted-foreground">{item.menuItem.name} x{item.quantity}</span>
                    <span className="font-medium">₹{((item.menuItem.discountPrice || item.menuItem.price) * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery Fee</span><span>₹{totals.deliveryFee}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Platform Fee</span><span>₹{totals.platformFee}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">GST (5%)</span><span>₹{totals.gst.toFixed(2)}</span></div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
              </div>

              {paymentMethod === "wallet" && (
                <div className="mt-3 p-3 rounded-lg bg-success/10 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Wallet Balance</span>
                    <span>₹{walletBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground mt-1">
                    <span>After Payment</span>
                    <span>₹{(walletBalance - totalAmount).toFixed(0)}</span>
                  </div>
                </div>
              )}

              <Button onClick={handlePayment} disabled={isLoading} className="w-full mt-6 gradient-primary text-primary-foreground" size="lg">
                {isLoading ? (
                  <><Loader2 size={16} className="mr-2 animate-spin" /> Processing...</>
                ) : paymentMethod === "wallet" ? (
                  <><Wallet size={16} className="mr-2" /> Pay ₹{totalAmount.toFixed(0)} from Wallet</>
                ) : paymentMethod === "cod" ? (
                  <><Banknote size={16} className="mr-2" /> Place Order (COD)</>
                ) : (
                  <><IndianRupee size={16} className="mr-2" /> Pay ₹{totalAmount.toFixed(0)}</>
                )}
              </Button>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                {paymentMethod === "wallet" ? "Instant payment from your wallet" 
                  : paymentMethod === "cod" ? "Pay cash when your order is delivered" 
                  : "Secure payment powered by Razorpay"}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}