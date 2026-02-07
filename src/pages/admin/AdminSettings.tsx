import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Settings, Bell, Lock, Globe, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<any>({});

  const { data } = useQuery({
    queryKey: ['admin-platform-config'],
    queryFn: () => adminAPI.getPlatformConfig(),
  });

  useEffect(() => { if (data) setConfig(data); }, [data]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminAPI.updatePlatformConfig(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-platform-config'] }); toast({ title: 'Settings updated' }); },
  });

  return (
    <AdminLayout title="Platform Settings" subtitle="Configure global platform settings">
      <div className="space-y-6 max-w-3xl">
        {/* General */}
        <Card>
          <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Globe size={20} /> General Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Platform Name</Label><Input value={config.platformName || ''} onChange={(e) => setConfig({ ...config, platformName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Support Email</Label><Input value={config.supportEmail || ''} onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Support Phone</Label><Input value={config.supportPhone || ''} onChange={(e) => setConfig({ ...config, supportPhone: e.target.value })} /></div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Bell size={20} /> Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send email alerts for critical events' },
              { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Send SMS for order updates' },
              { key: 'pushNotifications', label: 'Push Notifications', desc: 'Enable push notifications' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div><p className="font-medium text-foreground">{item.label}</p><p className="text-sm text-muted-foreground">{item.desc}</p></div>
                <Switch checked={config[item.key] || false} onCheckedChange={(v) => setConfig({ ...config, [item.key]: v })} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Lock size={20} /> Admin Security</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Current Password</Label><Input type="password" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>New Password</Label><Input type="password" /></div>
              <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" /></div>
            </div>
            <Button variant="outline">Update Password</Button>
          </CardContent>
        </Card>

        <Button variant="gradient" className="gap-2" onClick={() => updateMutation.mutate(config)} disabled={updateMutation.isPending}>
          <Save size={18} /> {updateMutation.isPending ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </AdminLayout>
  );
}
