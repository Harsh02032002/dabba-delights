import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/api";
import { Loader2, Plus, Edit2, Trash2, Users, CreditCard, TrendingUp, Clock, Store, Eye } from "lucide-react";
import { format } from "date-fns";

interface FormData {
  plan_name: string;
  description: string;
  total_amount: string;
  total_days: string;
  badge: string;
  features: string;
  banner_image: string;
  is_active: boolean;
  target_type?: string;
}

interface SubscriptionPlan {
  _id: string;
  plan_name: string;
  description?: string;
  total_amount: number;
  total_days: number;
  per_day_value: number;
  badge?: string;
  is_active: boolean;
  features?: string[];
  banner_image?: string;
  image?: string;
  target_type?: string;
  assigned_seller_id?: {
    _id: string;
    businessName: string;
    type: string;
    address?: {
      city?: string;
    };
  };
  createdAt: string;
}

interface UserSubscription {
  _id: string;
  user_id: { _id: string; name: string; email: string; phone?: string };
  plan_id?: { _id: string; plan_name: string };
  seller_id?: { _id: string; businessName: string; type: string; logo?: string };
  total_amount: number;
  remaining_amount: number;
  total_days: number;
  remaining_days: number;
  per_day_value: number;
  status: "active" | "expired";
  createdAt: string;
}

