import { useState } from 'react';
import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { VegBadge } from '@/components/shared/Badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, ImagePlus, MoreVertical } from 'lucide-react';
import { mockMenuItems } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

const categories = ['Main Course', 'Starters', 'Rice', 'Breads', 'Desserts', 'Beverages'];

export default function SellerMenu() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const menuItems = mockMenuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.sellerId === '1';
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Item Added', description: 'Menu item has been added successfully' });
    setIsAddDialogOpen(false);
  };

  return (
    <SellerLayout title="Menu Management" subtitle="Add, edit, and manage your menu items">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="gap-2">
              <Plus size={18} />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Menu Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddItem} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Item Name</Label>
                  <Input placeholder="e.g., Butter Chicken" required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe your dish..." rows={3} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input type="number" placeholder="250" required />
                </div>
                <div className="space-y-2">
                  <Label>Discount Price (₹)</Label>
                  <Input type="number" placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>Prep Time (mins)</Label>
                  <Input type="number" placeholder="25" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Item Image</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors">
                  <ImagePlus size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch id="isVeg" />
                  <Label htmlFor="isVeg">Vegetarian</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="isAvailable" defaultChecked />
                  <Label htmlFor="isAvailable">Available</Label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" className="flex-1">
                  Add Item
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Menu Items Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {menuItems.map((item) => (
          <Card key={item._id} className="overflow-hidden group">
            <div className="relative aspect-[4/3]">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <VegBadge isVeg={item.isVeg} />
              </div>
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium ${
                item.isAvailable ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
              }`}>
                {item.isAvailable ? 'Available' : 'Unavailable'}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm">
                    <Edit size={14} />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="text-destructive">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-foreground">₹{item.discountPrice || item.price}</span>
                  {item.discountPrice && (
                    <span className="text-sm text-muted-foreground line-through">₹{item.price}</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{item.preparationTime} mins</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {menuItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No menu items found</p>
        </div>
      )}
    </SellerLayout>
  );
}
