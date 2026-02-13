import { useState } from 'react';
import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Package, AlertTriangle, Clock, Save } from 'lucide-react';

export default function SellerInventory() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState(0);

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['seller-inventory'],
    queryFn: () => sellerAPI.getInventory(),
  });

  const { data: lowStock = [] } = useQuery({
    queryKey: ['seller-low-stock'],
    queryFn: () => sellerAPI.getLowStockAlerts(),
  });

  const { data: expiryAlerts = [] } = useQuery({
    queryKey: ['seller-expiry-alerts'],
    queryFn: () => sellerAPI.getExpiryAlerts(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { productId: string; stock: number }) => sellerAPI.updateStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-inventory'] });
      toast({ title: 'Stock updated' });
      setEditingId(null);
    },
  });

  return (
    <SellerLayout title="Inventory" subtitle="Manage stock levels and expiry dates">
      {/* Alerts */}
      {(lowStock.length > 0 || expiryAlerts.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {lowStock.length > 0 && (
            <div className="bg-destructive/10 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle size={24} className="text-destructive" />
              <div>
                <p className="font-medium text-foreground">Low Stock Alert</p>
                <p className="text-sm text-muted-foreground">{lowStock.length} items are running low</p>
              </div>
            </div>
          )}
          {expiryAlerts.length > 0 && (
            <div className="bg-warning/10 rounded-xl p-4 flex items-center gap-3">
              <Clock size={24} className="text-warning" />
              <div>
                <p className="font-medium text-foreground">Expiry Alert</p>
                <p className="text-sm text-muted-foreground">{expiryAlerts.length} items expiring soon</p>
              </div>
            </div>
          )}
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
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Expiry Date</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item: any) => {
                    const isLow = item.stock <= (item.alertThreshold || 5);
                    return (
                      <tr key={item._id} className="border-b border-border/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />}
                            <span className="font-medium text-foreground">{item.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {editingId === item._id ? (
                            <Input type="number" value={editStock} onChange={(e) => setEditStock(Number(e.target.value))} className="w-20" />
                          ) : (
                            <span className={`font-medium ${isLow ? 'text-destructive' : 'text-foreground'}`}>{item.stock}</span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isLow ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                            {isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="p-4">
                          {editingId === item._id ? (
                            <Button size="sm" variant="gradient" className="gap-1" onClick={() => updateMutation.mutate({ productId: item._id, stock: editStock })}>
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
