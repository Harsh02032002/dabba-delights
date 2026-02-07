import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { Percent, Save, Store } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminCommission() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<any>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin-commission'],
    queryFn: () => adminAPI.getCommissionConfig(),
  });

  useEffect(() => { if (data) setConfig(data); }, [data]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminAPI.updateCommissionConfig(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-commission'] }); toast({ title: 'Commission config updated' }); },
  });

  return (
    <AdminLayout title="Commission Configuration" subtitle="Set platform commission rates">
      {isLoading ? <LoadingSpinner /> : (
        <div className="max-w-3xl space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Percent size={20} /> Default Commission Rates</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Home Chef Commission (%)</Label>
                  <Input type="number" value={config.homeChefCommission || ''} onChange={(e) => setConfig({ ...config, homeChefCommission: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Restaurant Commission (%)</Label>
                  <Input type="number" value={config.restaurantCommission || ''} onChange={(e) => setConfig({ ...config, restaurantCommission: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform Fee (₹)</Label>
                  <Input type="number" value={config.platformFee || ''} onChange={(e) => setConfig({ ...config, platformFee: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Fee (₹)</Label>
                  <Input type="number" value={config.deliveryFee || ''} onChange={(e) => setConfig({ ...config, deliveryFee: Number(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Settlement Period (days)</Label>
                <Input type="number" value={config.settlementDays || ''} onChange={(e) => setConfig({ ...config, settlementDays: Number(e.target.value) })} />
              </div>
              <Button variant="gradient" className="gap-2" onClick={() => updateMutation.mutate(config)} disabled={updateMutation.isPending}>
                <Save size={18} /> {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
              </Button>
            </CardContent>
          </Card>

          {/* Per-Seller Override note */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Store size={24} className="text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Per-Seller Commission Override</h3>
                  <p className="text-sm text-muted-foreground">
                    You can set custom commission rates for individual sellers from the Sellers management page. 
                    Custom rates override the default rates configured above.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
