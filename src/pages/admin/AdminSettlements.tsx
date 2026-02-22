import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/Badge';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { Receipt, CheckCircle2, Clock, DollarSign, Send } from 'lucide-react';
import { safeArray } from '@/utils/safeArray';

export default function AdminSettlements() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: settlements, isLoading } = useQuery({
    queryKey: ['admin-settlements', statusFilter],
    queryFn: () => adminAPI.getSettlements(statusFilter === 'all' ? undefined : statusFilter),
  });

  const processMutation = useMutation({
    mutationFn: (id: string) => adminAPI.processSettlement(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-settlements'] }); toast({ title: 'Settlement processed' }); },
  });

  const bulkProcessMutation = useMutation({
    mutationFn: () => {
      const pendingIds = safeArray(settlements).filter((s: any) => s.status === 'pending').map((s: any) => s._id);
      return adminAPI.bulkProcessSettlements(pendingIds);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-settlements'] }); toast({ title: 'All pending settlements processed' }); },
  });

  return (
    <AdminLayout title="Settlements" subtitle="Manage seller payment settlements">
      <div className="flex items-center justify-between mb-6">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-secondary p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-card">All</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-card">Pending</TabsTrigger>
            <TabsTrigger value="settled" className="data-[state=active]:bg-card">Settled</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="gradient" className="gap-2" onClick={() => bulkProcessMutation.mutate()} disabled={bulkProcessMutation.isPending}>
          <Send size={18} /> Process All Pending
        </Button>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {safeArray(settlements).map((s: any) => (
            <Card key={s._id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.status === 'settled' ? 'bg-success/10' : 'bg-warning/10'}`}>
                      {s.status === 'settled' ? <CheckCircle2 size={24} className="text-success" /> : <Clock size={24} className="text-warning" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{s.sellerName || `Seller #${s.sellerId}`}</p>
                      <p className="text-sm text-muted-foreground">Order #{s.orderId} • {new Date(s.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">Order: ₹{s.orderAmount} | Commission: ₹{s.commission} | GST: ₹{s.gst}</p>
                      <p className="text-lg font-bold text-success">Net: ₹{s.netAmount}</p>
                    </div>
                    <StatusBadge status={s.status} />
                    {s.status === 'pending' && (
                      <Button size="sm" variant="soft-success" onClick={() => processMutation.mutate(s._id)}>Process</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {safeArray(settlements).length === 0 && (
            <div className="text-center py-12"><p className="text-muted-foreground">No settlements found</p></div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
