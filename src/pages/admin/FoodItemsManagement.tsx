import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, apiUpload } from "@/lib/api";
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
import { Loader2, Plus, Edit2, Trash2, ImagePlus, X } from "lucide-react";

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
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    seller_id: "",
    is_available: true,
  });
  // Image state — either a File (new upload) or existing URL string
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  // Always use adminToken for product management
  const adminToken = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchFoodItems();
    fetchCategories();
    fetchSellers();
  }, []);

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/admin/products", { authToken: adminToken });
      setFoodItems(res.products || res.items || []);
    } catch {
      // fallback to /products
      try {
        const res2 = await apiRequest("/products", { authToken: adminToken });
        setFoodItems(res2.products || res2.items || []);
      } catch (err: any) {
        toast({ title: "Error", description: err.message || "Failed to fetch food items", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiRequest("/admin/categories", { authToken: adminToken });
      setCategories(res.categories || []);
    } catch {}
  };

  const fetchSellers = async () => {
    try {
      const res = await apiRequest("/admin/sellers", { authToken: adminToken });
      setSellers(res.sellers || []);
    } catch {}
  };

  // ── Handle image file selection ─────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit: use FormData + apiUpload so multer can parse image ──
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Validation", description: "Food item name is required", variant: "destructive" });
      return;
    }
    if (!formData.price || isNaN(Number(formData.price))) {
      toast({ title: "Validation", description: "Valid price is required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("price", formData.price);
      fd.append("is_available", String(formData.is_available));
      if (formData.category_id) fd.append("category_id", formData.category_id);
      if (formData.seller_id)   fd.append("seller_id",   formData.seller_id);
      if (imageFile)            fd.append("image",       imageFile);
      else if (imagePreview && imagePreview.startsWith("http")) fd.append("imageUrl", imagePreview);

      if (editingItem) {
        await apiUpload(`/products/${editingItem._id}`, fd, "PUT", 30000, adminToken);
        toast({ title: "✅ Updated", description: "Food item updated successfully" });
      } else {
        await apiUpload("/products", fd, "POST", 30000, adminToken);
        toast({ title: "✅ Created", description: "Food item created successfully" });
      }

      closeDialog();
      fetchFoodItems();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save food item", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this food item?")) return;
    try {
      await apiRequest(`/products/${id}`, { method: "DELETE", authToken: adminToken });
      toast({ title: "✅ Deleted", description: "Food item deleted" });
      fetchFoodItems();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete", variant: "destructive" });
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
      is_available: item.is_available,
    });
    setImageFile(null);
    setImagePreview(item.image || "");
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({ name: "", description: "", price: "", category_id: "", seller_id: "", is_available: true });
    setImageFile(null);
    setImagePreview("");
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    clearImage();
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
            <TableHead>Image</TableHead>
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
              <TableCell>
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No img</div>
                )}
              </TableCell>
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
          {foodItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                No food items found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Food Item" : "Add Food Item"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Product Image</Label>
              <div className="flex items-start gap-3">
                {/* Preview */}
                <div
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <ImagePlus className="w-6 h-6" />
                      <span className="text-xs">Upload</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="w-4 h-4 mr-2" />
                    {imagePreview ? "Change Image" : "Choose Image"}
                  </Button>
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full text-red-500 hover:text-red-600"
                      onClick={clearImage}
                    >
                      <X className="w-4 h-4 mr-1" /> Remove
                    </Button>
                  )}
                  {imageFile && (
                    <p className="text-xs text-muted-foreground truncate">
                      📎 {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">JPG, PNG, WEBP · Max 5MB</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label>Food Item Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Butter Chicken, Veg Thali"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Item description"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label>Price (₹) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="150"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Seller */}
            <div className="space-y-2">
              <Label>Seller / Restaurant</Label>
              <select
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={formData.seller_id}
                onChange={(e) => setFormData({ ...formData, seller_id: e.target.value })}
              >
                <option value="">-- Select Seller --</option>
                {sellers.map((seller) => (
                  <option key={seller._id} value={seller._id}>{seller.businessName}</option>
                ))}
              </select>
            </div>

            {/* Available toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_available"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              />
              <Label htmlFor="is_available">Available for ordering</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
