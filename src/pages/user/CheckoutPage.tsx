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
import { MapPin, IndianRupee, Loader2, CreditCard, Banknote, ArrowLeft, Wallet, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { calculateOrderGST, formatGSTAmount, formatGSTPercentage, GST_RATES, updateGSTSettings } from "@/lib/gst";

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
    location: null,
  });

  // 🗺️ Location Detection Function
  const detectUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('📍 User location detected:', { latitude, longitude });
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data.address) {
              setDeliveryAddress(prev => ({
                ...prev,
                street: data.address.road || data.address.house_number || '',
                city: data.address.city || data.address.town || data.address.village || '',
                state: data.address.state || '',
                pincode: data.address.postcode || '',
                location: {
                  type: 'Point',
                  coordinates: [longitude, latitude]
                }
              }));
              
              toast({ 
                title: "📍 Location Detected", 
                description: `Address auto-filled: ${data.address.city || 'Unknown'}` 
              });
            }
          } catch (error) {
            console.error('❌ Reverse geocoding failed:', error);
            toast({ 
              title: "Location Error", 
              description: "Could not get address from coordinates", 
              variant: "destructive" 
            });
          }
        },
        (error) => {
          console.error('❌ Location detection failed:', error);
          toast({ 
            title: "Location Error", 
            description: "Could not detect your location. Please enter address manually.", 
            variant: "destructive" 
          });
        }
      );
    } else {
      toast({ 
        title: "Not Supported", 
        description: "Geolocation is not supported by your browser", 
        variant: "destructive" 
      });
    }
  };

  // Fetch GST settings from admin
  const { data: gstSettings } = useQuery({
    queryKey: ['gst-settings'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/admin/gst/settings');
        return response?.data || null;
      } catch (error) {
        console.log('GST settings not available, using defaults');
        return null;
      }
    },
  });

  // Update GST rates when settings are fetched
  useEffect(() => {
    if (gstSettings) {
      updateGSTSettings(gstSettings);
    }
  }, [gstSettings]);

  // Fetch platform config for dynamic pricing
  const { data: platformConfig } = useQuery({
    queryKey: ['platform-config'],
    queryFn: () => apiRequest('/admin/config'),
  });

  // GST Calculation - Simple and direct
  const gstCalculation = cartItems.length > 0 && gstSettings?.gstApplicable && gstSettings?.platformGSTEnabled ? {
    subtotal: totals.subtotal,
    platformCommission: totals.subtotal * (gstSettings.platformCommissionRate / 100),
    platformCommissionGST: totals.subtotal * (gstSettings.platformCommissionRate / 100) * (gstSettings.platformGSTRate / 100),
    totalCGST: gstSettings?.foodGSTEnabled ? totals.subtotal * (gstSettings.foodCGSTRate / 100) : 0,
    totalSGST: gstSettings?.foodGSTEnabled ? totals.subtotal * (gstSettings.foodSGSTRate / 100) : 0,
    totalGST: gstSettings?.foodGSTEnabled ? totals.subtotal * ((gstSettings.foodCGSTRate + gstSettings.foodSGSTRate) / 100) : 0,
    deliveryCGST: gstSettings?.deliveryGSTEnabled ? totals.deliveryFee * (gstSettings.deliveryCGSTRate / 100) : 0,
    deliverySGST: gstSettings?.deliveryGSTEnabled ? totals.deliveryFee * (gstSettings.deliverySGSTRate / 100) : 0,
    deliveryGST: gstSettings?.deliveryGSTEnabled ? totals.deliveryFee * ((gstSettings.deliveryCGSTRate + gstSettings.deliverySGSTRate) / 100) : 0,
    grandTotal: 0
  } : null;

  // Calculate grand total
  if (gstCalculation) {
    gstCalculation.grandTotal = gstCalculation.subtotal + 
      gstCalculation.totalGST + 
      gstCalculation.platformCommission + 
      gstCalculation.platformCommissionGST + 
      totals.deliveryFee + 
      gstCalculation.deliveryGST;
  }

  console.log('🔥 Simple GST Debug:', {
    gstSettings,
    gstCalculation,
    platformCommission: gstCalculation?.platformCommission,
    platformCommissionGST: gstCalculation?.platformCommissionGST
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
    totalAmount: gstCalculation ? gstCalculation.grandTotal : totalAmount,
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    platformFee: totals.platformFee,
    gstAmount: gstCalculation ? gstCalculation.totalGST : totals.gst,
    gstBreakup: gstCalculation ? {
      cgst: gstCalculation.totalCGST,
      sgst: gstCalculation.totalSGST,
      totalGST: gstCalculation.totalGST,
      platformCommission: gstCalculation.platformCommission,
      platformCommissionGST: gstCalculation.platformCommissionGST,
      totalCommissionWithGST: gstCalculation.totalCommissionWithGST
    } : null,
  });

  const placeOrderWithWallet = async () => {
    if (!validateAddress()) return;
    const finalAmount = gstCalculation ? gstCalculation.grandTotal : totalAmount;
    if (walletBalance < finalAmount) {
      toast({ title: "Insufficient Balance", description: `Your wallet has ₹${walletBalance}. You need ₹${finalAmount.toFixed(0)}.`, variant: "destructive" });
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
    console.log('🚀 Starting Razorpay payment process...');
    
    if (!validateAddress()) {
      console.log('❌ Address validation failed');
      return;
    }
    
    const finalAmount = gstCalculation ? gstCalculation.grandTotal : totalAmount;
    setIsLoading(true);
    try {
      console.log(' Creating Razorpay order...');
      const response = await paymentAPI.createRazorpayOrder({
        amount: finalAmount,
        currency: "INR",
        orderId: `ORDER-${Date.now()}`,
        description: `Order from Dabba Nation - ${cartItems.length} items`,
      });
      
      console.log('📋 Razorpay order response:', response);
      
      if (!response?.success) {
        console.error('❌ Razorpay order creation failed:', response);
        throw new Error(response?.message || "Failed to create order");
      }

      console.log('🎯 Creating direct Razorpay modal...');
      
      // Create a direct Razorpay modal using the script
      const options = {
        key: response.key,
        amount: response.amount,
        currency: response.currency,
        order_id: response.orderId,
        name: 'Dabba Nation',
        description: `Order - ${cartItems.length} items`,
        image: 'https://via.placeholder.com/150x150.png?text=DabbaNation',
        handler: async (paymentRes: any) => {
          try {
            console.log('💳 Razorpay payment response:', paymentRes);
            
            // Verify payment
            const verifyRes = await paymentAPI.verifyRazorpayPayment({
              razorpayOrderId: paymentRes.razorpay_order_id,
              razorpayPaymentId: paymentRes.razorpay_payment_id,
              razorpaySignature: paymentRes.razorpay_signature,
            });
            
            console.log('✅ Payment verification response:', verifyRes);
            
            if (verifyRes?.verified || verifyRes?.success) {
              console.log('✅ Payment verified, placing order...');
              
              // Place the order
              const orderResponse = await userAPI.placeOrder(buildOrderPayload("razorpay"));
              console.log('📦 Order placed successfully:', orderResponse);
              
              toast({ title: "Payment successful! Order placed. 🎉" });
              
              // Generate invoice
              try {
                await userAPI.generateInvoice(orderResponse.order?._id || orderResponse._id);
                console.log('📄 Invoice generated successfully');
                toast({ title: "Invoice generated! 📄", description: "Your invoice is ready for download" });
              } catch (invoiceErr: any) {
                console.log("Invoice generation failed:", invoiceErr);
              }
              
              clearCart();
              navigate("/orders");
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err: any) {
            console.error('❌ Payment handler error:', err);
            toast({ title: "Payment failed", description: err.message, variant: "destructive" });
            setIsLoading(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: {
          color: "#E86F2A"
        },
        modal: {
          ondismiss: function() {
            console.log('❌ Razorpay modal dismissed by user');
            setIsLoading(false);
          },
          backdropclose: true,
          escape: true,
          handleback: true
        },
        notes: {
          address: `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.pincode}`,
          seller_id: cart.sellerId
        }
      };
      
      console.log('🔧 Razorpay options created:', options);
      
      // Load Razorpay script fresh
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        console.log('✅ Razorpay script loaded fresh');
        
        try {
          // Create Razorpay instance directly from global window
          const rzp = new (window as any).Razorpay(options);
          console.log('✅ Razorpay instance created fresh');
          
          // Open the modal
          rzp.open();
          console.log('🚀 Razorpay modal opened');
          
        } catch (err: any) {
          console.error('❌ Error creating Razorpay instance:', err);
          toast({ 
            title: "Payment Error", 
            description: "Cannot open payment modal. Please try another payment method.", 
            variant: "destructive" 
          });
          setIsLoading(false);
        }
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        toast({ 
          title: "Payment Error", 
          description: "Cannot load payment gateway. Please try another payment method.", 
          variant: "destructive" 
        });
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
      
    } catch (err: any) {
      console.error('❌ Payment error:', err);
      toast({ title: "Payment failed", description: err.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === "wallet") placeOrderWithWallet();
    else if (paymentMethod === "cod") placeOrderWithCOD();
    else handleRazorpayPayment();
  };

  const finalAmount = gstCalculation ? gstCalculation.grandTotal : totalAmount;
  const insufficientWallet = walletBalance < finalAmount;

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
              
              {/* 🗺️ Location Detection Button */}
              <div className="mb-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={detectUserLocation}
                  className="w-full flex items-center gap-2"
                >
                  <MapPin size={16} />
                  📍 Detect My Current Location
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Click to auto-fill your address using GPS location
                </p>
              </div>

              {/* 📍 Location Status Display */}
              {deliveryAddress.location && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <MapPin size={16} />
                    <span className="text-sm font-medium">Location detected successfully!</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Coordinates: {deliveryAddress.location.coordinates[1].toFixed(4)}, {deliveryAddress.location.coordinates[0].toFixed(4)}
                  </p>
                </div>
              )}
              
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
                {cartItems.map((item: any) => {
                  const itemPrice = item.menuItem.discountPrice || item.menuItem.price;
                  const itemTotal = itemPrice * item.quantity;
                  return (
                    <div key={item.menuItem._id}>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{item.menuItem.name} x{item.quantity}</span>
                        <span>₹{itemTotal.toFixed(0)}</span>
                      </div>
                      {gstCalculation && gstSettings?.gstApplicable && gstSettings?.foodGSTEnabled ? (
                        <div className="flex justify-between text-xs text-muted-foreground ml-4">
                          <span>+ GST ({formatGSTPercentage(GST_RATES.FOOD.TOTAL)})</span>
                          <span>₹{(itemTotal * GST_RATES.FOOD.TOTAL).toFixed(2)}</span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
                
                {/* 🧾 GST Breakup - Only show if GST is enabled */}
                {gstCalculation && gstSettings?.gstApplicable && gstSettings?.foodGSTEnabled ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CGST ({formatGSTPercentage(GST_RATES.FOOD.CGST)})</span>
                      <span>₹{gstCalculation.totalCGST.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SGST ({formatGSTPercentage(GST_RATES.FOOD.SGST)})</span>
                      <span>₹{gstCalculation.totalSGST.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Total GST ({formatGSTPercentage(GST_RATES.FOOD.TOTAL)})</span>
                      <span>₹{gstCalculation.totalGST.toFixed(2)}</span>
                    </div>
                  </>
                ) : null}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span>₹{gstCalculation ? gstCalculation.platformCommission.toFixed(2) : totals.platformFee.toFixed(2)}</span>
                </div>
                
                {/* Platform Commission GST */}
                {gstCalculation && gstSettings?.gstApplicable && gstSettings?.platformGSTEnabled ? (
                  <div className="flex justify-between text-xs text-muted-foreground ml-4">
                    <span>+ GST on Platform Fee ({formatGSTPercentage(gstSettings.platformGSTRate)})</span>
                    <span>₹{gstCalculation.platformCommissionGST.toFixed(2)}</span>
                  </div>
                ) : null}
                
                {/* Delivery GST */}
                {gstCalculation && gstSettings?.gstApplicable && gstSettings?.deliveryGSTEnabled ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <div className="text-right">
                        <span>₹{totals.deliveryFee}</span>
                        {totals.deliveryFee === 0 && totals.subtotal >= (platformConfig?.freeDeliveryAbove || 299) && (
                          <div className="text-xs text-green-600">FREE Delivery!</div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground ml-4">
                      <span>+ GST on Delivery ({formatGSTPercentage(gstSettings.deliveryCGSTRate + gstSettings.deliverySGSTRate)})</span>
                      <span>₹{gstCalculation.deliveryGST.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <div className="text-right">
                      <span>₹{totals.deliveryFee}</span>
                      {totals.deliveryFee === 0 && totals.subtotal >= (platformConfig?.freeDeliveryAbove || 299) && (
                        <div className="text-xs text-green-600">FREE Delivery!</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 🧾 GST Info Box - Dynamic based on settings */}
              {gstCalculation && gstSettings?.gstApplicable ? (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Receipt size={16} />
                    <span className="text-sm font-medium">GST Invoice Details</span>
                  </div>
                  <div className="text-xs text-blue-600 space-y-1">
                    {gstSettings?.foodGSTEnabled ? (
                      <p>• Food items: {formatGSTPercentage(GST_RATES.FOOD.TOTAL)} GST ({formatGSTPercentage(GST_RATES.FOOD.CGST)} CGST + {formatGSTPercentage(GST_RATES.FOOD.SGST)} SGST)</p>
                    ) : (
                      <p>• Food items: No GST applicable</p>
                    )}
                    {gstSettings?.platformGSTEnabled ? (
                      <p>• Platform commission: {formatGSTPercentage(gstSettings.platformGSTRate)} GST applicable</p>
                    ) : (
                      <p>• Platform commission: No GST applicable</p>
                    )}
                    {gstSettings?.deliveryGSTEnabled ? (
                      <p>• Delivery charges: {formatGSTPercentage(GST_RATES.DELIVERY.TOTAL)} GST applicable</p>
                    ) : (
                      <p>• Delivery charges: No GST applicable</p>
                    )}
                    {gstSettings?.defaultGSTIN && <p>• GSTIN: {gstSettings.defaultGSTIN}</p>}
                  </div>
                </div>
              ) : null}

              {paymentMethod === "wallet" && (
                <div className="mt-3 p-3 rounded-lg bg-success/10 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Wallet Balance</span>
                    <span>₹{walletBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground mt-1">
                    <span>After Payment</span>
                    <span>₹{(walletBalance - (gstCalculation ? gstCalculation.grandTotal : totalAmount)).toFixed(0)}</span>
                  </div>
                </div>
              )}

              <Button onClick={handlePayment} disabled={isLoading} className="w-full mt-6 gradient-primary text-primary-foreground" size="lg">
                {isLoading ? (
                  <><Loader2 size={16} className="mr-2 animate-spin" /> Processing...</>
                ) : paymentMethod === "wallet" ? (
                  <><Wallet size={16} className="mr-2" /> Pay ₹{gstCalculation ? gstCalculation.grandTotal.toFixed(0) : totalAmount.toFixed(0)} from Wallet</>
                ) : paymentMethod === "cod" ? (
                  <><Banknote size={16} className="mr-2" /> Place Order (COD)</>
                ) : (
                  <><IndianRupee size={16} className="mr-2" /> Pay ₹{gstCalculation ? gstCalculation.grandTotal.toFixed(0) : totalAmount.toFixed(0)}</>
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