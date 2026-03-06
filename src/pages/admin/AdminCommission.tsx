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

  useEffect(() => {
    if (data) {
      setConfig({
        defaultRate: (data as any).defaultRate ?? 15,
        minCommission: (data as any).minCommission ?? 5,
        maxCommission: (data as any).maxCommission ?? 30,
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (d: any) => adminAPI.updateCommissionConfig(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-commission'] });
      toast({ title: 'Commission config updated' });
    },
  });

  return (
    <AdminLayout title="Commission Configuration" subtitle="Set platform commission rates">
      {isLoading ? <LoadingSpinner /> : (
        <div className="max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Percent size={20} /> Commission Rates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Default Commission (%)</Label>
                  <Input
                    type="number"
                    value={config.defaultRate ?? ''}
                    onChange={(e) => setConfig({ ...config, defaultRate: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Applied to all sellers by default</p>
                </div>
                <div className="space-y-2">
                  <Label>Min Commission (%)</Label>
                  <Input
                    type="number"
                    value={config.minCommission ?? ''}
                    onChange={(e) => setConfig({ ...config, minCommission: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Minimum rate allowed</p>
                </div>
                <div className="space-y-2">
                  <Label>Max Commission (%)</Label>
                  <Input
                    type="number"
                    value={config.maxCommission ?? ''}
                    onChange={(e) => setConfig({ ...config, maxCommission: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Maximum rate allowed</p>
                </div>
              </div>
              <Button
                variant="gradient"
                className="gap-2"
                onClick={() => updateMutation.mutate(config)}
                disabled={updateMutation.isPending}
              >
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
