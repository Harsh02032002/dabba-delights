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

  // Location detection function
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('📍 Location detected:', { latitude, longitude });
          
          // Get address from coordinates (reverse geocoding)
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            
            console.log('🗺️ Address data:', data);
            
            // Auto-fill address fields
            const addressData = {
              street: data.address?.road || data.address?.suburb || '',
              city: data.address?.city || data.address?.town || '',
              state: data.address?.state || '',
              pincode: data.address?.postcode || '',
              fullAddress: data.display_name || '',
              location: {
                type: 'Point',
                coordinates: [longitude, latitude]
              }
            };
            
            setFormData((prev: any) => ({
              ...prev,
              address: {
                ...prev.address,
                ...addressData
              }
            }));
            
            toast({
              title: '📍 Location Detected & Address Filled',
              description: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\nAddress: ${addressData.fullAddress}`,
            });
            
          } catch (error) {
            console.error('❌ Reverse geocoding failed:', error);
            
            // Fallback: just set coordinates
            setFormData((prev: any) => ({
              ...prev,
              address: {
                ...prev.address,
                location: {
                  type: 'Point',
                  coordinates: [longitude, latitude]
                }
              }
            }));
            
            toast({
              title: '📍 Location Detected',
              description: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\nPlease fill address manually`,
            });
          }
        },
        (error) => {
          console.error('❌ Location detection failed:', error);
          toast({
            title: '❌ Location Error',
            description: 'Could not detect your location. Please enable location services.',
            variant: 'destructive'
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      toast({
        title: '❌ Not Supported',
        description: 'Geolocation is not supported by your browser.',
        variant: 'destructive'
      });
    }
  };

  const { data: profile, isLoading } = useQuery({
    queryKey: ['seller-profile'],
    queryFn: async () => {
      console.log('🔍 Fetching seller profile...');
      const res = await sellerAPI.getProfile();
      console.log('📡 Raw API response:', res);
      console.log('📋 Profile data:', res?.data || res);
      return res?.data || res;
    },
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

  // Handle image upload
  const handleImageUpload = async (field: string, file: File) => {
    if (!file) return;
    
    // Validate file size
    const maxSize = field === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB for logo, 5MB for cover
    if (file.size > maxSize) {
      toast({
        title: '❌ File Too Large',
        description: `Max size: ${field === 'logo' ? '2MB' : '5MB'}`,
        variant: 'destructive'
      });
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: '❌ Invalid File Type',
        description: 'Please upload an image file',
        variant: 'destructive'
      });
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev: any) => ({
        ...prev,
        [field]: base64String
      }));
      
      toast({
        title: '📷 Image Uploaded',
        description: `${field === 'logo' ? 'Logo' : 'Cover Image'} updated successfully`,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <SellerLayout title="Business Profile" subtitle="Manage your store details and settings">
      {isLoading ? <LoadingSpinner /> : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo & Cover Image */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><ImagePlus size={20} /> Store Images</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store Logo</Label>
                  <div className="flex items-center gap-4">
                    {formData.logo && (
                      <img 
                        src={formData.logo} 
                        alt="Store Logo" 
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload('logo', e.target.files?.[0])}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">Recommended: 200x200px, Max 2MB</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div className="flex items-center gap-4">
                    {formData.coverImage && (
                      <img 
                        src={formData.coverImage} 
                        alt="Cover Image" 
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload('coverImage', e.target.files?.[0])}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">Recommended: 800x400px, Max 5MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                {Array.isArray(formData.operatingHours) && formData.operatingHours.map((oh: any, i: number) => (
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

          {/* Address */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Store size={20} /> Address</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input value={formData.address?.street || ''} onChange={(e) => handleChange('address', { ...formData.address, street: e.target.value })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={formData.address?.city || ''} onChange={(e) => handleChange('address', { ...formData.address, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={formData.address?.state || ''} onChange={(e) => handleChange('address', { ...formData.address, state: e.target.value })} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input value={formData.address?.pincode || ''} onChange={(e) => handleChange('address', { ...formData.address, pincode: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Full Address</Label>
                  <Input value={formData.address?.fullAddress || ''} onChange={(e) => handleChange('address', { ...formData.address, fullAddress: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>📍 Auto-detect Location</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={detectLocation}
                  className="w-full"
                >
                  📍 Detect My Location
                </Button>
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
                  <Input value={formData.bankDetails?.accountHolder || ''} onChange={(e) => handleChange('bankDetails', { ...formData.bankDetails, accountHolder: e.target.value })} />
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
