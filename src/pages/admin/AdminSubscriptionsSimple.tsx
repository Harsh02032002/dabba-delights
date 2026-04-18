import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Crown } from "lucide-react";
import { AdminLayout } from "@/layouts/AdminLayout";

interface SubscriptionPlan {
  _id: string;
  plan_name: string;
  description?: string;
  total_amount: number;
  total_days: number;
  per_day_value: number;
  banner_image?: string;
  badge?: string;
  features?: string[];
  is_active: boolean;
}

export default function AdminSubscriptionsSimple() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    plan_name: "",
    description: "",
    total_amount: "",
    total_days: "",
    badge: "",
    features: "",
    banner_image: "",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await apiRequest("/admin/subscriptions/plans");
      if (res.success) {
        setPlans(res.plans || []);
      }
    } catch (err: any) {
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        plan_name: plan.plan_name,
        description: plan.description || "",
        total_amount: String(plan.total_amount),
        total_days: String(plan.total_days),
        badge: plan.badge || "",
        features: (plan.features || []).join("\n"),
        banner_image: plan.banner_image || "",
      });
    } else {
      setEditingPlan(null);
      setFormData({
        plan_name: "",
        description: "",
        total_amount: "",
        total_days: "",
        badge: "",
        features: "",
        banner_image: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        plan_name: formData.plan_name,
        description: formData.description,
        total_amount: Number(formData.total_amount),
        total_days: Number(formData.total_days),
        badge: formData.badge,
        features: formData.features.split("\n").filter(f => f.trim()),
        banner_image: formData.banner_image,
      };

      if (editingPlan) {
        await apiRequest(`/admin/subscriptions/plans/${editingPlan._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Plan updated");
      } else {
        await apiRequest("/admin/subscriptions/plans", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Plan created");
      }
      setDialogOpen(false);
      fetchPlans();
    } catch (err: any) {
      toast.error(err.message || "Failed to save plan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    try {
      await apiRequest(`/admin/subscriptions/plans/${id}`, { method: "DELETE" });
      toast.success("Plan deleted");
      fetchPlans();
    } catch (err: any) {
      toast.error("Failed to delete plan");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Subscription Plans</h1>
            <p className="text-muted-foreground">Manage subscription plans for users</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingPlan ? "Edit Plan" : "Create Plan"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input
                    value={formData.plan_name}
                    onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                    placeholder="e.g., Weekly Meal Plan"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Plan description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Amount (₹)</Label>
                    <Input
                      type="number"
                      value={formData.total_amount}
                      onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                      placeholder="e.g., 5000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Days</Label>
                    <Input
                      type="number"
                      value={formData.total_days}
                      onChange={(e) => setFormData({ ...formData, total_days: e.target.value })}
                      placeholder="e.g., 30"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Badge (optional)</Label>
                  <Input
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g., Popular, Best Value"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Features (one per line)</Label>
                  <Textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Feature 1\nFeature 2\nFeature 3"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Banner Image URL</Label>
                  <Input
                    value={formData.banner_image}
                    onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <Button className="w-full" onClick={handleSubmit}>
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan._id}>
              {plan.banner_image && (
                <div className="h-40 overflow-hidden">
                  <img
                    src={plan.banner_image}
                    alt={plan.plan_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                  {plan.badge && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {plan.badge}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{formatCurrency(plan.total_amount)}</span>
                  <span className="text-muted-foreground">for {plan.total_days} days</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  ₹{plan.per_day_value.toFixed(0)} per day value
                </p>
                {plan.features && plan.features.length > 0 && (
                  <ul className="space-y-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="text-sm flex items-center gap-2">
                        <Crown className="w-3 h-3 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenDialog(plan)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(plan._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {plans.length === 0 && !loading && (
          <div className="text-center py-12">
            <Crown className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No subscription plans yet</p>
            <Button className="mt-4" onClick={() => handleOpenDialog()}>
              Create your first plan
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
