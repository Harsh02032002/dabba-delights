import { useState, useRef } from 'react';
import { SellerLayout } from '@/layouts/SellerLayout';
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, Search, Edit, Trash2, ImagePlus, Copy, Archive, RotateCcw,
  BarChart3, Sparkles, Eye, Upload, Download, ToggleLeft, Package,
  Link as LinkIcon, Zap, Check, X, FileUp, Layers,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI, sellerAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { safeArray } from '@/utils/safeArray';

const categories = ['Main Course', 'Starters', 'Rice', 'Breads', 'Desserts', 'Beverages', 'Snacks', 'Thali'];

export default function SellerMenu() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkJsonText, setBulkJsonText] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [previewLink, setPreviewLink] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const editImageRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [editSelectedImage, setEditSelectedImage] = useState<File | null>(null);

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f && f.type.startsWith('image/')) setSelectedImage(f);
  };

  const handleImagePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.type.startsWith('image/')) {
        const file = it.getAsFile();
        if (file) setSelectedImage(file);
      }
    }
  };

  // ─── Queries ──────────────────────────────────────────────────
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['seller-products', searchQuery, selectedCategory, currentPage],
    // Inventory API already scoped to logged-in seller
    queryFn: () => sellerAPI.getInventory(),
  });

  const { data: archivedData, isLoading: archiveLoading } = useQuery({
    queryKey: ['seller-products-archived'],
    queryFn: () => productAPI.getProducts({ isArchived: true }),
  });

  const { data: metricsData } = useQuery({
    queryKey: ['seller-metrics'],
    queryFn: () => productAPI.getInvestorMetrics(),
  });

  const { data: lowStockData } = useQuery({
    queryKey: ['seller-low-stock'],
    queryFn: () => productAPI.getLowStockProducts(),
  });

  const { data: healthData } = useQuery({
    queryKey: ['seller-menu-health'],
    queryFn: () => productAPI.menuHealthScore(),
  });

  const allProducts = safeArray(productsData?.products || productsData?.data || productsData);
  const products = allProducts.filter((item: any) => {
    const matchesSearch = !searchQuery ||
      String(item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const totalProducts = products.length;
  const archivedProducts = safeArray(archivedData?.products || archivedData?.data || archivedData);
  const lowStockProducts = safeArray(lowStockData?.products || lowStockData?.data || lowStockData);

  // ─── Mutations ────────────────────────────────────────────────
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    queryClient.invalidateQueries({ queryKey: ['seller-products-archived'] });
    queryClient.invalidateQueries({ queryKey: ['seller-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['seller-low-stock'] });
    queryClient.invalidateQueries({ queryKey: ['seller-menu-health'] });
  };

  const createMutation = useMutation({
    mutationFn: (fd: FormData) => productAPI.createProduct(fd),
    onSuccess: () => { toast({ title: 'Item Added' }); setIsAddOpen(false); invalidate(); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }: { id: string; fd: FormData }) => productAPI.updateProduct(id, fd),
    onSuccess: () => { toast({ title: 'Item Updated' }); setEditItem(null); invalidate(); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productAPI.hardDeleteProduct(id),
    onSuccess: () => { toast({ title: 'Item Deleted' }); invalidate(); },
  });

  const toggleAvailMutation = useMutation({
    mutationFn: (id: string) => productAPI.toggleAvailability(id),
    onSuccess: () => { toast({ title: 'Availability toggled' }); invalidate(); },
  });

  const toggleVegMutation = useMutation({
    mutationFn: (id: string) => productAPI.toggleVeg(id),
    onSuccess: () => { toast({ title: 'Veg status toggled' }); invalidate(); },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => productAPI.duplicateProduct(id),
    onSuccess: () => { toast({ title: 'Item Duplicated' }); invalidate(); },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => productAPI.archiveProduct(id),
    onSuccess: () => { toast({ title: 'Item Archived' }); invalidate(); },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => productAPI.restoreProduct(id),
    onSuccess: () => { toast({ title: 'Item Restored' }); invalidate(); },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: string) => productAPI.hardDeleteProduct(id),
    onSuccess: () => { toast({ title: 'Permanently Deleted' }); invalidate(); },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: (items: any[]) => productAPI.bulkCreate(items),
    onSuccess: (d: any) => { toast({ title: `${d.count || 'Items'} created` }); setBulkJsonText(''); invalidate(); },
    onError: (e: Error) => toast({ title: 'Bulk Error', description: e.message, variant: 'destructive' }),
  });

  const bulkCsvMutation = useMutation({
    mutationFn: (fd: FormData) => productAPI.bulkCSV(fd),
    onSuccess: (d: any) => { toast({ title: `Processed ${d.processed} items` }); invalidate(); },
    onError: (e: Error) => toast({ title: 'CSV Error', description: e.message, variant: 'destructive' }),
  });

  const bulkActionMutation = useMutation({
    mutationFn: (data: { ids: string[]; action: string; value?: any }) => productAPI.bulkAction(data),
    onSuccess: () => { toast({ title: 'Bulk action applied' }); setSelectedIds([]); invalidate(); },
  });

  const syncInventoryMutation = useMutation({
    mutationFn: (items: { id: string; stock: number }[]) => productAPI.syncInventory(items),
    onSuccess: () => { toast({ title: 'Inventory synced' }); invalidate(); },
  });

  const replaceImageMutation = useMutation({
    mutationFn: ({ id, fd }: { id: string; fd: FormData }) => productAPI.replaceImage(id, fd),
    onSuccess: () => { toast({ title: 'Image replaced' }); invalidate(); },
  });

  const aiOptimizeMutation = useMutation({
    mutationFn: () => productAPI.suggestOptimisation(),
    onSuccess: (d: any) => { setAiSuggestions(d.suggestions || []); setIsAiOpen(true); },
    onError: (e: Error) => toast({ title: 'AI Error', description: e.message, variant: 'destructive' }),
  });

  const previewMutation = useMutation({
    mutationFn: () => productAPI.generatePreviewLink(),
    onSuccess: (d: any) => { setPreviewLink(d.link || ''); setIsPreviewOpen(true); },
  });

  // ─── Handlers ─────────────────────────────────────────────────
  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData();
    fd.append('name', (form.elements.namedItem('name') as HTMLInputElement).value);
    fd.append('description', (form.elements.namedItem('description') as HTMLTextAreaElement).value);
    fd.append('sellingPrice', (form.elements.namedItem('sellingPrice') as HTMLInputElement).value);
    fd.append('costPrice', (form.elements.namedItem('costPrice') as HTMLInputElement).value || '0');
    fd.append('category', (form.elements.namedItem('category') as HTMLInputElement)?.value || 'Main Course');
    fd.append('preparationTime', (form.elements.namedItem('preparationTime') as HTMLInputElement).value);
    fd.append('stock', (form.elements.namedItem('stock') as HTMLInputElement).value || '100');
    fd.append('isVeg', String((form.elements.namedItem('isVeg') as HTMLInputElement)?.checked || false));
    // prefer selectedImage (drag/drop or paste) else file input
    if (selectedImage) fd.append('image', selectedImage);
    else {
      const fileInput = imageInputRef.current;
      if (fileInput?.files?.[0]) fd.append('image', fileInput.files[0]);
    }
    createMutation.mutate(fd);
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editItem) return;
    const form = e.currentTarget;
    const fd = new FormData();
    fd.append('name', (form.elements.namedItem('editName') as HTMLInputElement).value);
    fd.append('description', (form.elements.namedItem('editDescription') as HTMLTextAreaElement).value);
    fd.append('sellingPrice', (form.elements.namedItem('editSellingPrice') as HTMLInputElement).value);
    fd.append('costPrice', (form.elements.namedItem('editCostPrice') as HTMLInputElement).value || '0');
    fd.append('category', (form.elements.namedItem('editCategory') as HTMLInputElement)?.value || editItem.category);
    fd.append('preparationTime', (form.elements.namedItem('editPrepTime') as HTMLInputElement).value);
    fd.append('stock', (form.elements.namedItem('editStock') as HTMLInputElement).value || '0');
    fd.append('isVeg', String((form.elements.namedItem('editIsVeg') as HTMLInputElement)?.checked || false));
    // prefer editSelectedImage else file input
    if (editSelectedImage) fd.append('image', editSelectedImage);
    else {
      const fileInput = editImageRef.current;
      if (fileInput?.files?.[0]) fd.append('image', fileInput.files[0]);
    }
    updateMutation.mutate({ id: editItem._id, fd });
  };

  const handleBulkJson = () => {
    try {
      const items = JSON.parse(bulkJsonText);
      if (!Array.isArray(items)) throw new Error('Must be array');
      bulkCreateMutation.mutate(items);
    } catch (e: any) {
      toast({ title: 'Invalid JSON', description: e.message, variant: 'destructive' });
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    bulkCsvMutation.mutate(fd);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === products.length) setSelectedIds([]);
    else setSelectedIds(products.map((p: any) => p._id));
  };

  return (
    <SellerLayout title="Menu Management" subtitle="Manage your products A-Z">
      <Tabs defaultValue="menu" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="menu">Menu Items</TabsTrigger>
          <TabsTrigger value="add">Add Item</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="lowstock">Low Stock</TabsTrigger>
        </TabsList>

        {/* ═══ MENU LIST TAB ═══ */}
        <TabsContent value="menu" className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => aiOptimizeMutation.mutate()} disabled={aiOptimizeMutation.isPending}>
              <Sparkles size={16} className="mr-1" /> AI Optimize
            </Button>
            <Button variant="outline" size="sm" onClick={() => previewMutation.mutate()}>
              <Eye size={16} className="mr-1" /> Preview Link
            </Button>
          </div>

          {/* Health Score */}
          {healthData && (
            <Card className="border-primary/20">
              <CardContent className="py-3 flex items-center gap-4">
                <Zap size={20} className="text-primary" />
                <span className="text-sm font-medium">Menu Health Score: <span className="text-primary font-bold">{healthData.score}/100</span></span>
                <span className="text-xs text-muted-foreground">({healthData.totalProducts} products)</span>
              </CardContent>
            </Card>
          )}

          {/* Bulk action bar */}
          {selectedIds.length > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-3 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium mr-2">{selectedIds.length} selected</span>
                <Button size="sm" variant="outline" onClick={() => bulkActionMutation.mutate({ ids: selectedIds, action: 'archive' })}>
                  <Archive size={14} className="mr-1" /> Archive
                </Button>
                <Button size="sm" variant="outline" onClick={() => bulkActionMutation.mutate({ ids: selectedIds, action: 'toggleAvailability', value: true })}>
                  <ToggleLeft size={14} className="mr-1" /> Enable
                </Button>
                <Button size="sm" variant="outline" onClick={() => bulkActionMutation.mutate({ ids: selectedIds, action: 'toggleAvailability', value: false })}>
                  <X size={14} className="mr-1" /> Disable
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { selectedIds.forEach(id => deleteMutation.mutate(id)); setSelectedIds([]); }}>
                  <Trash2 size={14} className="mr-1" /> Delete
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Select all */}
          {products.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Checkbox checked={selectedIds.length === products.length && products.length > 0} onCheckedChange={selectAll} />
              <span className="text-muted-foreground">Select all ({totalProducts} total)</span>
            </div>
          )}

          {isLoading ? <LoadingSpinner /> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((item: any) => (
                <Card key={item._id} className="overflow-hidden group relative">
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox checked={selectedIds.includes(item._id)} onCheckedChange={() => toggleSelect(item._id)} />
                  </div>
                  <div className="relative aspect-[4/3]">
                    <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2"><VegBadge isVeg={item.isVeg} /></div>
                    <div className={`absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium ${item.isAvailable ? 'bg-green-500/90 text-white' : 'bg-destructive/90 text-white'}`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </div>
                    {item.stock !== undefined && item.stock <= 5 && (
                      <div className="absolute bottom-2 left-8 px-2 py-1 rounded text-xs font-medium bg-yellow-500/90 text-white">
                        Low Stock: {item.stock}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3 className="font-semibold text-sm text-foreground line-clamp-1">{item.name}</h3>
                      <span className="font-bold text-sm text-foreground shrink-0">₹{item.sellingPrice}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{item.description}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <span>{item.category}</span> · <span>{item.preparationTime}m</span>
                      {item.stock !== undefined && <> · <span>Stock: {item.stock}</span></>}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditItem(item)} title="Edit"><Edit size={14} /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => toggleAvailMutation.mutate(item._id)} title="Toggle availability"><ToggleLeft size={14} /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => toggleVegMutation.mutate(item._id)} title="Toggle veg"><Layers size={14} /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => duplicateMutation.mutate(item._id)} title="Duplicate"><Copy size={14} /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => archiveMutation.mutate(item._id)} title="Archive"><Archive size={14} /></Button>
                      <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => deleteMutation.mutate(item._id)} title="Delete"><Trash2 size={14} /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && products.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No menu items found. Add your first item!</p>
            </div>
          )}

          {/* Pagination */}
          {totalProducts > 20 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground self-center">Page {currentPage} of {Math.ceil(totalProducts / 20)}</span>
              <Button variant="outline" size="sm" disabled={currentPage >= Math.ceil(totalProducts / 20)} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </TabsContent>

        {/* ═══ ADD ITEM TAB ═══ */}
        <TabsContent value="add">
          <Card>
            <CardHeader><CardTitle>Add New Menu Item</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Item Name *</Label><Input name="name" placeholder="Butter Chicken" required /></div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select name="category" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Description</Label><Textarea name="description" placeholder="Describe your dish..." rows={3} /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Selling Price (₹) *</Label><Input name="sellingPrice" type="number" min="1" placeholder="250" required /></div>
                  <div className="space-y-2"><Label>Cost Price (₹)</Label><Input name="costPrice" type="number" min="0" placeholder="150" defaultValue="0" /></div>
                  <div className="space-y-2"><Label>Prep Time (mins) *</Label><Input name="preparationTime" type="number" placeholder="25" required /></div>
                  <div className="space-y-2"><Label>Stock</Label><Input name="stock" type="number" placeholder="100" defaultValue="100" /></div>
                </div>
                <div className="space-y-2">
                  <Label>Item Image</Label>
                  <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setSelectedImage(f); }} />
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    onDrop={handleImageDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onPaste={handleImagePaste}
                    className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-colors"
                  >
                    {selectedImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={URL.createObjectURL(selectedImage)} alt="preview" className="max-h-40 object-contain rounded-md" />
                        <div className="text-sm text-muted-foreground">{selectedImage.name}</div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}>Remove</Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <ImagePlus size={32} className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click, drag & drop or paste an image</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch name="isVeg" id="addIsVeg" />
                  <Label htmlFor="addIsVeg">Vegetarian</Label>
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full md:w-auto">
                  {createMutation.isPending ? 'Adding...' : 'Add Item'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ BULK UPLOAD TAB ═══ */}
        <TabsContent value="bulk" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* JSON bulk */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Layers size={18} /> Bulk JSON</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder='[{"name":"Paneer Tikka","sellingPrice":200,"costPrice":120,"category":"Starters","isVeg":true}]'
                  rows={8}
                  value={bulkJsonText}
                  onChange={e => setBulkJsonText(e.target.value)}
                />
                <Button onClick={handleBulkJson} disabled={bulkCreateMutation.isPending || !bulkJsonText}>
                  {bulkCreateMutation.isPending ? 'Uploading...' : 'Import JSON'}
                </Button>
              </CardContent>
            </Card>

            {/* CSV bulk */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileUp size={18} /> Bulk CSV</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Upload a CSV file with columns: name, sellingPrice, costPrice, category, description, isVeg, stock, preparationTime</p>
                <input type="file" ref={csvInputRef} accept=".csv" onChange={handleCsvUpload} className="hidden" />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => csvInputRef.current?.click()} disabled={bulkCsvMutation.isPending}>
                    <Upload size={16} className="mr-2" /> {bulkCsvMutation.isPending ? 'Processing...' : 'Upload CSV'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => {
                    const csv = 'name,sellingPrice,costPrice,category,description,isVeg,stock,preparationTime\nButter Chicken,350,200,Main Course,Rich creamy chicken curry,false,50,30\nPaneer Tikka,250,150,Starters,Grilled cottage cheese,true,40,20\nDal Makhani,200,120,Main Course,Slow cooked black lentils,true,60,25';
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'sample_menu.csv'; a.click();
                    URL.revokeObjectURL(url);
                  }}>
                    <Download size={16} className="mr-1" /> Sample CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sync Inventory */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Package size={18} /> Sync Inventory</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Paste JSON array of stock updates: [&#123;"id":"product_id","stock":50&#125;, ...]</p>
              <Textarea id="syncJson" rows={4} placeholder='[{"id":"abc123","stock":50}]' />
              <Button className="mt-3" onClick={() => {
                try {
                  const el = document.getElementById('syncJson') as HTMLTextAreaElement;
                  const items = JSON.parse(el.value);
                  syncInventoryMutation.mutate(items);
                } catch { toast({ title: 'Invalid JSON', variant: 'destructive' }); }
              }}>
                Sync Stock
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ ARCHIVED TAB ═══ */}
        <TabsContent value="archived">
          {archiveLoading ? <LoadingSpinner /> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedProducts.map((item: any) => (
                <Card key={item._id} className="overflow-hidden opacity-75">
                  <div className="relative aspect-[4/3]">
                    <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover grayscale" />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm mb-2">{item.name} — ₹{item.sellingPrice}</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => restoreMutation.mutate(item._id)}>
                        <RotateCcw size={14} className="mr-1" /> Restore
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => hardDeleteMutation.mutate(item._id)}>
                        <Trash2 size={14} className="mr-1" /> Permanent Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {archivedProducts.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">No archived items</p>}
            </div>
          )}
        </TabsContent>

        {/* ═══ METRICS TAB ═══ */}
        <TabsContent value="metrics">
          {metricsData ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Total Products', value: metricsData.totalProducts },
                { label: 'Active Products', value: metricsData.activeProducts },
                { label: 'Archived', value: metricsData.archivedProducts },
                { label: 'Total Stock', value: metricsData.totalStock },
                { label: 'Avg Price', value: `₹${metricsData.averagePrice ?? 0}` },
                { label: 'Efficiency', value: metricsData.efficiency },
              ].map(m => (
                <Card key={m.label}>
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl font-bold text-foreground">{m.value}</p>
                    <p className="text-sm text-muted-foreground">{m.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : <LoadingSpinner />}
        </TabsContent>

        {/* ═══ LOW STOCK TAB ═══ */}
        <TabsContent value="lowstock">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockProducts.map((item: any) => (
              <Card key={item._id} className="border-yellow-500/30">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <span className="text-xs bg-yellow-500/20 text-yellow-700 px-2 py-1 rounded">Stock: {item.stock}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">₹{item.sellingPrice} · {item.category}</p>
                </CardContent>
              </Card>
            ))}
            {lowStockProducts.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">No low stock items 🎉</p>}
          </div>
        </TabsContent>
      </Tabs>

      {/* ═══ EDIT DIALOG ═══ */}
      <Dialog open={!!editItem} onOpenChange={open => !open && setEditItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Menu Item</DialogTitle></DialogHeader>
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
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Selling Price (₹)</Label><Input name="editSellingPrice" type="number" defaultValue={editItem.sellingPrice} required /></div>
                <div className="space-y-2"><Label>Cost Price (₹)</Label><Input name="editCostPrice" type="number" defaultValue={editItem.costPrice || 0} /></div>
                <div className="space-y-2"><Label>Prep Time</Label><Input name="editPrepTime" type="number" defaultValue={editItem.preparationTime} /></div>
                <div className="space-y-2"><Label>Stock</Label><Input name="editStock" type="number" defaultValue={editItem.stock} /></div>
              </div>
              <div className="space-y-2">
                <Label>Replace Image</Label>
                <input type="file" ref={editImageRef} accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setEditSelectedImage(f); }} />
                <div
                  onDrop={(e) => { e.preventDefault(); const f = (e.dataTransfer?.files?.[0]); if (f && f.type.startsWith('image/')) setEditSelectedImage(f); }}
                  onDragOver={(e) => e.preventDefault()}
                  onPaste={(e) => { const items = e.clipboardData.items; for (let i = 0; i < items.length; i++) { const it = items[i]; if (it.type.startsWith('image/')) { const file = it.getAsFile(); if (file) setEditSelectedImage(file); } } }}
                  className="flex items-center gap-2"
                >
                  <Button type="button" variant="outline" size="sm" onClick={() => editImageRef.current?.click()}>
                    <ImagePlus size={14} className="mr-1" /> Choose Image
                  </Button>
                  {editSelectedImage && (
                    <div className="flex items-center gap-2">
                      <img src={URL.createObjectURL(editSelectedImage)} alt="edit-preview" className="h-12 w-12 object-cover rounded" />
                      <Button type="button" size="sm" variant="ghost" onClick={() => setEditSelectedImage(null)}>Remove</Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch name="editIsVeg" id="editIsVeg" defaultChecked={editItem.isVeg} />
                <Label htmlFor="editIsVeg">Vegetarian</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ AI SUGGESTIONS DIALOG ═══ */}
      <Dialog open={isAiOpen} onOpenChange={setIsAiOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles size={18} /> AI Optimization Suggestions</DialogTitle></DialogHeader>
          {aiSuggestions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No suggestions available. Your menu is performing well!</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {aiSuggestions.map((s: any, i: number) => (
                <Card key={i}>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-sm">{s.name}</h4>
                    <p className="text-sm text-primary mt-1">{s.suggestion}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ PREVIEW LINK DIALOG ═══ */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Menu Preview Link</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={previewLink} readOnly />
            <Button onClick={() => { navigator.clipboard.writeText(previewLink); toast({ title: 'Copied!' }); }}>
              <LinkIcon size={14} className="mr-1" /> Copy Link
            </Button>
            <p className="text-xs text-muted-foreground">This link expires in 24 hours</p>
          </div>
        </DialogContent>
      </Dialog>
    </SellerLayout>
  );
}
