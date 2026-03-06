import { useState } from 'react';
import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatusBadge } from '@/components/shared/Badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Wallet, Plus, DollarSign, CheckCircle2, Clock } from 'lucide-react';

export default function SellerPayouts() {
  const queryClient = useQueryClient();
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  const { data: payoutsRaw, isLoading } = useQuery({
    queryKey: ['seller-payouts'],
    queryFn: () => sellerAPI.getPayouts(),
  });
  const payouts = Array.isArray(payoutsRaw) ? payoutsRaw : Array.isArray((payoutsRaw as any)?.payouts) ? (payoutsRaw as any).payouts : [];

  const requestMutation = useMutation({
    mutationFn: ({ amount, method }: { amount: number; method: string }) => sellerAPI.requestPayout(amount, method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-payouts'] });
      toast({ title: 'Payout requested!' });
      setIsRequestOpen(false);
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const handleRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    requestMutation.mutate({
      amount: Number(fd.get('amount')),
      method: fd.get('method') as string,
    });
  };

  return (
    <SellerLayout title="Payouts" subtitle="Request and track your payouts">
      <div className="flex justify-end mb-6">
        <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="gap-2"><Plus size={18} /> Request Payout</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Request Payout</DialogTitle></DialogHeader>
            <form onSubmit={handleRequest} className="space-y-4 mt-4">
              <div className="space-y-2"><Label>Amount (₹)</Label><Input name="amount" type="number" placeholder="1000" required /></div>
              <div className="space-y-2">
                <Label>Method</Label>
                <select name="method" className="w-full px-3 py-2 rounded-lg border border-border bg-background">
                  <option value="bank">Bank Transfer</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
              <Button type="submit" variant="gradient" className="w-full" disabled={requestMutation.isPending}>
                {requestMutation.isPending ? 'Requesting...' : 'Request Payout'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {payouts.map((p: any) => (
            <Card key={p._id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${p.status === 'completed' ? 'bg-success/10' : 'bg-warning/10'}`}>
                      {p.status === 'completed' ? <CheckCircle2 size={24} className="text-success" /> : <Clock size={24} className="text-warning" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">₹{p.amount?.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">via {p.method} • {new Date(p.requestedAt || p.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                {p.processedAt && <p className="text-xs text-muted-foreground mt-2">Processed: {new Date(p.processedAt).toLocaleDateString()}</p>}
              </CardContent>
            </Card>
          ))}
          {payouts.length === 0 && <div className="text-center py-12"><p className="text-muted-foreground">No payouts yet</p></div>}
        </div>
      )}
    </SellerLayout>
  );
}
