import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { UserLayout } from "@/layouts/UserLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { Loader2, ShoppingBag, Plus, Minus, MapPin, Crown, ArrowLeft, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface SubscriptionItem {
  _id: string;
  name: string;
  description?: string;
  sellingPrice: number;
  discountPrice?: number;
  image?: string;
  category?: string;
  isAvailable: boolean;
}

interface Subscription {
  _id: string;
  remaining_amount: number;
  remaining_days: number;
  per_day_value: number;
  seller: {
    _id: string;
    businessName: string;
    type: string;
    logo?: string;
    address?: any;
  };
}


export default function SubscriptionItems() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SubscriptionItem | null>(null);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: ""
  });

  useEffect(() => {
    fetchSubscriptionItems();
  }, []);

  const fetchSubscriptionItems = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/subscriptions/my-items");
      
      if (res.success) {
        setSubscription(res.subscription);
        setItems(res.items || []);
      } else {
        toast({ title: "Error", description: res.message || "Failed to load items", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openOrderDialog = (item: SubscriptionItem, quantity: number = 1) => {
    setSelectedItem(item);
    setOrderQuantity(quantity);
    setShowAddressDialog(true);
  };

  const placeDirectOrder = async () => {
    if (!validateAddress()) {
      toast({ title: "Missing Information", description: "Please fill in all address fields", variant: "destructive" });
      return;
    }

    if (!selectedItem || !subscription) {
      toast({ title: "Error", description: "No item selected", variant: "destructive" });
      return;
    }

    const price = selectedItem.discountPrice || selectedItem.sellingPrice;
    const orderTotal = price * orderQuantity;
    
    if (subscription.remaining_amount < orderTotal) {
      toast({ title: "Insufficient Balance", description: `Need ₹${orderTotal}, have ₹${subscription.remaining_amount}`, variant: "destructive" });
      return;
    }

    try {
      setPlacingOrder(true);
      
      const res = await apiRequest("/subscriptions/place-order", {
        method: "POST",
        body: JSON.stringify({
          items: [{
            menuItemId: selectedItem._id,
            name: selectedItem.name,
            price: price,
            quantity: orderQuantity,
            image: selectedItem.image
          }],
          deliveryAddress: {
            fullAddress: `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.pincode}`,
            street: deliveryAddress.street,
            city: deliveryAddress.city,
            state: deliveryAddress.state,
            pincode: deliveryAddress.pincode,
            phone: deliveryAddress.phone
          }
        })
      });

      if (res.success) {
        toast({ 
          title: "🎉 Order Placed!", 
          description: res.message || `Ordered ${selectedItem.name} x${orderQuantity}`
        });
        setShowAddressDialog(false);
        setSelectedItem(null);
        setOrderQuantity(1);
        navigate("/orders");
      } else {
        toast({ title: "Error", description: res.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setPlacingOrder(false);
    }
  };

  const validateAddress = () => {
    return deliveryAddress.street && deliveryAddress.city && deliveryAddress.pincode && deliveryAddress.phone;
  };


  if (loading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

  if (!subscription) {
    return (
      <UserLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold">My Subscription Items</h1>
          </div>
          
          <Card className="p-8 text-center">
            <Crown className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Active Subscription</h2>
            <p className="text-muted-foreground mb-4">
              You don't have an active subscription. Purchase a plan to see your food items here.
            </p>
            <Button onClick={() => navigate("/subscriptions")}>
              View Subscription Plans
            </Button>
          </Card>
        </div>
      </UserLayout>
    );
  }

  const orderTotal = selectedItem ? (selectedItem.discountPrice || selectedItem.sellingPrice) * orderQuantity : 0;

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">My Subscription Items</h1>
            <p className="text-sm text-muted-foreground">
              From {subscription.seller.businessName}
            </p>
          </div>
        </div>

        {/* Subscription Info Card */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white">
                  <Crown size={24} />
                </div>
                <div>
                  <p className="font-semibold text-green-800">Active Subscription</p>
                  <p className="text-sm text-green-600">
                    ₹{subscription.remaining_amount.toFixed(2)} remaining • {subscription.remaining_days} days left
                  </p>
                </div>
              </div>
              <Badge className="bg-green-500 text-white">Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Food Items Grid */}
        <h2 className="text-lg font-semibold mb-4">Available Items</h2>
        
        {items.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No food items available in your subscription plan.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item._id} className={`overflow-hidden ${!item.isAvailable ? 'opacity-60' : ''}`}>
                {item.image && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    {item.category && (
                      <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                    )}
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      {item.discountPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">₹{item.discountPrice}</span>
                          <span className="text-sm text-muted-foreground line-through">₹{item.sellingPrice}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-lg">₹{item.sellingPrice}</span>
                      )}
                    </div>
                    
                    {item.isAvailable ? (
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-emerald-600"
                        onClick={() => openOrderDialog(item)}
                      >
                        Order Now
                      </Button>
                    ) : (
                      <Badge variant="destructive">Not Available</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Address Dialog */}
        <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin size={20} />
                Delivery Address
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Quantity Selector */}
              {selectedItem && (
                <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                  <span className="font-medium">Quantity</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                    >
                      <Minus size={16} />
                    </Button>
                    <span className="w-8 text-center font-medium">{orderQuantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setOrderQuantity(orderQuantity + 1)}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="street">Street Address *</Label>
                <Input 
                  id="street" 
                  value={deliveryAddress.street}
                  onChange={(e) => setDeliveryAddress({...deliveryAddress, street: e.target.value})}
                  placeholder="House number, street name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input 
                    id="city" 
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state" 
                    value={deliveryAddress.state}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                    placeholder="State"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input 
                    id="pincode" 
                    value={deliveryAddress.pincode}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, pincode: e.target.value})}
                    placeholder="Pincode"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input 
                    id="phone" 
                    value={deliveryAddress.phone}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, phone: e.target.value})}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              
              {/* Order Summary */}
              {selectedItem && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Order Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>{selectedItem.name} x {orderQuantity}</span>
                      <span>₹{orderTotal.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₹{orderTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  {subscription.remaining_amount < orderTotal && (
                    <p className="text-sm text-red-500 mt-2">
                      Insufficient balance. Need ₹{(orderTotal - subscription.remaining_amount).toFixed(2)} more.
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddressDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={placeDirectOrder}
                disabled={placingOrder || !validateAddress() || (selectedItem ? subscription.remaining_amount < orderTotal : false)}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                {placingOrder ? (
                  <><Loader2 size={16} className="mr-2 animate-spin" /> Placing...</>
                ) : (
                  <><CheckCircle size={16} className="mr-2" /> Confirm Order</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
}
