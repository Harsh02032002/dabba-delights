import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { userAPI, paymentAPI, apiRequest, fetchPublicGSTSettings, fetchPublicPlatformConfig } from "@/lib/api";
import { UserLayout } from "@/layouts/UserLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { MapPin, IndianRupee, Loader2, CreditCard, Banknote, ArrowLeft, Wallet, Receipt, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { formatGSTPercentage, GST_RATES, updateGSTSettings } from "@/lib/gst";
import { OnlinePaymentModal } from "@/components/OnlinePaymentModal";

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

type PaymentMethod = "razorpay" | "cod" | "wallet" | "subscription" | "hybrid";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { cart, getTotal, clearCart, itemCount } = useCart();

  const cartItems = cart?.items || [];
  const totals = getTotal();
  const totalAmount = totals?.total || 0;

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);

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
          // Handle HTTPS geolocation restriction
          if (error.code === 1) {
            toast({
              title: "🌐 HTTPS Required",
              description: "Location access requires HTTPS in browser. Please enter address manually.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Location Error",
              description: "Could not detect your location. Please enter address manually.",
              variant: "destructive"
            });
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
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

  const { data: gstRes } = useQuery({
    queryKey: ["public-gst-settings"],
    queryFn: fetchPublicGSTSettings,
  });
  const gstSettings = (gstRes?.data ?? null) as any;

  useEffect(() => {
    if (gstSettings) updateGSTSettings(gstSettings);
  }, [gstSettings]);

  const { data: platformConfig } = useQuery({
    queryKey: ["public-platform-config"],
    queryFn: fetchPublicPlatformConfig,
  });

  const { data: sellerRes } = useQuery({
    queryKey: ["checkout-seller", cart?.sellerId],
    queryFn: async () => {
      const r = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/user/sellers/${cart?.sellerId}`,
      );
      return r.json();
    },
    enabled: !!cart?.sellerId && cartItems.length > 0,
  });
  const sellerState = sellerRes?.seller?.address?.state as string | undefined;

  const { data: subRes } = useQuery({
    queryKey: ["user-active-subscription"],
    queryFn: () => userAPI.getActiveSubscription(),
    enabled: isLoggedIn,
  });
  const activeSubscription = subRes?.subscription as
    | {
      _id?: string;
      remaining_amount?: number;
      remaining_days?: number;
      per_day_value?: number;
      seller_id?: {
        _id?: string;
        businessName?: string;
      } | string;
    }
    | undefined;

  const gstCalculation = useMemo(() => {
    if (cartItems.length === 0 || !gstSettings?.gstApplicable) return null;
    const subtotal = totals.subtotal;
    const rawDel =
      platformConfig &&
        platformConfig.deliveryFee != null &&
        String(platformConfig.deliveryFee) !== ""
        ? Number(platformConfig.deliveryFee)
        : totals.deliveryFee;
    const deliveryFee = Number.isFinite(rawDel) ? rawDel : totals.deliveryFee;

    const norm = (s?: string) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
    const sameState =
      !!norm(deliveryAddress.state) &&
      !!norm(sellerState) &&
      norm(deliveryAddress.state) === norm(sellerState);

    const rC = (Number(gstSettings.foodCGSTRate) || 0) / 100;
    const rS = (Number(gstSettings.foodSGSTRate) || 0) / 100;
    const foodIgstRate =
      (Number(gstSettings.foodIGSTRate) || 0) > 0
        ? (Number(gstSettings.foodIGSTRate) || 0) / 100
        : rC + rS;

    let totalCGST = 0;
    let totalSGST = 0;
    let foodIGST = 0;
    if (gstSettings.foodGSTEnabled) {
      if (sameState || !sellerState) {
        totalCGST = subtotal * rC;
        totalSGST = subtotal * rS;
      } else {
        foodIGST = subtotal * foodIgstRate;
      }
    }
    const totalFoodGST = totalCGST + totalSGST + foodIGST;

    let deliveryCGST = 0;
    let deliverySGST = 0;
    let deliveryIGSTVal = 0;
    if (gstSettings.deliveryGSTEnabled && deliveryFee > 0) {
      const dC = (Number(gstSettings.deliveryCGSTRate) || 0) / 100;
      const dS = (Number(gstSettings.deliverySGSTRate) || 0) / 100;
      const dIgstRate =
        (Number(gstSettings.deliveryIGSTRate) || 0) > 0
          ? (Number(gstSettings.deliveryIGSTRate) || 0) / 100
          : dC + dS;
      if (sameState || !sellerState) {
        deliveryCGST = deliveryFee * dC;
        deliverySGST = deliveryFee * dS;
      } else {
        deliveryIGSTVal = deliveryFee * dIgstRate;
      }
    }
    const deliveryGST = deliveryCGST + deliverySGST + deliveryIGSTVal;
    const totalGST = totalFoodGST + deliveryGST;

    const rawPlat = platformConfig?.platformFee != null ? Number(platformConfig.platformFee) : 5;
    const platformFee = Number.isFinite(rawPlat) ? rawPlat : 5;
    const grandTotal = subtotal + totalFoodGST + deliveryFee + deliveryGST + platformFee;

    return {
      subtotal,
      deliveryFee,
      totalCGST,
      totalSGST,
      foodIGST,
      deliveryIGST: deliveryIGSTVal,
      igst: foodIGST + deliveryIGSTVal,
      totalFoodGST,
      totalGST,
      deliveryCGST,
      deliverySGST,
      deliveryGST,
      grandTotal,
      sameState,
    };
  }, [
    cartItems.length,
    gstSettings,
    totals.subtotal,
    totals.deliveryFee,
    platformConfig,
    deliveryAddress.state,
    sellerState,
  ]);

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

  const orderGrandTotal = gstCalculation?.grandTotal ?? totalAmount;
  const remSub = Number(activeSubscription?.remaining_amount) || 0;
  const pdVal = Number(activeSubscription?.per_day_value) || 0;

  const potentialSubUsed = activeSubscription && remSub > 0 ? Math.min(orderGrandTotal, remSub) : 0;
  const potentialDaysDeducted = pdVal > 0 && potentialSubUsed > 0 ? Math.ceil(potentialSubUsed / pdVal) : 0;
  const potentialRemainingDays = activeSubscription != null
    ? Math.max(0, (Number(activeSubscription.remaining_days) || 0) - potentialDaysDeducted)
    : 0;

  const isSubMethod = paymentMethod === "subscription";
  const subscriptionUsedPreview = isSubMethod ? potentialSubUsed : 0;
  const daysDeductedPreview = isSubMethod ? potentialDaysDeducted : 0;
  const remainingDaysPreview = isSubMethod ? potentialRemainingDays : 0;

  const payableNow = isSubMethod ? Math.max(0, orderGrandTotal - potentialSubUsed) : orderGrandTotal;
  const insufficientWallet = walletBalance < orderGrandTotal;

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

  const buildOrderPayload = (method: string, isHybrid = false) => {
    const subUsed = (method === 'subscription' || isHybrid) ? potentialSubUsed : 0;
    const subDays = (method === 'subscription' || isHybrid) ? potentialDaysDeducted : 0;
    const remDays = activeSubscription != null ? Math.max(0, (Number(activeSubscription.remaining_days) || 0) - subDays) : 0;

    return {
      items: cartItems.map((item: any) => ({
        menuItemId: item.menuItem._id,
        name: item.menuItem.name,
        sellingPrice: item.menuItem.discountPrice || item.menuItem.sellingPrice,
        quantity: item.quantity,
        image: item.menuItem.image,
      })),
      sellerId: cart.sellerId,
      deliveryAddress,
      paymentMethod: isHybrid ? "hybrid" : method,
      totalAmount: gstCalculation ? gstCalculation.grandTotal : totalAmount,
      subtotal: totals.subtotal,
      deliveryFee: gstCalculation?.deliveryFee ?? totals.deliveryFee,
      platformFee: 0,
      gstAmount: gstCalculation ? gstCalculation.totalGST : totals.gst,
      gstBreakup: gstCalculation ? {
        cgst: gstCalculation.totalCGST,
        sgst: gstCalculation.totalSGST,
        igst: gstCalculation.igst,
        totalGST: gstCalculation.totalGST,
      } : null,
      subscriptionDeduction: activeSubscription && subUsed > 0 ? {
        subscriptionId: activeSubscription._id,
        amountUsed: subUsed,
        daysDeducted: subDays,
        remainingAmount: remSub - subUsed,
        remainingDays: remDays,
        perDayValue: pdVal,
        homeChefId: typeof activeSubscription.seller_id === 'object' ? activeSubscription.seller_id?._id : activeSubscription.seller_id,
      } : null,
    };
  };

  const placeOrderWithSubscription = async () => {
    if (!validateAddress()) return;
    if (!activeSubscription || potentialSubUsed <= 0) {
      toast({ title: "No Active Subscription", description: "You don't have an active subscription to use for this order.", variant: "destructive" });
      return;
    }

    // Calculate remaining amount after subscription
    const remainingAfterSub = orderGrandTotal - potentialSubUsed;
    if (remainingAfterSub > 0) {
      // Launch hybrid payment directly
      toast({
        title: "Partial Payment",
        description: `Subscription covers ₹${potentialSubUsed.toFixed(0)}. Need to pay ₹${remainingAfterSub.toFixed(0)}.`
      });
      return handleRazorpayPayment(true);
    }

    setIsLoading(true);
    try {
      // Full subscription coverage
      const orderResponse = await userAPI.placeOrder(buildOrderPayload("subscription"));
      toast({
        title: "Order placed! 🎉",
        description: `Paid fully from your subscription. ₹${subscriptionUsedPreview.toFixed(2)} deducted, ${daysDeductedPreview} days used.`
      });

      // Generate invoice immediately
      try {
        await userAPI.generateInvoice(orderResponse.order?._id || orderResponse._id);
        toast({ title: "Invoice generated! 📄", description: "Your invoice is ready for download" });
      } catch (invoiceErr: any) {
        console.log("Invoice generation failed:", invoiceErr);
      }

      clearCart();
      navigate("/orders");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const placeOrderWithWallet = async () => {
    if (!validateAddress()) return;
    if (walletBalance < orderGrandTotal) {
      toast({ title: "Insufficient Balance", description: `Your wallet has ₹${walletBalance}. You need ₹${orderGrandTotal.toFixed(2)}.`, variant: "destructive" });
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

  const handleRazorpayPayment = async (isHybrid = false) => {
    if (!validateAddress()) {
      return;
    }
    setIsOnlineModalOpen(true);
  };

  const handlePayment = () => {
    if (paymentMethod === "subscription") placeOrderWithSubscription();
    else if (paymentMethod === "wallet") placeOrderWithWallet();
    else if (paymentMethod === "cod") placeOrderWithCOD();
    else handleRazorpayPayment();
  };

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
                {/* Subscription - Show first if available */}
                {activeSubscription && potentialSubUsed > 0 && (
                  <label className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    paymentMethod === "subscription" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  )}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "subscription"}
                      onChange={() => setPaymentMethod("subscription")}
                      className="accent-primary"
                    />
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white">
                      <span className="text-sm font-bold">₹</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">Pay from My Plan</p>
                        <span className="text-sm font-bold text-success">
                          ₹{potentialSubUsed.toFixed(0)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {potentialSubUsed >= orderGrandTotal
                          ? "Fully covered by your subscription"
                          : `₹${potentialSubUsed.toFixed(0)} from subscription + ₹${(orderGrandTotal - potentialSubUsed).toFixed(0)} to pay`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {potentialDaysDeducted} days will be deducted • {potentialRemainingDays} days remaining
                      </p>
                    </div>
                  </label>
                )}

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
                        ? `Insufficient balance (need ₹${orderGrandTotal.toFixed(0)})`
                        : "Pay instantly from your wallet balance"}
                    </p>
                  </div>
                </label>

                {/* Pay Online */}
                <label className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  paymentMethod === "razorpay" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                )}>
                  <input type="radio" name="payment" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} className="accent-primary" />
                  <CreditCard size={24} className="text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Pay Online</p>
                    <p className="text-xs text-muted-foreground">UPI • PhonePe • GPay • Paytm</p>
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
                  const itemPrice = item.menuItem.discountPrice || item.menuItem.sellingPrice;
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
                    <p className="text-xs text-muted-foreground italic">Food GST (collected on behalf of seller)</p>
                    {gstCalculation.foodIGST > 0 ? (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IGST on items</span>
                        <span>₹{gstCalculation.foodIGST.toFixed(2)}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CGST ({formatGSTPercentage(GST_RATES.FOOD.CGST)})</span>
                          <span>₹{gstCalculation.totalCGST.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">SGST ({formatGSTPercentage(GST_RATES.FOOD.SGST)})</span>
                          <span>₹{gstCalculation.totalSGST.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </>
                ) : null}

                {/* Delivery - HIDDEN from user view */}
                {/*
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>₹{(gstCalculation?.deliveryFee ?? totals.deliveryFee).toFixed(2)}</span>
                </div>

                {gstCalculation && gstSettings?.gstApplicable && gstSettings?.deliveryGSTEnabled && (gstCalculation.deliveryFee ?? 0) > 0 ? (
                  <>
                    {gstCalculation.deliveryIGST > 0 ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">IGST on delivery</span>
                        <span>₹{gstCalculation.deliveryIGST.toFixed(2)}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">CGST on delivery</span>
                          <span>₹{gstCalculation.deliveryCGST.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">SGST on delivery</span>
                          <span>₹{gstCalculation.deliverySGST.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </>
                ) : null}
                */}

                {gstCalculation && gstSettings?.gstApplicable ? (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Total GST</span>
                    <span>₹{gstCalculation.totalGST.toFixed(2)}</span>
                  </div>
                ) : null}

                <div className="flex justify-between font-semibold border-t border-border pt-2">
                  <span>You pay</span>
                  <span>₹{orderGrandTotal.toFixed(2)}</span>
                </div>

                {/* Platform Fee - HIDDEN from user view */}
                {/*
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span>₹{gstCalculation ? gstCalculation.platformCommission.toFixed(2) : totals.platformFee.toFixed(2)}</span>
                </div>
                */}

                {/* Platform Commission GST - HIDDEN from user view */}
                {/*
                {gstCalculation && gstSettings?.gstApplicable && gstSettings?.platformGSTEnabled ? (
                  <div className="flex justify-between text-xs text-muted-foreground ml-4">
                    <span>+ GST on Platform Fee ({formatGSTPercentage(gstSettings.platformGSTRate)})</span>
                    <span>₹{gstCalculation.platformCommissionGST.toFixed(2)}</span>
                  </div>
                ) : null}
                */}

                {/* Delivery Fee - HIDDEN from user view */}
                {/*
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
                */}
              </div>

              {activeSubscription && potentialSubUsed > 0 && paymentMethod === "subscription" && (
                <div className="mt-4 p-3 rounded-lg border border-primary/30 bg-primary/5 text-sm space-y-1">
                  <p className="font-medium text-foreground">Dabba Nation (subscription)</p>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Order amount</span>
                    <span>₹{orderGrandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subscription used</span>
                    <span>₹{subscriptionUsedPreview.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Days deducted (estimate)</span>
                    <span>{daysDeductedPreview}</span>
                  </div>
                  <div className="flex justify-between font-medium text-foreground">
                    <span>Remaining days (after order)</span>
                    <span>{remainingDaysPreview}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-primary pt-1 border-t border-border">
                    <span>Pay now</span>
                    <span>₹{payableNow.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {paymentMethod === "wallet" && (
                <div className="mt-3 p-3 rounded-lg bg-success/10 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Wallet Balance</span>
                    <span>₹{walletBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground mt-1">
                    <span>After Payment</span>
                    <span>₹{(walletBalance - payableNow).toFixed(0)}</span>
                  </div>
                </div>
              )}

              <Button onClick={() => handlePayment()} disabled={isLoading} className="w-full mt-6 gradient-primary text-primary-foreground" size="lg">
                {isLoading ? (
                  <><Loader2 size={16} className="mr-2 animate-spin" /> Processing...</>
                ) : paymentMethod === "subscription" ? (
                  <><Crown size={16} className="mr-2" /> Pay ₹{potentialSubUsed.toFixed(0)} from My Plan</>
                ) : paymentMethod === "wallet" ? (
                  <><Wallet size={16} className="mr-2" /> Pay ₹{orderGrandTotal.toFixed(0)} from Wallet</>
                ) : paymentMethod === "cod" ? (
                  <><Banknote size={16} className="mr-2" /> Place Order (COD)</>
                ) : (
                  <><IndianRupee size={16} className="mr-2" /> Pay ₹{orderGrandTotal.toFixed(0)}</>
                )}
              </Button>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                {paymentMethod === "subscription" ? `Using your subscription balance. ${potentialDaysDeducted} days will be deducted.`
                  : paymentMethod === "wallet" ? "Instant payment from your wallet"
                    : paymentMethod === "cod" ? "Pay cash when your order is delivered"
                      : "Secure online payment via UPI / PhonePe"}
              </p>
            </Card>
          </div>
        </div>
      </div>

      <OnlinePaymentModal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        amount={orderGrandTotal}
        onPaymentSuccess={async (txnId) => {
          setIsLoading(true);
          try {
            const isHybrid = paymentMethod === "hybrid";
            const orderResponse = await userAPI.placeOrder(buildOrderPayload("online", isHybrid));
            try {
              await userAPI.generateInvoice(orderResponse.order?._id || orderResponse._id);
            } catch (invErr) {}
            toast({ title: "Payment successful! Order placed. 🎉" });
            clearCart();
            navigate("/orders");
          } catch (err: any) {
            toast({ title: "Order Placement Error", description: err?.message || "Failed to place order", variant: "destructive" });
          } finally {
            setIsLoading(false);
          }
        }}
      />
    </UserLayout>
  );
}
