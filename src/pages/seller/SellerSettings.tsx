import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, Lock, Palette } from 'lucide-react';

export default function SellerSettings() {
  return (
    <SellerLayout title="Settings" subtitle="Configure your account and preferences">
      <div className="space-y-6 max-w-3xl">
        {/* Notifications */}
        <Card>
          <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Bell size={20} /> Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'New order alerts', desc: 'Get notified when a new order comes in', default: true },
              { label: 'Order status updates', desc: 'Notifications for order lifecycle changes', default: true },
              { label: 'Settlement alerts', desc: 'Get notified when settlements are processed', default: true },
              { label: 'Marketing emails', desc: 'Receive promotional emails from Dabba Nation', default: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked={item.default} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Lock size={20} /> Security</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" placeholder="Enter current password" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" placeholder="Confirm new password" />
              </div>
            </div>
            <Button variant="gradient">Update Password</Button>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}
