import { useState } from 'react';
import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { VegBadge } from '@/components/shared/Badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, RotateCcw, Search, Trash, Package } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { safeArray } from '@/utils/safeArray';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';

export default function SellerRecycleBin() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['recycle-bin'],
    queryFn: () => productAPI.getRecycleBin(),
  });

  const products = safeArray(data?.products || data?.data || data);
  const filtered = products.filter((p: any) =>
    !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['recycle-bin'] });
    queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    queryClient.invalidateQueries({ queryKey: ['seller-metrics'] });
  };

  const restoreMutation = useMutation({
    mutationFn: (id: string) => productAPI.restoreProduct(id),
    onSuccess: () => { toast({ title: 'Product Restored ✅' }); setSelectedIds([]); invalidate(); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: string) => productAPI.hardDeleteProduct(id),
    onSuccess: () => { toast({ title: 'Permanently Deleted 🗑️' }); setSelectedIds([]); invalidate(); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const emptyBinMutation = useMutation({
    mutationFn: () => productAPI.emptyRecycleBin(),
    onSuccess: (d: any) => { toast({ title: d?.message || 'Recycle bin emptied' }); setSelectedIds([]); invalidate(); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const bulkRestore = () => {
    selectedIds.forEach(id => restoreMutation.mutate(id));
  };

  const bulkDelete = () => {
    selectedIds.forEach(id => hardDeleteMutation.mutate(id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map((p: any) => p._id));
  };

  return (
    <SellerLayout title="Recycle Bin" subtitle="Restore or permanently delete archived products">
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search deleted items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={products.length === 0 || emptyBinMutation.isPending}>
                  <Trash size={16} className="mr-1" />
                  {emptyBinMutation.isPending ? 'Emptying...' : 'Empty Recycle Bin'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Empty Recycle Bin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will <strong>permanently delete all {products.length} items</strong> in the recycle bin. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => emptyBinMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Info banner */}
        <Card className="border-muted bg-muted/30">
          <CardContent className="py-3 flex items-center gap-3 text-sm text-muted-foreground">
            <Trash2 size={18} />
            <span>Items in the recycle bin can be restored or permanently deleted. Permanently deleted items cannot be recovered.</span>
            <span className="ml-auto font-medium text-foreground">{products.length} item{products.length !== 1 ? 's' : ''}</span>
          </CardContent>
        </Card>

        {/* Bulk action bar */}
        {selectedIds.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-3 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium mr-2">{selectedIds.length} selected</span>
              <Button size="sm" variant="outline" onClick={bulkRestore} disabled={restoreMutation.isPending}>
                <RotateCcw size={14} className="mr-1" /> Restore Selected
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 size={14} className="mr-1" /> Delete Selected
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Permanently Delete {selectedIds.length} Items?</AlertDialogTitle>
                    <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={bulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}

        {/* Select all */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Checkbox checked={selectedIds.length === filtered.length && filtered.length > 0} onCheckedChange={selectAll} />
            <span className="text-muted-foreground">Select all ({filtered.length})</span>
          </div>
        )}

        {/* Product grid */}
        {isLoading ? <LoadingSpinner /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item: any) => (
              <Card key={item._id} className="overflow-hidden border-destructive/20 group">
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox checked={selectedIds.includes(item._id)} onCheckedChange={() => toggleSelect(item._id)} />
                </div>
                <div className="relative aspect-[4/3]">
                  <img
                    src={item.image || '/placeholder.svg'}
                    alt={item.name}
                    className="w-full h-full object-cover grayscale opacity-70"
                  />
                  <div className="absolute top-2 right-2"><VegBadge isVeg={item.isVeg} /></div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium bg-destructive/80 text-white">
                    Deleted
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1">{item.name}</h3>
                    <span className="font-bold text-sm text-foreground shrink-0">₹{item.sellingPrice}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{item.description}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <span>{item.category}</span>
                    {item.deletedAt && (
                      <>
                        <span>·</span>
                        <span>Deleted {formatDistanceToNow(new Date(item.deletedAt), { addSuffix: true })}</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => restoreMutation.mutate(item._id)}
                      disabled={restoreMutation.isPending}
                    >
                      <RotateCcw size={14} className="mr-1" /> Restore
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" className="flex-1">
                          <Trash2 size={14} className="mr-1" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Permanently Delete "{item.name}"?</AlertDialogTitle>
                          <AlertDialogDescription>This cannot be undone. The product and all its data will be lost forever.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => hardDeleteMutation.mutate(item._id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Package size={56} className="mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Recycle Bin is Empty</h3>
            <p className="text-muted-foreground text-sm">Deleted products will appear here for recovery</p>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