interface SubscriptionUsage {
  _id: string;
  user_id: { _id: string; name: string; email: string };
  order_id?: { _id: string; orderNumber: string; total: number };
  amount_used: number;
  days_used: number;
  date: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Stats {
  activeSubscriptions: number;
  expiredSubscriptions: number;
  newThisMonth: number;
  totalUsages: number;
  totalAmountUsed: number;
  activePlans: number;
}

export default function AdminSubscriptions() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("plans");
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [usage, setUsage] = useState<SubscriptionUsage[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [viewingPlan, setViewingPlan] = useState<SubscriptionPlan | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [customProductName, setCustomProductName] = useState("");
  const [customProductPrice, setCustomProductPrice] = useState("");
  const [customProductImage, setCustomProductImage] = useState<File | null>(null);
  const [customProductImagePreview, setCustomProductImagePreview] = useState<string | null>(null);
  const [editingCustomIndex, setEditingCustomIndex] = useState<number | null>(null);

  // Fetch dropdown data on mount
  useEffect(() => {
    fetchSellers();
  }, []);

  // Form state for creating/editing plan
  const [formData, setFormData] = useState<FormData>({
    plan_name: "",
    description: "",
    total_amount: "",
    total_days: "",
    badge: "",
    features: "",
    banner_image: "",
    is_active: true,
    target_type: "user",
  });

  const resetForm = () => {
    setFormData({
      plan_name: "",
      description: "",
      total_amount: "",
      total_days: "",
      badge: "",
      features: "",
      banner_image: "",
      is_active: true,
      target_type: "user",
    });
  };

  // Form state for assigning subscription to user or restaurant/seller
  const [assignFormData, setAssignFormData] = useState({
    assignFor: "user", // "user" or "seller"
    userId: "",
    sellerId: "",
    planId: "",
    totalAmount: "",
    totalDays: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
    fetchSellers();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "plans" || activeTab === "stats") {
        const plansRes = await apiRequest("/subscriptions/admin/plans");
        setPlans(plansRes.plans || []);
      }
      if (activeTab === "subscriptions") {
        const subsRes = await apiRequest("/subscriptions/admin/subscriptions");
        setSubscriptions(subsRes.subscriptions || []);
      }
      if (activeTab === "usage") {
        const usageRes = await apiRequest("/subscriptions/admin/usage");
        setUsage(usageRes.usage || []);
      }
      if (activeTab === "stats" || !stats) {
        const statsRes = await apiRequest("/subscriptions/admin/stats");
        setStats(statsRes.stats);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      console.log('=== FRONTEND FORM DEBUG ===');
      console.log('formData:', formData);
      
      const formDataObj = new FormData();
      
      // Only append non-empty values to prevent boundary issues
      if (formData.plan_name) formDataObj.append("plan_name", formData.plan_name);
      if (formData.description) formDataObj.append("description", formData.description);
      if (formData.total_amount) formDataObj.append("total_amount", formData.total_amount);
      if (formData.total_days) formDataObj.append("total_days", formData.total_days);
      if (formData.badge) formDataObj.append("badge", formData.badge);
      if (formData.max_orders_per_day) formDataObj.append("max_orders_per_day", formData.max_orders_per_day);
      if (formData.features) formDataObj.append("features", formData.features);
      if (formData.banner_image) formDataObj.append("banner_image", formData.banner_image);
      if (formData.target_type) formDataObj.append("target_type", formData.target_type);
      
      // Always append boolean values
      formDataObj.append("is_active", String(formData.is_active));
      
      if (imageFile) {
        formDataObj.append("image", imageFile);
      }

      console.log('FormData entries:');
      for (let [key, value] of formDataObj.entries()) {
        console.log(`${key}:`, value);
      }

      await apiRequest("/subscriptions/admin/plans", {
        method: "POST",
        body: formDataObj,
        headers: {}, // Let browser set multipart/form-data header
      });

      toast({ title: "Success", description: "Plan created successfully" });
      setIsCreateDialogOpen(false);
      resetForm();
      setImageFile(null);
      setImagePreview(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create plan",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;
    try {
      console.log('=== FRONTEND UPDATE DEBUG ===');
      console.log('formData:', formData);
      
      const formDataObj = new FormData();
      
      // Only append non-empty values to prevent boundary issues
      if (formData.plan_name) formDataObj.append("plan_name", formData.plan_name);
      if (formData.description) formDataObj.append("description", formData.description);
      if (formData.total_amount) formDataObj.append("total_amount", formData.total_amount);
      if (formData.total_days) formDataObj.append("total_days", formData.total_days);
      if (formData.badge) formDataObj.append("badge", formData.badge);
      if (formData.max_orders_per_day) formDataObj.append("max_orders_per_day", formData.max_orders_per_day);
      if (formData.features) formDataObj.append("features", formData.features);
      if (formData.banner_image) formDataObj.append("banner_image", formData.banner_image);
      if (formData.target_type) formDataObj.append("target_type", formData.target_type);
      
      // Always append boolean values
      formDataObj.append("is_active", String(formData.is_active));
      
      if (imageFile) {
        formDataObj.append("image", imageFile);
      }

      console.log('FormData entries:');
      for (let [key, value] of formDataObj.entries()) {
        console.log(`${key}:`, value);
      }

      await apiRequest(`/subscriptions/admin/plans/${editingPlan._id}`, {
        method: "PUT",
        body: formDataObj,
        headers: {}, // Let browser set multipart/form-data header
      });

      toast({ title: "Success", description: "Plan updated successfully" });
      setIsCreateDialogOpen(false);
      resetForm();
      setImageFile(null);
      setImagePreview(null);
      setEditingPlan(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update plan",
        variant: "destructive",
      });
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await apiRequest(`/subscriptions/admin/plans/${id}`, { method: "DELETE" });
      toast({ title: "Success", description: "Plan deleted successfully" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete plan",
        variant: "destructive",
      });
    }
  };

  const handleAdjustSubscription = async (subId: string, addBalance: number, addDays: number) => {
    try {
      await apiRequest(`/subscriptions/admin/adjust/${subId}`, {
        method: "PATCH",
        body: JSON.stringify({ addBalance, addDays }),
      });
      toast({ title: "Success", description: "Subscription adjusted successfully" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to adjust subscription",
        variant: "destructive",
      });
    }
  };

  const handleExpireSubscription = async (subId: string) => {
    if (!confirm("Are you sure you want to force expire this subscription?")) return;
    try {
      await apiRequest(`/subscriptions/admin/expire/${subId}`, {
        method: "POST",
        body: JSON.stringify({ reason: "Admin forced expiry" }),
      });
      toast({ title: "Success", description: "Subscription expired successfully" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to expire subscription",
        variant: "destructive",
      });
    }
  };

  const handleAssignSubscription = async () => {
    try {
      const data = {
        assignFor: assignFormData.assignFor,
        userId: assignFormData.assignFor === "user" ? assignFormData.userId : undefined,
        sellerId: assignFormData.sellerId,
        planId: assignFormData.planId || null,
        totalAmount: Number(assignFormData.totalAmount),
        totalDays: Number(assignFormData.totalDays),
        notes: assignFormData.notes,
      };

      await apiRequest("/subscriptions/admin/assign", {
        method: "POST",
        body: JSON.stringify(data),
      });

      toast({ title: "Success", description: `Subscription assigned to ${assignFormData.assignFor === "seller" ? "Restaurant/Seller" : "User"} successfully` });
      setIsAssignDialogOpen(false);
      setAssignFormData({ assignFor: "user", userId: "", sellerId: "", planId: "", totalAmount: "", totalDays: "", notes: "" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign subscription",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiRequest("/admin/users?limit=1000");
      setUsers(res.users || []);
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchSellers = async () => {
    try {
      setDropdownLoading(true);
      console.log("Fetching sellers...");
      const res = await apiRequest("/admin/sellers");
      console.log("Sellers response:", res);
      const sellersData = res.sellers || res.data || [];
      setSellers(Array.isArray(sellersData) ? sellersData : []);
    } catch (error: any) {
      console.error("Failed to fetch sellers:", error);
      toast({ title: "Error", description: "Failed to fetch sellers", variant: "destructive" });
    } finally {
      setDropdownLoading(false);
    }
  };

  const openAssignDialog = () => {
    fetchUsers();
    fetchSellers();
    setIsAssignDialogOpen(true);
  };

  const handleEditCustomProduct = (index: number) => {
    try {
      const items = JSON.parse(formData.banner_image || '[]');
      const item = items[index];
      setCustomProductName(item.name);
      setCustomProductPrice(String(item.price));
      setCustomProductImagePreview(item.image || null);
      setEditingCustomIndex(index);
    } catch (e) {
      console.error('Error editing custom product:', e);
    }
  };

  const handleUpdateCustomProduct = () => {
    if (customProductName && customProductPrice && editingCustomIndex !== null) {
      try {
        const items = JSON.parse(formData.banner_image || '[]');
        items[editingCustomIndex] = { 
          name: customProductName, 
          price: Number(customProductPrice),
          image: customProductImagePreview || null 
        };
        setFormData({ ...formData, banner_image: JSON.stringify(items) });
        setCustomProductName("");
        setCustomProductPrice("");
        setCustomProductImage(null);
        setCustomProductImagePreview(null);
        setEditingCustomIndex(null);
      } catch (e) {
        console.error('Error updating custom product:', e);
      }
    }
  };

  const handleCancelEdit = () => {
    setCustomProductName("");
    setCustomProductPrice("");
    setCustomProductImage(null);
    setCustomProductImagePreview(null);
    setEditingCustomIndex(null);
  };

  // Handle custom product image change
  const handleCustomProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomProductImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      plan_name: plan.plan_name,
      description: plan.description || "",
      total_amount: String(plan.total_amount),
      total_days: String(plan.total_days),
      badge: plan.badge || "",
      features: (plan.features || []).join("\n"),
      banner_image: plan.banner_image || "",
      is_active: plan.is_active,
    });
  };

  const openViewDialog = (plan: SubscriptionPlan) => {
    setViewingPlan(plan);
    setIsViewDialogOpen(true);
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color.replace("text-", "bg-").replace("600", "100")}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          {activeTab === "plans" && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          )}
          {activeTab === "subscriptions" && (
            <Button onClick={openAssignDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Assign Subscription
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  title="Active Subscriptions"
                  value={stats.activeSubscriptions}
                  icon={Users}
                  color="text-green-600"
                />
                <StatCard
                  title="Expired Subscriptions"
                  value={stats.expiredSubscriptions}
                  icon={Clock}
                  color="text-red-600"
                />
                <StatCard
                  title="New This Month"
                  value={stats.newThisMonth}
                  icon={TrendingUp}
                  color="text-blue-600"
                />
                <StatCard
                  title="Total Usages"
                  value={stats.totalUsages}
                  icon={CreditCard}
                  color="text-purple-600"
                />
                <StatCard
                  title="Total Amount Used"
                  value={`₹${stats.totalAmountUsed.toLocaleString()}`}
                  icon={CreditCard}
                  color="text-orange-600"
                />
                <StatCard
                  title="Active Plans"
                  value={stats.activePlans}
                  icon={CreditCard}
                  color="text-teal-600"
                />
              </div>
            )}
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-4">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : plans.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No subscription plans found. Create your first plan!
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Card key={plan._id} className={!plan.is_active ? "opacity-60" : ""}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                          {plan.badge && (
                            <Badge className="mt-1" variant="secondary">
                              {plan.badge}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openViewDialog(plan)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(plan)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(plan._id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {plan.image ? (
                      <img
                        src={plan.image}
                        alt={plan.plan_name}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-semibold">₹{plan.total_amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{plan.total_days} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Per Day:</span>
                        <span>₹{plan.per_day_value.toFixed(2)}</span>
                      </div>
                      {plan.min_order_value > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Min Order:</span>
                          <span>₹{plan.min_order_value}</span>
                        </div>
                      )}
                      {plan.features && plan.features.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground mb-1">Features:</p>
                          <ul className="text-sm list-disc list-inside">
                            {plan.features.slice(0, 3).map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                          {plan.features.length > 3 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              +{plan.features.length - 3} more
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Subscriptions Tab - User-Home Chef Assignments */}
          <TabsContent value="subscriptions" className="space-y-4">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : subscriptions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No user subscriptions found.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {subscriptions.map((sub) => (
                  <Card key={sub._id} className={sub.seller_id ? "border-l-4 border-l-orange-500" : ""}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <p className="font-semibold">{sub.user_id?.name || "Unknown User"}</p>
                          </div>
                          <p className="text-sm text-muted-foreground ml-6">{sub.user_id?.email}</p>
                          
                          {sub.seller_id && (
                            <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="flex items-center gap-2">
                                <Store className="w-4 h-4 text-orange-600" />
                                <span className="font-medium text-orange-800">Home Chef: {sub.seller_id.businessName}</span>
                              </div>
                              <p className="text-xs text-orange-600 mt-1 ml-6">
                                Admin needs to pay this home chef from received payment
                              </p>
                            </div>
                          )}
                          
                          {sub.plan_id && (
                            <Badge variant="outline" className="mt-2 ml-6">
                              Plan: {sub.plan_id.plan_name}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-4 text-sm">
                          <div className="text-center p-2 bg-muted rounded">
                            <p className="text-muted-foreground text-xs">Balance</p>
                            <p className="font-semibold text-green-600">₹{sub.remaining_amount.toFixed(0)}</p>
                          </div>
                          <div className="text-center p-2 bg-muted rounded">
                            <p className="text-muted-foreground text-xs">Days Left</p>
                            <p className="font-semibold">{sub.remaining_days}</p>
                          </div>
                          <div className="text-center p-2 bg-muted rounded">
                            <p className="text-muted-foreground text-xs">Per Day</p>
                            <p className="font-semibold">₹{sub.per_day_value.toFixed(0)}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 items-end">
                          <Badge className={sub.status === "active" ? "bg-green-500" : "bg-gray-500"}>
                            {sub.status}
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const balance = prompt("Amount to add (use negative to deduct):");
                                const days = prompt("Days to add (use negative to deduct):");
                                if (balance !== null && days !== null) {
                                  handleAdjustSubscription(sub._id, Number(balance), Number(days));
                                }
                              }}
                            >
                              Adjust
                            </Button>
                            {sub.status === "active" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleExpireSubscription(sub._id)}
                              >
                                Expire
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-4">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : usage.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No subscription usage records found.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {usage.map((u) => (
                  <Card key={u._id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">{u.user_id?.name || "Unknown User"}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(u.date), "MMM d, yyyy h:mm a")}
                          </p>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Amount Used</p>
                            <p className="font-semibold text-green-600">₹{u.amount_used.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Days Deducted</p>
                            <p className="font-semibold">{u.days_used}</p>
                          </div>
                        </div>
                        {u.order_id && (
                          <Badge variant="outline">Order #{u.order_id.orderNumber}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create/Edit Dialog */}
        <Dialog
          open={isCreateDialogOpen || !!editingPlan}
          onOpenChange={(open) => {
            if (open) {
              fetchSellers();
            }
            if (!open) {
              setIsCreateDialogOpen(false);
              setEditingPlan(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Edit Plan" : "Create Subscription Plan"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Plan Name *</Label>
                <Input
                  value={formData.plan_name}
                  onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                  placeholder="e.g., Monthly Dabba Plan"
                />
              </div>
              <div className="space-y-2">
                <Label>Subscription For (Target Audience) *</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background font-medium"
                  value={formData.target_type || "user"}
                  onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
                >
                  <option value="user">🧑‍🍳 Customer / User (Meal Plan)</option>
                  <option value="home_chef">🏡 Home Chef (Home Chef Plan)</option>
                  <option value="restaurant">🏪 Restaurant (Restaurant Plan)</option>
                  <option value="seller">🏬 Cloud Kitchen / General Seller Plan</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description of the plan"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Amount (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                    placeholder="3540"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Days *</Label>
                  <Input
                    type="number"
                    value={formData.total_days}
                    onChange={(e) => setFormData({ ...formData, total_days: e.target.value })}
                    placeholder="30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Badge (e.g., POPULAR, BEST VALUE)</Label>
                <Input
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="POPULAR"
                />
              </div>
              <div className="space-y-2">
                <Label>Features (one per line)</Label>
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Free delivery&#10;Priority support&#10;No minimum order"
                />
              </div>
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomProductImageChange}
                  className="text-sm"
                />
                {customProductImagePreview && (
                  <div className="mt-2 relative inline-block">
                    <img 
                      src={customProductImagePreview} 
                      alt="Banner preview" 
                      className="w-32 h-20 rounded object-cover border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCustomProductImage(null);
                        setCustomProductImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  This image will be shown on the subscription card
                </p>
              </div>

             

              <div className="space-y-2">
                <Label>Plan Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  {editingPlan?.image && !imagePreview && (
                    <img
                      src={editingPlan.image}
                      alt="Current"
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingPlan(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingPlan ? handleUpdatePlan : handleCreatePlan}>
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Plan Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Plan Details - {viewingPlan?.plan_name}</DialogTitle>
            </DialogHeader>
            {viewingPlan && (
              <div className="space-y-6">
                {viewingPlan.image && (
                  <div className="w-full h-64 rounded-lg overflow-hidden">
                    <img
                      src={viewingPlan.image}
                      alt={viewingPlan.plan_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Plan Name</Label>
                    <p className="font-medium text-lg">{viewingPlan.plan_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Badge</Label>
                    <p className="font-medium">{viewingPlan.badge || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Price</Label>
                    <p className="font-medium text-lg">₹{viewingPlan.total_amount}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Duration</Label>
                    <p className="font-medium">{viewingPlan.total_days} days</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Per Day Value</Label>
                    <p className="font-medium">₹{viewingPlan.per_day_value.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Created At</Label>
                    <p className="font-medium">{new Date(viewingPlan.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1">{viewingPlan.description || "No description available"}</p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Features</Label>
                  <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                    {(viewingPlan.features || []).map((f: string, i: number) => (
                      <li key={i}>{f}</li>
                    ))}
                    {(!viewingPlan.features || viewingPlan.features.length === 0) && (
                      <li className="text-muted-foreground">No features specified</li>
                    )}
                  </ul>
                </div>
                
                <div className="flex gap-4 pt-4 border-t">
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${viewingPlan.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {viewingPlan.is_active ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Assign Subscription Dialog */}
        <Dialog
          open={isAssignDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsAssignDialogOpen(false);
              setAssignFormData({ assignFor: "user", userId: "", sellerId: "", planId: "", totalAmount: "", totalDays: "", notes: "" });
            }
          }}
        >
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Assign Subscription {assignFormData.assignFor === "seller" ? "to Restaurant / Seller" : "to User"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Assign Subscription To *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={assignFormData.assignFor === "user" ? "default" : "outline"}
                    className="w-full text-xs font-semibold"
                    onClick={() => setAssignFormData({ ...assignFormData, assignFor: "user" })}
                  >
                    🧑‍🍳 Customer / User
                  </Button>
                  <Button
                    type="button"
                    variant={assignFormData.assignFor === "home_chef" ? "default" : "outline"}
                    className="w-full text-xs font-semibold"
                    onClick={() => setAssignFormData({ ...assignFormData, assignFor: "home_chef" })}
                  >
                    🏡 Home Chef
                  </Button>
                  <Button
                    type="button"
                    variant={assignFormData.assignFor === "restaurant" ? "default" : "outline"}
                    className="w-full text-xs font-semibold"
                    onClick={() => setAssignFormData({ ...assignFormData, assignFor: "restaurant" })}
                  >
                    🏪 Restaurant
                  </Button>
                  <Button
                    type="button"
                    variant={assignFormData.assignFor === "seller" ? "default" : "outline"}
                    className="w-full text-xs font-semibold"
                    onClick={() => setAssignFormData({ ...assignFormData, assignFor: "seller" })}
                  >
                    🏬 Cloud Kitchen
                  </Button>
                </div>
              </div>

              {assignFormData.assignFor === "user" && (
                <div className="space-y-2">
                  <Label>Select User *</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    value={assignFormData.userId}
                    onChange={(e) => setAssignFormData({ ...assignFormData, userId: e.target.value })}
                  >
                    <option value="">-- Select a user --</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-2">
                <Label>
                  {assignFormData.assignFor === "home_chef" ? "Select Home Chef *" :
                   assignFormData.assignFor === "restaurant" ? "Select Restaurant *" :
                   assignFormData.assignFor === "seller" ? "Select Seller / Cloud Kitchen *" :
                   "Select Seller / Restaurant *"}
                </Label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={assignFormData.sellerId}
                  onChange={(e) => setAssignFormData({ ...assignFormData, sellerId: e.target.value })}
                >
                  <option value="">-- Select a seller --</option>
                  {sellers.map((seller) => (
                    <option key={seller._id} value={seller._id}>
                      {seller.businessName} ({seller.type.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Select Plan (optional)</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={assignFormData.planId}
                  onChange={(e) => setAssignFormData({ ...assignFormData, planId: e.target.value })}
                >
                  <option value="">-- No Plan --</option>
                  {plans.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.plan_name} - ₹{plan.total_amount}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Amount (₹) *</Label>
                  <Input
                    type="number"
                    value={assignFormData.totalAmount}
                    onChange={(e) => setAssignFormData({ ...assignFormData, totalAmount: e.target.value })}
                    placeholder="3540"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Days *</Label>
                  <Input
                    type="number"
                    value={assignFormData.totalDays}
                    onChange={(e) => setAssignFormData({ ...assignFormData, totalDays: e.target.value })}
                    placeholder="30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={assignFormData.notes}
                  onChange={(e) => setAssignFormData({ ...assignFormData, notes: e.target.value })}
                  placeholder="Admin assignment notes"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAssignDialogOpen(false);
                    setAssignFormData({ userId: "", sellerId: "", planId: "", totalAmount: "", totalDays: "", notes: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAssignSubscription}>
                  Assign Subscription
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}
