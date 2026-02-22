import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { paymentAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { MapPin, IndianRupee, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { cart, getTotal, clearCart } = useCart();

  const cartItems = cart?.items || [];
  const totals = getTotal();
  const totalAmount = totals?.total || 0;

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<"razorpay" | "stripe">("razorpay");

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

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

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setDeliveryAddress((prev) => ({ ...prev, [name]: value }));
  };

  const validateAddress = () => {
    if (
      !deliveryAddress.street ||
      !deliveryAddress.city ||
      !deliveryAddress.pincode
    ) {
      toast({
        title: "Please fill in all address fields",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleRazorpayPayment = async () => {
    if (!validateAddress()) return;

    if (!window.Razorpay) {
      toast({
        title: "Razorpay SDK not loaded",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await paymentAPI.createRazorpayOrder({
        amount: totalAmount,
        currency: "INR",
        orderId: `ORDER-${Date.now()}`,
        description: `Order from Dabba Nation - ${cartItems.length} items`,
      });

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to create order"
        );
      }

      const options = {
        key: response.key,
        amount: response.amount,
        currency: response.currency,
        order_id: response.orderId,
        handler: async (paymentRes: any) => {
          try {
            const verifyRes =
              await paymentAPI.verifyRazorpayPayment({
                razorpayOrderId: response.orderId,
                razorpayPaymentId:
                  paymentRes.razorpay_payment_id,
                razorpaySignature:
                  paymentRes.razorpay_signature,
                cartItems: cartItems.map((item: any) => ({
                  productId: item.menuItem._id,
                  quantity: item.quantity,
                  price:
                    item.menuItem.discountPrice ||
                    item.menuItem.price,
                })),
                totalAmount,
                deliveryAddress,
              });

            if (verifyRes?.success) {
              toast({
                title: "Payment successful! Order placed.",
              });
              clearCart();
              navigate(`/orders/${verifyRes.order._id}`);
            } else {
              throw new Error(
                verifyRes?.message || "Verification failed"
              );
            }
          } catch (err: any) {
            toast({
              title: "Payment verification failed",
              description: err.message,
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#3b82f6" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripePayment = async () => {
    if (!validateAddress()) return;

    setIsLoading(true);

    try {
      const response =
        await paymentAPI.createStripeIntent({
          amount: totalAmount,
          currency: "inr",
          orderId: `ORDER-${Date.now()}`,
          description: `Order from Dabba Nation - ${cartItems.length} items`,
        });

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to create payment intent"
        );
      }

      toast({
        title:
          "Stripe integration ready (Hosted checkout recommended)",
      });

      console.log(
        "Stripe client secret:",
        response.clientSecret
      );
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    paymentMethod === "razorpay"
      ? handleRazorpayPayment()
      : handleStripePayment();
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-3xl font-bold">
          Checkout
        </h1>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">
                Delivery Address
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="street">
                    Street Address
                  </Label>
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="street"
                      name="street"
                      value={deliveryAddress.street}
                      onChange={handleAddressChange}
                      className="pl-10"
                      placeholder="123 Main St"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={deliveryAddress.city}
                      onChange={handleAddressChange}
                      placeholder="Mumbai"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={deliveryAddress.state}
                      onChange={handleAddressChange}
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pincode">
                    Pincode
                  </Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={deliveryAddress.pincode}
                    onChange={handleAddressChange}
                    placeholder="400001"
                  />
                </div>
              </div>

              <h2 className="mb-4 mt-8 text-xl font-semibold">
                Payment Method
              </h2>

              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={
                      paymentMethod === "razorpay"
                    }
                    onChange={() =>
                      setPaymentMethod("razorpay")
                    }
                  />
                  <span>
                    Razorpay (UPI / Card / Netbanking)
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={
                      paymentMethod === "stripe"
                    }
                    onChange={() =>
                      setPaymentMethod("stripe")
                    }
                  />
                  <span>
                    Stripe (International Cards)
                  </span>
                </label>
              </div>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4 p-6">
              <h2 className="mb-4 text-xl font-semibold">
                Order Summary
              </h2>

              <div className="space-y-2">
                {cartItems.map((item: any) => (
                  <div
                    key={item.menuItem._id}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.menuItem.name} x
                      {item.quantity}
                    </span>
                    <span>
                      ₹
                      {(
                        (item.menuItem.discountPrice ||
                          item.menuItem.price) *
                        item.quantity
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}

                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="flex items-center gap-1">
                      <IndianRupee size={18} />
                      {totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isLoading}
                className="mt-6 w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2
                      size={16}
                      className="mr-2 animate-spin"
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <IndianRupee
                      size={16}
                      className="mr-2"
                    />
                    Pay ₹
                    {totalAmount.toLocaleString("en-IN")}
                  </>
                )}
              </Button>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Secure payment powered by{" "}
                {paymentMethod === "razorpay"
                  ? "Razorpay"
                  : "Stripe"}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}