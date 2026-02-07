import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { Gift, Save, Users, DollarSign } from 'lucide-react';

export default function AdminReferrals() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [referralConfig, setReferralConfig] = useState<any>({});

  const { data } = useQuery({
    queryKey: ['admin-referrals', statusFilter],
    queryFn: () => adminAPI.getReferrals({ status: statusFilter === 'all' ? undefined : statusFilter }),
  });

  const { data: config } = useQuery({
    queryKey: ['admin-referral-config'],
    queryFn: () => adminAPI.getReferralConfig(),
  });

  useEffect(() => { if (config) setReferralConfig(config); }, [config]);

  const updateConfigMutation = useMutation({
    mutationFn: (data: any) => adminAPI.updateReferralConfig(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-referral-config'] }); toast({ title: 'Referral config updated' }); },
  });

  return (
    <AdminLayout title="Referral System" subtitle="Manage referral codes and rewards">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Config */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Gift size={20} /> Referral Config</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Reward Amount (₹)</Label>
              <Input type="number" value={referralConfig.reward || ''} onChange={(e) => setReferralConfig({ ...referralConfig, reward: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Reward Type</Label>
              <select value={referralConfig.rewardType || 'fixed'} onChange={(e) => setReferralConfig({ ...referralConfig, rewardType: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background">
                <option value="fixed">Fixed Amount</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Referrer Bonus (₹)</Label>
              <Input type="number" value={referralConfig.referrerBonus || ''} onChange={(e) => setReferralConfig({ ...referralConfig, referrerBonus: Number(e.target.value) })} />
            </div>
            <Button variant="gradient" className="w-full gap-2" onClick={() => updateConfigMutation.mutate(referralConfig)}>
              <Save size={18} /> Save Config
            </Button>
          </CardContent>
        </Card>

        {/* Referrals List */}
        <div className="lg:col-span-2">
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-4">
            <TabsList className="bg-secondary p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-card">All</TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-card">Pending</TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-card">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-3">
            {(data?.referrals || []).map((ref: any) => (
              <Card key={ref._id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Referrer: {ref.referrerId}</p>
                        <p className="text-sm text-muted-foreground">Referred: {ref.referredId} ({ref.referredType})</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ref.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {ref.status}
                      </span>
                      <p className="text-sm font-bold text-foreground mt-1">₹{ref.reward}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!data?.referrals || data.referrals.length === 0) && (
              <div className="text-center py-12"><p className="text-muted-foreground">No referrals found</p></div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
