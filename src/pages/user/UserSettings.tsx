import { UserLayout } from '@/layouts/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { User, Camera, Save, Lock } from 'lucide-react';
import { useState } from 'react';

export default function UserSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => authAPI.getProfile(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => authAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({ title: 'Profile Updated' });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      authAPI.changePassword(data.currentPassword, data.newPassword),
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);
      
      try {
        await authAPI.uploadAvatar(formData);
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        toast({ title: 'Profile picture updated successfully' });
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'Failed to upload image', variant: 'destructive' });
      }
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('banner', file);
      
      try {
        await authAPI.uploadBanner(formData);
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        toast({ title: 'Banner image updated successfully' });
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'Failed to upload image', variant: 'destructive' });
      }
    }
  };

  if (isLoading) return <UserLayout><LoadingSpinner /></UserLayout>;

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-display font-bold text-foreground mb-8">Settings</h1>

        {/* Profile Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <User size={20} /> Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile?.avatar || profile?.profileImage} />
                  <AvatarFallback>
                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="profileImage" className="cursor-pointer">
                    <div className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 rounded-lg px-4 py-2 transition-colors">
                      <Camera size={16} />
                      <span>Change Photo</span>
                    </div>
                  </Label>
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Banner Image */}
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <div className="relative h-32 rounded-lg overflow-hidden bg-secondary/50 border-2 border-dashed border-border">
                  {profile?.banner ? (
                    <img src={profile.banner} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Camera size={24} className="text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Upload Banner</span>
                    </div>
                  )}
                  <Label htmlFor="banner" className="absolute inset-0 cursor-pointer">
                    <div className="w-full h-full bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                    </div>
                  </Label>
                  <input
                    type="file"
                    id="banner"
                    accept="image/*"
                    onChange={(e) => handleBannerUpload(e)}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={formData.name || profile?.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email || profile?.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={formData.phone || profile?.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.address || profile?.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={formData.bio || profile?.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <Button type="submit" variant="gradient" className="gap-2" disabled={updateMutation.isPending}>
                <Save size={18} />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Lock size={20} /> Change Password
            </CardTitle>
          </CardHeader>
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
    </UserLayout>
  );
}
