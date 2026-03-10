import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Bell, Lock, Palette, Camera, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useState, useEffect } from 'react';

export default function SellerSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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

  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      sellerAPI.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      toast({ title: 'Password Changed Successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: 'File too large', 
        description: 'Please select an image under 5MB', 
        variant: 'destructive' 
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: 'Invalid file', 
        description: 'Please select an image file', 
        variant: 'destructive' 
      });
      return;
    }
    
    const formData = new FormData();
    formData.append(type === 'logo' ? 'logo' : 'cover', file);
    
    console.log(`📤 Uploading ${type}...`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    try {
      let response;
      if (type === 'logo') {
        response = await sellerAPI.uploadLogo(formData);
        console.log('✅ Logo upload response:', response);
      } else {
        response = await sellerAPI.uploadCoverImage(formData);
        console.log('✅ Cover upload response:', response);
      }
      
      queryClient.invalidateQueries({ queryKey: ['seller-profile'] });
      toast({ 
        title: 'Success', 
        description: `${type === 'logo' ? 'Logo' : 'Banner'} updated successfully` 
      });
    } catch (error: any) {
      console.error(`❌ ${type} upload error:`, error);
      toast({ 
        title: 'Upload Failed', 
        description: error.message || `Failed to upload ${type}. Please try again.`, 
        variant: 'destructive' 
      });
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (isLoading) return <SellerLayout title="Settings"><LoadingSpinner /></SellerLayout>;

  return (
    <SellerLayout title="Settings" subtitle="Configure your account and preferences">
      <div className="space-y-6 max-w-3xl">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Settings size={20} /> Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Profile Picture & Banner */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile?.logo || formData.logo} />
                    <AvatarFallback>
                      {formData.businessName?.charAt(0)?.toUpperCase() || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="logo" className="cursor-pointer">
                      <div className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 rounded-lg px-4 py-2 transition-colors">
                        <Camera size={16} />
                        <span>Change Logo</span>
                      </div>
                    </Label>
                    <input
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'logo')}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner">Banner Image</Label>
                  <div className="relative h-32 rounded-lg overflow-hidden bg-secondary/50 border-2 border-dashed border-border">
                    {profile?.coverImage || formData.coverImage ? (
                      <img src={profile?.coverImage || formData.coverImage} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Label htmlFor="banner" className="cursor-pointer">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Camera size={24} />
                            <span className="text-sm">Upload Banner</span>
                          </div>
                        </Label>
                      </div>
                    )}
                    <input
                      type="file"
                      id="banner"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'banner')}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input
                    value={formData.businessName || ''}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <select
                    value={formData.type || ''}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="home_chef">Home Chef</option>
                    <option value="restaurant">Restaurant</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <Button type="submit" variant="gradient" className="gap-2" disabled={updateMutation.isPending}>
                <Save size={18} />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

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
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <Button type="submit" variant="gradient" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}
