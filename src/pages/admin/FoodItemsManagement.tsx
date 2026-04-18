import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";

interface FoodItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: { _id: string; name: string };
  seller_id?: { _id: string; businessName: string };
  image?: string;
  is_available: boolean;
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Seller {
  _id: string;
  businessName: string;
}

export default function FoodItemsManagement() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    seller_id: "",
    image: "",
    is_available: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchFoodItems();
    fetchCategories();
    fetchSellers();
  }, []);

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/admin/products");
      setFoodItems(res.products || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch food items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiRequest("/categories");
      setCategories(res.categories || []);
    } catch (error: any) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchSellers = async () => {
    try {
      const res = await apiRequest("/sellers");
      setSellers(res.sellers || []);
    } catch (error: any) {
      console.error("Failed to fetch sellers:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        price: Number(formData.price),
      };

      if (editingItem) {
        await apiRequest(`/products/${editingItem._id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        toast({ title: "Success", description: "Food item updated successfully" });
      } else {
        await apiRequest("/products", {
          method: "POST",
          body: JSON.stringify(data),
        });
        toast({ title: "Success", description: "Food item created successfully" });
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({ name: "", description: "", price: "", category_id: "", seller_id: "", image: "", is_available: true });
      fetchFoodItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save food item",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this food item?")) return;
    try {
      await apiRequest(`/products/${id}`, { method: "DELETE" });
      toast({ title: "Success", description: "Food item deleted successfully" });
      fetchFoodItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete food item",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      category_id: item.category_id?._id || "",
      seller_id: item.seller_id?._id || "",
      image: item.image || "",
      is_available: item.is_available,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({ name: "", description: "", price: "", category_id: "", seller_id: "", image: "", is_available: true });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Food Items Management</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Food Item
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {foodItems.map((item) => (
            <TableRow key={item._id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.category_id?.name || "-"}</TableCell>
              <TableCell>{item.seller_id?.businessName || "-"}</TableCell>
              <TableCell>₹{item.price}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${item.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {item.is_available ? "Available" : "Unavailable"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Food Item" : "Add Food Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Food Item Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Butter Chicken, Veg Thali"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Item description"
              />
            </div>
            <div className="space-y-2">
              <Label>Price (₹) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="150"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Seller/Restaurant</Label>
              <select
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={formData.seller_id}
                onChange={(e) => setFormData({ ...formData, seller_id: e.target.value })}
              >
                <option value="">-- Select Seller --</option>
                {sellers.map((seller) => (
                  <option key={seller._id} value={seller._id}>
                    {seller.businessName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              />
              <Label>Available</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
