import { useState } from 'react';
import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, Clock, Save } from 'lucide-react';

export default function SellerInventory() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState(0);

  // Use productAPI for inventory — matches backend product routes
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['seller-inventory'],
    queryFn: () => productAPI.getProducts({ limit: 100 }),
  });

  const { data: lowStockData } = useQuery({
    queryKey: ['seller-low-stock'],
    queryFn: () => productAPI.getLowStockProducts(),
  });

  const inventory = inventoryData?.products || [];
  const lowStock = lowStockData?.products || [];

  const updateMutation = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) => productAPI.updateStock(id, stock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['seller-low-stock'] });
      toast({ title: 'Stock updated' });
      setEditingId(null);
    },
  });

  return (
    <SellerLayout title="Inventory" subtitle="Manage stock levels">
      {lowStock.length > 0 && (
        <div className="mb-6">
          <div className="bg-destructive/10 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle size={24} className="text-destructive" />
            <div>
              <p className="font-medium text-foreground">Low Stock Alert</p>
              <p className="text-sm text-muted-foreground">{lowStock.length} items are running low</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? <LoadingSpinner /> : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stock</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item: any) => {
                    const isLow = item.stock <= (item.lowStockThreshold || 5);
                    return (
                      <tr key={item._id} className="border-b border-border/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />}
                            <div>
                              <span className="font-medium text-foreground">{item.name}</span>
                              <p className="text-xs text-muted-foreground">₹{item.sellingPrice} · {item.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {editingId === item._id ? (
                            <Input type="number" value={editStock} onChange={(e) => setEditStock(Number(e.target.value))} className="w-20" />
                          ) : (
                            <span className={`font-medium ${isLow ? 'text-destructive' : 'text-foreground'}`}>{item.stock}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isLow ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                            {isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="p-4">
                          {editingId === item._id ? (
                            <Button size="sm" className="gap-1" onClick={() => updateMutation.mutate({ id: item._id, stock: editStock })}>
                              <Save size={14} /> Save
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => { setEditingId(item._id); setEditStock(item.stock); }}>
                              Edit Stock
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {inventory.length === 0 && <p className="text-muted-foreground text-center py-12">No inventory items</p>}
          </CardContent>
        </Card>
      )}
    </SellerLayout>
  );
}
