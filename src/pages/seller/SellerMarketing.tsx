import { useState } from 'react';
import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Plus, Megaphone, Calendar, Users } from 'lucide-react';

export default function SellerMarketing() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['seller-campaigns'],
    queryFn: () => sellerAPI.getCampaigns(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => sellerAPI.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-campaigns'] });
      toast({ title: 'Campaign created!' });
      setIsCreateOpen(false);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      title: fd.get('title'),
      message: fd.get('message'),
      type: fd.get('type'),
      scheduledAt: fd.get('scheduledAt'),
    });
  };

  return (
    <SellerLayout title="Marketing" subtitle="Create and manage marketing campaigns">
      <div className="flex justify-end mb-6">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="gap-2"><Plus size={18} /> New Campaign</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Create Campaign</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2"><Label>Title</Label><Input name="title" required /></div>
              <div className="space-y-2"><Label>Message</Label><Textarea name="message" rows={3} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select name="type" className="w-full px-3 py-2 rounded-lg border border-border bg-background">
                    <option value="push">Push Notification</option>
                    <option value="email">Email</option>
                    <option value="banner">Banner</option>
                  </select>
                </div>
                <div className="space-y-2"><Label>Schedule</Label><Input name="scheduledAt" type="datetime-local" /></div>
              </div>
              <Button type="submit" variant="gradient" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Campaign'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {campaigns.map((c: any) => (
            <Card key={c._id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Megaphone size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{c.title}</h3>
                      <p className="text-sm text-muted-foreground">{c.message}</p>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="capitalize">{c.type}</span>
                        {c.scheduledAt && <span className="flex items-center gap-1"><Calendar size={12} />{new Date(c.scheduledAt).toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'sent' ? 'bg-success/10 text-success' : c.status === 'scheduled' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'}`}>
                      {c.status || 'draft'}
                    </span>
                    {c.metrics && (
                      <p className="text-xs text-muted-foreground mt-1">Sent: {c.metrics.sent} | Opened: {c.metrics.opened}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {campaigns.length === 0 && <div className="text-center py-12"><p className="text-muted-foreground">No campaigns yet</p></div>}
        </div>
      )}
    </SellerLayout>
  );
}
