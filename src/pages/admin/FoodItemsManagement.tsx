import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, apiUpload, getImageUrl } from "@/lib/api";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Loader2, Plus, Edit2, Trash2, ImagePlus, X, UtensilsCrossed } from "lucide-react";

interface FoodItem {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  sellingPrice?: number;
  category?: string;
  category_id?: { _id: string; name: string };
  seller_id?: { _id: string; businessName: string };
  sellerId?: { _id: string; businessName?: string; name?: string };
  image?: string;
  is_available?: boolean;
  isAvailable?: boolean;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const adminToken = localStorage.getItem("dabba_admin_token") || localStorage.getItem("token") || "";

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
      fd.append("sellingPrice", formData.price);
      fd.append("is_available", String(formData.is_available));
      fd.append("isAvailable", String(formData.is_available));
      if (formData.category_id) {
        fd.append("category_id", formData.category_id);
        fd.append("category", formData.category_id);
      }
      if (formData.seller_id) {
        fd.append("seller_id", formData.seller_id);
        fd.append("sellerId", formData.seller_id);
      }
      if (imageFile) fd.append("image", imageFile);
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
      price: String(item.sellingPrice ?? item.price ?? ""),
      category_id: item.category_id?._id || item.category || "",
      seller_id: item.seller_id?._id || item.sellerId?._id || (typeof item.sellerId === "string" ? item.sellerId : "") || "",
      is_available: item.isAvailable ?? item.is_available ?? true,
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
      <AdminLayout title="Food Items Management" subtitle="Manage all food items across categories and sellers">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Food Items Management" subtitle="Manage all food items across categories and sellers">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Menu & Dishes Catalog</h2>
            <p className="text-sm text-muted-foreground">View, add, edit, or remove food items available on the platform</p>
          </div>
          <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Food Item
          </Button>
        </div>

        <Card className="border border-border/60 shadow-sm overflow-hidden bg-card">
          <CardHeader className="border-b border-border/50 bg-muted/20 px-6 py-4">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UtensilsCrossed size={18} className="text-primary" />
                All Food Items ({foodItems.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Seller / Kitchen</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {foodItems.map((item) => {
                  const displayPrice = item.sellingPrice ?? item.price;
                  const displayCategory = item.category_id?.name || item.category || "-";
                  const displaySeller = item.seller_id?.businessName || item.sellerId?.businessName || item.sellerId?.name || "-";
                  const isAvailable = item.isAvailable ?? item.is_available ?? false;

                  return (
                    <TableRow key={item._id} className="hover:bg-muted/40 transition-colors">
                      <TableCell>
                        {item.image ? (
                          <img src={getImageUrl(item.image)} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-border/60 shadow-xs" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium">No img</div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        <div>{item.name}</div>
                        {item.description && <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{item.description}</div>}
                      </TableCell>
                      <TableCell>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          {displayCategory}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-foreground/80 font-medium">
                        {displaySeller}
                      </TableCell>
                      <TableCell className="font-bold text-foreground">
                        {displayPrice != null ? `₹${displayPrice}` : "-"}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isAvailable ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-destructive/10 text-destructive"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isAvailable ? "bg-emerald-600" : "bg-destructive"}`} />
                          {isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEditDialog(item)} title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item._id)} title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {foodItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      No food items found. Click "+ Add Food Item" to add dishes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create / Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">{editingItem ? "Edit Food Item" : "Add Food Item"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {/* Image upload */}
              <div className="space-y-2">
                <Label>Food Item Image</Label>
                {imagePreview ? (
                  <div className="relative w-full h-44 rounded-lg overflow-hidden border border-border/80 group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-background rounded-full text-destructive shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-36 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/60 transition-colors bg-muted/10 hover:bg-muted/20"
                  >
                    <ImagePlus className="w-8 h-8 text-muted-foreground mb-1.5" />
                    <span className="text-sm font-medium text-foreground">Click to upload image</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG, WebP up to 5MB</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label>Food Item Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Dal Makhani, Paneer Tikka"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description of the dish"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label>Selling Price (₹) *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., 149"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background text-foreground border-input"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Seller */}
              <div className="space-y-2">
                <Label>Seller / Restaurant</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background text-foreground border-input"
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
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_available"
                  className="rounded border-input text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                />
                <Label htmlFor="is_available" className="cursor-pointer text-sm font-medium">Available for ordering</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingItem ? "Update Food Item" : "Create Food Item"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
