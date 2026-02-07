import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { FileText, Save, Receipt } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminGST() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<any>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin-gst'],
    queryFn: () => adminAPI.getGSTConfig(),
  });

  useEffect(() => { if (data) setConfig(data); }, [data]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminAPI.updateGSTConfig(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-gst'] }); toast({ title: 'GST config updated' }); },
  });

  return (
    <AdminLayout title="GST Configuration" subtitle="Configure tax rates and invoice settings">
      {isLoading ? <LoadingSpinner /> : (
        <div className="max-w-3xl space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><FileText size={20} /> GST Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CGST Rate (%)</Label>
                  <Input type="number" step="0.5" value={config.cgst || ''} onChange={(e) => setConfig({ ...config, cgst: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>SGST Rate (%)</Label>
                  <Input type="number" step="0.5" value={config.sgst || ''} onChange={(e) => setConfig({ ...config, sgst: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>IGST Rate (%)</Label>
                  <Input type="number" step="0.5" value={config.igst || ''} onChange={(e) => setConfig({ ...config, igst: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <Input value={config.gstNumber || ''} onChange={(e) => setConfig({ ...config, gstNumber: e.target.value })} placeholder="e.g., 22AAAAA0000A1Z5" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div>
                  <p className="font-medium text-foreground">Apply GST on delivery fee</p>
                  <p className="text-sm text-muted-foreground">Include delivery charges in GST calculation</p>
                </div>
                <Switch checked={config.gstOnDelivery || false} onCheckedChange={(v) => setConfig({ ...config, gstOnDelivery: v })} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div>
                  <p className="font-medium text-foreground">Auto-generate invoices</p>
                  <p className="text-sm text-muted-foreground">Generate GST-compliant invoices for every order</p>
                </div>
                <Switch checked={config.autoInvoice || false} onCheckedChange={(v) => setConfig({ ...config, autoInvoice: v })} />
              </div>
              <Button variant="gradient" className="gap-2" onClick={() => updateMutation.mutate(config)} disabled={updateMutation.isPending}>
                <Save size={18} /> {updateMutation.isPending ? 'Saving...' : 'Save GST Configuration'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
