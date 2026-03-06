import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { Megaphone, Plus, DollarSign, TrendingUp, Target, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminMarketing() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: () => adminAPI.getCampaigns(),
  });

  const { data: spend } = useQuery({
    queryKey: ['admin-marketing-spend'],
    queryFn: () => adminAPI.getMarketingSpend(),
  });

  const campaignList = (campaigns as any)?.campaigns || campaigns || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => adminAPI.createCampaign(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] }); toast({ title: 'Campaign created' }); setIsCreateOpen(false); },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      name: fd.get('name'),
      description: fd.get('description'),
      budget: Number(fd.get('budget')),
      startDate: fd.get('startDate'),
      endDate: fd.get('endDate'),
    });
  };

  return (
    <AdminLayout title="Marketing" subtitle="Manage campaigns and track marketing spend">
      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <Card className="stat-card">
          <CardContent className="p-0">
            <p className="text-sm text-muted-foreground mb-1">Total Spend</p>
            <p className="text-3xl font-bold text-foreground">₹{spend?.totalSpend?.toLocaleString() || '0'}</p>
            <DollarSign size={24} className="text-primary mt-2" />
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-0">
            <p className="text-sm text-muted-foreground mb-1">Active Campaigns</p>
            <p className="text-3xl font-bold text-foreground">{spend?.activeCampaigns || 0}</p>
            <Target size={24} className="text-success mt-2" />
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-0">
            <p className="text-sm text-muted-foreground mb-1">Conversions</p>
            <p className="text-3xl font-bold text-foreground">{spend?.totalConversions || 0}</p>
            <TrendingUp size={24} className="text-info mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Spend Chart */}
      {spend?.monthlySpend && (
        <Card className="mb-8">
          <CardHeader><CardTitle className="font-display text-lg">Monthly Marketing Spend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spend.monthlySpend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(30, 20%, 90%)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Spend']} />
                  <Bar dataKey="spend" fill="hsl(16, 85%, 55%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold text-foreground">Campaigns</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="gap-2"><Plus size={18} /> New Campaign</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Create Campaign</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2"><Label>Campaign Name</Label><Input name="name" required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea name="description" rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Budget (₹)</Label><Input name="budget" type="number" required /></div>
                <div className="space-y-2"><Label>Start Date</Label><Input name="startDate" type="date" required /></div>
              </div>
              <div className="space-y-2"><Label>End Date</Label><Input name="endDate" type="date" /></div>
              <Button type="submit" variant="gradient" className="w-full" disabled={createMutation.isPending}>Create Campaign</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {campaignList.map((c: any) => (
            <Card key={c._id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Megaphone size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{c.name}</h3>
                      <p className="text-sm text-muted-foreground">{c.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">₹{c.budget?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar size={12} />{new Date(c.startDate).toLocaleDateString()}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {c.status || 'active'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(campaignList.length === 0) && (
            <div className="text-center py-12"><p className="text-muted-foreground">No campaigns yet</p></div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
