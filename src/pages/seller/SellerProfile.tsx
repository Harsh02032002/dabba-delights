import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { Store, Save, ImagePlus, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SellerProfile() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ['seller-profile'],
    queryFn: () => sellerAPI.getProfile(),
  });

  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => sellerAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-profile'] });
      toast({ title: 'Profile Updated' });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <SellerLayout title="Business Profile" subtitle="Manage your store details and settings">
      {isLoading ? <LoadingSpinner /> : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Store size={20} /> Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input value={formData.businessName || ''} onChange={(e) => handleChange('businessName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <select value={formData.type || ''} onChange={(e) => handleChange('type', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background">
                    <option value="home_chef">Home Chef</option>
                    <option value="restaurant">Restaurant</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cuisines (comma-separated)</Label>
                <Input value={formData.cuisines?.join(', ') || ''} onChange={(e) => handleChange('cuisines', e.target.value.split(',').map((s: string) => s.trim()))} />
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Clock size={20} /> Operating Hours</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(formData.operatingHours || []).map((oh: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50">
                    <span className="w-24 font-medium text-foreground">{oh.day}</span>
                    <div className="flex items-center gap-2">
                      <Switch checked={!oh.isClosed} onCheckedChange={(checked) => {
                        const updated = [...formData.operatingHours];
                        updated[i] = { ...oh, isClosed: !checked };
                        handleChange('operatingHours', updated);
                      }} />
                      <span className="text-sm text-muted-foreground">{oh.isClosed ? 'Closed' : 'Open'}</span>
                    </div>
                    {!oh.isClosed && (
                      <>
                        <Input type="time" value={oh.open} className="w-32" onChange={(e) => {
                          const updated = [...formData.operatingHours];
                          updated[i] = { ...oh, open: e.target.value };
                          handleChange('operatingHours', updated);
                        }} />
                        <span className="text-muted-foreground">to</span>
                        <Input type="time" value={oh.close} className="w-32" onChange={(e) => {
                          const updated = [...formData.operatingHours];
                          updated[i] = { ...oh, close: e.target.value };
                          handleChange('operatingHours', updated);
                        }} />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Bank Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Holder Name</Label>
                  <Input value={formData.bankDetails?.accountName || ''} onChange={(e) => handleChange('bankDetails', { ...formData.bankDetails, accountName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input value={formData.bankDetails?.accountNumber || ''} onChange={(e) => handleChange('bankDetails', { ...formData.bankDetails, accountNumber: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input value={formData.bankDetails?.bankName || ''} onChange={(e) => handleChange('bankDetails', { ...formData.bankDetails, bankName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>IFSC Code</Label>
                  <Input value={formData.bankDetails?.ifscCode || ''} onChange={(e) => handleChange('bankDetails', { ...formData.bankDetails, ifscCode: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" variant="gradient" className="gap-2" disabled={updateMutation.isPending}>
            <Save size={18} />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      )}
    </SellerLayout>
  );
}
