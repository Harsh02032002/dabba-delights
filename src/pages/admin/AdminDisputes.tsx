import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatusBadge } from '@/components/shared/Badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AdminDisputes() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [resolution, setResolution] = useState('');
  const [resolveStatus, setResolveStatus] = useState('resolved');

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: () => adminAPI.getDisputes(),
  });

  const resolveMutation = useMutation({
    mutationFn: () => adminAPI.resolveDispute(selected._id, resolveStatus, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
      toast({ title: 'Dispute resolved' });
      setSelected(null);
      setResolution('');
    },
  });

  return (
    <AdminLayout title="Disputes" subtitle="Manage customer and seller disputes">
      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {disputes.map((d: any) => (
            <Card key={d._id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${d.status === 'resolved' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                      {d.status === 'resolved' ? <CheckCircle2 size={24} className="text-success" /> : <AlertTriangle size={24} className="text-destructive" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Order #{d.orderId}</p>
                      <p className="text-sm text-muted-foreground">{d.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">Customer: {d.customerName} • Seller: {d.sellerName} • {new Date(d.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={d.status} />
                    {d.status === 'open' && <Button size="sm" variant="gradient" onClick={() => setSelected(d)}>Resolve</Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {disputes.length === 0 && <div className="text-center py-12"><p className="text-muted-foreground">No disputes</p></div>}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Resolve Dispute</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <select value={resolveStatus} onChange={(e) => setResolveStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background">
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            <Textarea placeholder="Resolution details..." value={resolution} onChange={(e) => setResolution(e.target.value)} rows={4} />
            <Button variant="gradient" className="w-full" onClick={() => resolveMutation.mutate()} disabled={!resolution || resolveMutation.isPending}>
              {resolveMutation.isPending ? 'Resolving...' : 'Submit Resolution'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
