import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { DollarSign, Zap, Clock, Gift, Truck, Save } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function AdminDeliveryPayConfig() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-delivery-pay-config'],
    queryFn: () => adminAPI.getDeliveryPayConfig(),
  });

  const [form, setForm] = useState<any>(null);

  // Sync form with data
  if (data && !form) {
    setForm({
      basePay: data.basePay || 25,
      perKmRate: data.perKmRate || 8,
      surgeMultiplier: data.surgeMultiplier || 1.0,
      surgeActive: data.surgeActive || false,
      rainSurge: data.rainSurge || 1.5,
      peakHourSurge: data.peakHourSurge || 1.3,
      tipPassthrough: data.tipPassthrough || 100,
      incentivePerDelivery: data.incentivePerDelivery || 0,
      bonusThreshold: data.bonusThreshold || 20,
      bonusAmount: data.bonusAmount || 200,
      weeklySettlement: data.weeklySettlement !== false,
    });
  }

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminAPI.updateDeliveryPayConfig(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-delivery-pay-config'] }); toast.success('Pay config updated'); },
  });

  if (isLoading || !form) return <AdminLayout title="Delivery Pay Config"><LoadingSpinner /></AdminLayout>;

  return (
    <AdminLayout title="Delivery Pay Config" subtitle="Configure delivery partner payment structure (Swiggy/Zomato style)">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Base Pay */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><DollarSign size={16} className="text-primary" /> Base Pay Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Base Pay per Delivery (₹)</Label>
              <Input type="number" value={form.basePay} onChange={(e) => setForm({ ...form, basePay: +e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">Fixed amount for every delivery</p>
            </div>
            <div>
              <Label>Per KM Rate (₹)</Label>
              <Input type="number" value={form.perKmRate} onChange={(e) => setForm({ ...form, perKmRate: +e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">Additional pay per kilometer</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">Example: 5km delivery</p>
              <p className="text-lg font-bold text-primary">₹{form.basePay + (form.perKmRate * 5)}</p>
              <p className="text-xs text-muted-foreground">₹{form.basePay} base + ₹{form.perKmRate * 5} (5km × ₹{form.perKmRate})</p>
            </div>
          </CardContent>
        </Card>

        {/* Surge Pricing */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Zap size={16} className="text-warning" /> Surge Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Surge Active</Label>
              <Switch checked={form.surgeActive} onCheckedChange={(v) => setForm({ ...form, surgeActive: v })} />
            </div>
            <div>
              <Label>Rain Surge Multiplier</Label>
              <Input type="number" step="0.1" value={form.rainSurge} onChange={(e) => setForm({ ...form, rainSurge: +e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">e.g., 1.5x means 50% extra during rain</p>
            </div>
            <div>
              <Label>Peak Hour Surge Multiplier</Label>
              <Input type="number" step="0.1" value={form.peakHourSurge} onChange={(e) => setForm({ ...form, peakHourSurge: +e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">Applied during lunch/dinner rush hours</p>
            </div>
          </CardContent>
        </Card>

        {/* Incentives */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Gift size={16} className="text-success" /> Incentives & Bonuses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Incentive per Delivery (₹)</Label>
              <Input type="number" value={form.incentivePerDelivery} onChange={(e) => setForm({ ...form, incentivePerDelivery: +e.target.value })} />
            </div>
            <div>
              <Label>Bonus Threshold (deliveries)</Label>
              <Input type="number" value={form.bonusThreshold} onChange={(e) => setForm({ ...form, bonusThreshold: +e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">Complete this many deliveries/day for bonus</p>
            </div>
            <div>
              <Label>Bonus Amount (₹)</Label>
              <Input type="number" value={form.bonusAmount} onChange={(e) => setForm({ ...form, bonusAmount: +e.target.value })} />
            </div>
          </CardContent>
        </Card>

        {/* Tips & Settlement */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Truck size={16} className="text-info" /> Tips & Settlement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tip Passthrough (%)</Label>
              <Input type="number" value={form.tipPassthrough} onChange={(e) => setForm({ ...form, tipPassthrough: +e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">100% = full tip goes to partner</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Weekly Settlement</Label>
                <p className="text-xs text-muted-foreground">Pay partners every week</p>
              </div>
              <Switch checked={form.weeklySettlement} onCheckedChange={(v) => setForm({ ...form, weeklySettlement: v })} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button variant="gradient" size="lg" className="gap-2" onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending}>
          <Save size={18} /> {updateMutation.isPending ? 'Saving...' : 'Save Pay Configuration'}
        </Button>
      </div>
    </AdminLayout>
  );
}
