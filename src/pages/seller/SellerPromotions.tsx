import { useState } from 'react';
import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Plus, Tag, Percent, Calendar } from 'lucide-react';

export default function SellerPromotions() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: promotionsRaw, isLoading } = useQuery({
    queryKey: ['seller-promotions'],
    queryFn: () => sellerAPI.getPromotions(),
  });
  const promotions = Array.isArray(promotionsRaw) ? promotionsRaw : Array.isArray((promotionsRaw as any)?.promotions) ? (promotionsRaw as any).promotions : [];

  const createMutation = useMutation({
    mutationFn: (data: any) => sellerAPI.createPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-promotions'] });
      toast({ title: 'Promotion created!' });
      setIsCreateOpen(false);
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => sellerAPI.togglePromotion(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-promotions'] });
      toast({ title: 'Promotion updated' });
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      code: fd.get('code'),
      type: fd.get('type'),
      value: Number(fd.get('value')),
      minAmount: Number(fd.get('minAmount')) || 0,
      startDate: fd.get('startDate'),
      endDate: fd.get('endDate'),
    });
  };

  return (
    <SellerLayout title="Promotions" subtitle="Manage discount codes and offers">
      <div className="flex justify-end mb-6">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="gap-2"><Plus size={18} /> Create Promotion</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">New Promotion</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Promo Code</Label><Input name="code" placeholder="e.g., SAVE20" required /></div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select name="type" className="w-full px-3 py-2 rounded-lg border border-border bg-background">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="bogo">Buy One Get One</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Value</Label><Input name="value" type="number" placeholder="20" required /></div>
                <div className="space-y-2"><Label>Min Order (₹)</Label><Input name="minAmount" type="number" placeholder="200" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start Date</Label><Input name="startDate" type="date" required /></div>
                <div className="space-y-2"><Label>End Date</Label><Input name="endDate" type="date" required /></div>
              </div>
              <Button type="submit" variant="gradient" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Promotion'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo: any) => (
            <Card key={promo._id} className="overflow-hidden">
              <div className={`p-4 ${promo.isActive ? 'gradient-primary' : 'bg-muted'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary-foreground">
                    <Tag size={20} />
                    <span className="font-bold text-lg">{promo.code}</span>
                  </div>
                  <Switch checked={promo.isActive} onCheckedChange={(v) => toggleMutation.mutate({ id: promo._id, isActive: v })} />
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Percent size={16} className="text-primary" />
                  <span className="font-medium text-foreground">
                    {promo.type === 'percentage' ? `${promo.value}% off` : promo.type === 'bogo' ? 'Buy 1 Get 1' : `₹${promo.value} off`}
                  </span>
                </div>
                {promo.minAmount > 0 && <p className="text-sm text-muted-foreground mb-2">Min order: ₹{promo.minAmount}</p>}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar size={12} />
                  <span>{new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Used: {promo.usageCount || 0} times</p>
              </CardContent>
            </Card>
          ))}
          {promotions.length === 0 && (
            <div className="col-span-full text-center py-12"><p className="text-muted-foreground">No promotions yet</p></div>
          )}
        </div>
      )}
    </SellerLayout>
  );
}
