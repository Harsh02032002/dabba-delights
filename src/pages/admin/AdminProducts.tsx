import { useState, useRef } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { VegBadge } from '@/components/shared/Badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, Search, Edit, Trash2, ImagePlus, Copy, Archive, RotateCcw,
  BarChart3, Sparkles, Eye, Upload, Package, ToggleLeft, X, FileUp, Layers,
  Link as LinkIcon,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI, adminAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { safeArray } from '@/utils/safeArray';

const categories = ['Main Course', 'Starters', 'Rice', 'Breads', 'Desserts', 'Beverages', 'Snacks', 'Thali'];

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sellerFilter, setSellerFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editImageRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [selectedSellerId, setSelectedSellerId] = useState('');

  // Fetch sellers list for the dropdown
  const { data: sellersData } = useQuery({
    queryKey: ['admin-sellers-list'],
    queryFn: () => adminAPI.getSellers(),
  });
  const sellersList = Array.isArray(sellersData?.sellers) ? sellersData.sellers : Array.isArray(sellersData) ? sellersData : [];

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', searchQuery, selectedCategory, sellerFilter, currentPage],
    queryFn: () => productAPI.getProducts({
      search: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      sellerId: sellerFilter || undefined,
      page: currentPage,
      limit: 20,
    }),
  });

  const { data: archivedData } = useQuery({
    queryKey: ['admin-products-archived'],
    queryFn: () => productAPI.getProducts({ isArchived: true }),
  });

  const { data: metricsData } = useQuery({
    queryKey: ['admin-product-metrics'],
    queryFn: () => productAPI.getInvestorMetrics(),
  });

  const products = safeArray(productsData?.products || productsData?.data || productsData);
  const totalProducts = productsData?.total || products.length;
  const archivedProducts = safeArray(archivedData?.products || archivedData?.data || archivedData);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    queryClient.invalidateQueries({ queryKey: ['admin-products-archived'] });
    queryClient.invalidateQueries({ queryKey: ['admin-product-metrics'] });
  };

  const createMutation = useMutation({
    mutationFn: (fd: FormData) => productAPI.createProduct(fd),
    onSuccess: () => { toast({ title: 'Product Created' }); setIsAddOpen(false); invalidate(); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }: { id: string; fd: FormData }) => productAPI.updateProduct(id, fd),
    onSuccess: () => { toast({ title: 'Product Updated' }); setEditItem(null); invalidate(); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productAPI.hardDeleteProduct(id),
    onSuccess: () => { toast({ title: 'Deleted' }); invalidate(); },
  });

  const toggleAvailMutation = useMutation({
    mutationFn: (id: string) => productAPI.toggleAvailability(id),
    onSuccess: () => { invalidate(); },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => productAPI.duplicateProduct(id),
    onSuccess: () => { toast({ title: 'Duplicated' }); invalidate(); },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => productAPI.archiveProduct(id),
    onSuccess: () => { toast({ title: 'Archived' }); invalidate(); },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => productAPI.restoreProduct(id),
    onSuccess: () => { toast({ title: 'Restored' }); invalidate(); },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: string) => productAPI.hardDeleteProduct(id),
    onSuccess: () => { toast({ title: 'Permanently Deleted' }); invalidate(); },
  });

  const bulkActionMutation = useMutation({
    mutationFn: (data: { ids: string[]; action: string; value?: any }) => productAPI.bulkAction(data),
    onSuccess: () => { toast({ title: 'Bulk action done' }); setSelectedIds([]); invalidate(); },
  });

  const bulkCsvMutation = useMutation({
    mutationFn: (fd: FormData) => productAPI.bulkCSV(fd),
    onSuccess: (d: any) => { toast({ title: `Processed ${d.processed} items` }); invalidate(); },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSellerId) {
      toast({ title: 'Select a seller', description: 'Please select which restaurant/home chef this product belongs to', variant: 'destructive' });
      return;
    }
    const form = e.currentTarget;
    const fd = new FormData();
    fd.append('name', (form.elements.namedItem('name') as HTMLInputElement).value);
    fd.append('description', (form.elements.namedItem('description') as HTMLTextAreaElement).value);
    fd.append('price', (form.elements.namedItem('price') as HTMLInputElement).value);
    fd.append('discountPrice', (form.elements.namedItem('discountPrice') as HTMLInputElement).value || '');
    fd.append('category', (form.elements.namedItem('category') as HTMLInputElement)?.value || 'Main Course');
    fd.append('preparationTime', (form.elements.namedItem('preparationTime') as HTMLInputElement).value);
    fd.append('stock', (form.elements.namedItem('stock') as HTMLInputElement).value || '100');
    fd.append('isVeg', String((form.elements.namedItem('isVeg') as HTMLInputElement)?.checked || false));
    fd.append('sellerId', selectedSellerId);
    const fileInput = imageInputRef.current;
    if (fileInput?.files?.[0]) fd.append('image', fileInput.files[0]);
    createMutation.mutate(fd);
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editItem) return;
    const form = e.currentTarget;
    const fd = new FormData();
    fd.append('name', (form.elements.namedItem('editName') as HTMLInputElement).value);
    fd.append('description', (form.elements.namedItem('editDescription') as HTMLTextAreaElement).value);
    fd.append('price', (form.elements.namedItem('editPrice') as HTMLInputElement).value);
    fd.append('discountPrice', (form.elements.namedItem('editDiscountPrice') as HTMLInputElement).value || '');
    fd.append('category', (form.elements.namedItem('editCategory') as HTMLInputElement)?.value || editItem.category);
    fd.append('preparationTime', (form.elements.namedItem('editPrepTime') as HTMLInputElement).value);
    fd.append('stock', (form.elements.namedItem('editStock') as HTMLInputElement).value || '0');
    fd.append('isVeg', String((form.elements.namedItem('editIsVeg') as HTMLInputElement)?.checked || false));
    const fileInput = editImageRef.current;
    if (fileInput?.files?.[0]) fd.append('image', fileInput.files[0]);
    updateMutation.mutate({ id: editItem._id, fd });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <AdminLayout title="Product Management" subtitle="Admin: manage all products across sellers">
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="products">All Products</TabsTrigger>
          <TabsTrigger value="add">Add Product</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="bulk">Bulk CSV</TabsTrigger>
        </TabsList>

        {/* ═══ PRODUCTS LIST ═══ */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Input placeholder="Filter by seller ID..." value={sellerFilter} onChange={e => setSellerFilter(e.target.value)} className="w-[200px]" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {selectedIds.length > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-3 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium mr-2">{selectedIds.length} selected</span>
                <Button size="sm" variant="outline" onClick={() => bulkActionMutation.mutate({ ids: selectedIds, action: 'archive' })}>Archive</Button>
                <Button size="sm" variant="outline" onClick={() => bulkActionMutation.mutate({ ids: selectedIds, action: 'publish' })}>Publish</Button>
                <Button size="sm" variant="destructive" onClick={() => { selectedIds.forEach(id => deleteMutation.mutate(id)); setSelectedIds([]); }}>Delete</Button>
              </CardContent>
            </Card>
          )}

          {isLoading ? <LoadingSpinner /> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((item: any) => (
                <Card key={item._id} className="overflow-hidden relative">
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox checked={selectedIds.includes(item._id)} onCheckedChange={() => toggleSelect(item._id)} />
                  </div>
                  <div className="relative aspect-[4/3]">
                    <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2"><VegBadge isVeg={item.isVeg} /></div>
                    <div className={`absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium ${item.isAvailable ? 'bg-green-500/90 text-white' : 'bg-destructive/90 text-white'}`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-sm">₹{item.discountPrice || item.price}</span>
                        {item.discountPrice && <span className="text-xs text-muted-foreground line-through ml-1">₹{item.price}</span>}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{item.description}</p>
                    <p className="text-xs text-muted-foreground mb-2">{item.category} · Stock: {item.stock ?? '?'} · Seller: {typeof item.sellerId === 'object' ? (item.sellerId?.businessName || item.sellerId?._id?.slice?.(-6)) : (item.sellerId?.slice?.(-6) || '?')}</p>
                    <div className="flex flex-wrap gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditItem(item)}><Edit size={14} /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => toggleAvailMutation.mutate(item._id)}><ToggleLeft size={14} /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => duplicateMutation.mutate(item._id)}><Copy size={14} /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => archiveMutation.mutate(item._id)}><Archive size={14} /></Button>
                      <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => deleteMutation.mutate(item._id)}><Trash2 size={14} /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!isLoading && products.length === 0 && <p className="text-center py-12 text-muted-foreground">No products found</p>}

          {totalProducts > 20 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground self-center">Page {currentPage}</span>
              <Button variant="outline" size="sm" disabled={currentPage >= Math.ceil(totalProducts / 20)} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </TabsContent>

        {/* ═══ ADD PRODUCT (ADMIN – includes discountPrice) ═══ */}
        <TabsContent value="add">
          <Card>
            <CardHeader><CardTitle>Add Product (Admin)</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                {/* Seller Selection */}
                <div className="space-y-2">
                  <Label>Select Restaurant / Home Chef *</Label>
                  <select
                    value={selectedSellerId}
                    onChange={(e) => setSelectedSellerId(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    required
                  >
                    <option value="">-- Select a seller --</option>
                    {sellersList.filter((s: any) => s.isActive || s.kycStatus === 'verified').map((s: any) => (
                      <option key={s._id} value={s._id}>
                        {s.businessName} ({s.type === 'home_chef' ? 'Home Chef' : s.type === 'restaurant' ? 'Restaurant' : s.type === 'cloud_kitchen' ? 'Cloud Kitchen' : s.type === 'catering' ? 'Catering' : s.type}) — {s.address?.city || 'N/A'}
                      </option>
                    ))}
                  </select>
                  {sellersList.length === 0 && <p className="text-xs text-warning">No verified sellers found. Approve sellers first.</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Name *</Label><Input name="name" required /></div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select name="category" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Description</Label><Textarea name="description" rows={3} /></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2"><Label>Price (₹) *</Label><Input name="price" type="number" required /></div>
                  <div className="space-y-2"><Label>Discount Price (₹)</Label><Input name="discountPrice" type="number" placeholder="Optional" /></div>
                  <div className="space-y-2"><Label>Prep Time *</Label><Input name="preparationTime" type="number" required /></div>
                  <div className="space-y-2"><Label>Stock</Label><Input name="stock" type="number" defaultValue="100" /></div>
                </div>
                <div className="space-y-2">
                  <Label>Image</Label>
                  <input type="file" ref={imageInputRef} accept="image/*" className="hidden" />
                  <div onClick={() => imageInputRef.current?.click()} className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors">
                    <ImagePlus size={28} className="mx-auto text-muted-foreground mb-1" />
                    <p className="text-sm text-muted-foreground">Click to upload</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch name="isVeg" id="adminIsVeg" /><Label htmlFor="adminIsVeg">Vegetarian</Label>
                </div>
                <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating...' : 'Create Product'}</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ ARCHIVED ═══ */}
        <TabsContent value="archived">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedProducts.map((item: any) => (
              <Card key={item._id} className="opacity-75">
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-sm mb-2">{item.name} — ₹{item.price}</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => restoreMutation.mutate(item._id)}><RotateCcw size={14} className="mr-1" /> Restore</Button>
                    <Button size="sm" variant="destructive" onClick={() => hardDeleteMutation.mutate(item._id)}><Trash2 size={14} className="mr-1" /> Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {archivedProducts.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">No archived products</p>}
          </div>
        </TabsContent>

        {/* ═══ METRICS ═══ */}
        <TabsContent value="metrics">
          {metricsData ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Total Products', value: metricsData.totalProducts },
                { label: 'Active', value: metricsData.activeProducts },
                { label: 'Archived', value: metricsData.archivedProducts },
                { label: 'Total Stock', value: metricsData.totalStock },
                { label: 'Avg Price', value: `₹${metricsData.averagePrice ?? 0}` },
                { label: 'Efficiency', value: metricsData.efficiency },
              ].map(m => (
                <Card key={m.label}><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{m.value}</p><p className="text-sm text-muted-foreground">{m.label}</p></CardContent></Card>
              ))}
            </div>
          ) : <LoadingSpinner />}
        </TabsContent>

        {/* ═══ BULK CSV ═══ */}
        <TabsContent value="bulk">
          <Card>
            <CardHeader><CardTitle>Bulk CSV Upload</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Upload CSV with: name, price, discountPrice, category, description, isVeg, stock, preparationTime</p>
              <input type="file" ref={csvInputRef} accept=".csv" className="hidden" onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append('file', file);
                bulkCsvMutation.mutate(fd);
              }} />
              <Button variant="outline" onClick={() => csvInputRef.current?.click()} disabled={bulkCsvMutation.isPending}>
                <Upload size={16} className="mr-2" /> {bulkCsvMutation.isPending ? 'Processing...' : 'Upload CSV'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ═══ EDIT DIALOG (with discountPrice) ═══ */}
      <Dialog open={!!editItem} onOpenChange={open => !open && setEditItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Product (Admin)</DialogTitle></DialogHeader>
          {editItem && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Name</Label><Input name="editName" defaultValue={editItem.name} required /></div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select name="editCategory" defaultValue={editItem.category} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea name="editDescription" defaultValue={editItem.description} rows={3} /></div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2"><Label>Price (₹)</Label><Input name="editPrice" type="number" defaultValue={editItem.price} required /></div>
                <div className="space-y-2"><Label>Discount Price</Label><Input name="editDiscountPrice" type="number" defaultValue={editItem.discountPrice || ''} placeholder="Optional" /></div>
                <div className="space-y-2"><Label>Prep Time</Label><Input name="editPrepTime" type="number" defaultValue={editItem.preparationTime} /></div>
                <div className="space-y-2"><Label>Stock</Label><Input name="editStock" type="number" defaultValue={editItem.stock} /></div>
              </div>
              <div className="space-y-2">
                <Label>Replace Image</Label>
                <input type="file" ref={editImageRef} accept="image/*" className="hidden" />
                <Button type="button" variant="outline" size="sm" onClick={() => editImageRef.current?.click()}>
                  <ImagePlus size={14} className="mr-1" /> Choose Image
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Switch name="editIsVeg" id="editAdminIsVeg" defaultChecked={editItem.isVeg} /><Label htmlFor="editAdminIsVeg">Vegetarian</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Saving...' : 'Save'}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
