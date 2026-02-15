import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge, SellerBadge } from '@/components/shared/Badge';
import { RatingStars } from '@/components/shared/RatingStars';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Search, Filter, Eye, CheckCircle2, XCircle, MoreVertical, MapPin, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function AdminSellers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-sellers', activeTab],
    queryFn: () => adminAPI.getSellers(activeTab === 'all' ? undefined : activeTab),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminAPI.approveSeller(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-sellers'] }); toast({ title: 'Seller approved' }); },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminAPI.rejectSeller(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-sellers'] }); toast({ title: 'Seller rejected' }); },
  });

  const sellers = (data?.sellers || []).filter((s: any) =>
    s.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Seller Management" subtitle="Manage and approve sellers on the platform">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-secondary p-1 h-auto">
          <TabsTrigger value="all" className="data-[state=active]:bg-card">All Sellers</TabsTrigger>
          <TabsTrigger value="verified" className="data-[state=active]:bg-card">Verified</TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-card">Pending KYC</TabsTrigger>
          <TabsTrigger value="home_chef" className="data-[state=active]:bg-card">Home Chefs</TabsTrigger>
          <TabsTrigger value="restaurant" className="data-[state=active]:bg-card">Restaurants</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Search sellers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2"><Filter size={18} /> Filters</Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold text-foreground">{data?.total || sellers.length}</p></div>
        <div className="bg-success/10 rounded-xl p-4"><p className="text-sm text-success">Verified</p><p className="text-2xl font-bold text-success">{sellers.filter((s: any) => s.kycStatus === 'verified').length}</p></div>
        <div className="bg-warning/10 rounded-xl p-4"><p className="text-sm text-warning">Pending</p><p className="text-2xl font-bold text-warning">{sellers.filter((s: any) => s.kycStatus === 'pending').length}</p></div>
        <div className="bg-info/10 rounded-xl p-4"><p className="text-sm text-info">Active</p><p className="text-2xl font-bold text-info">{sellers.filter((s: any) => s.isActive).length}</p></div>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {sellers.map((seller: any) => (
            <Card key={seller._id}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {seller.logo && <img src={seller.logo} alt={seller.businessName} className="w-20 h-20 rounded-xl object-cover" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg text-foreground">{seller.businessName}</h3>
                          <SellerBadge type={seller.type} />
                          <StatusBadge status={seller.kycStatus} />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{seller.description}</p>
                      </div>
                      <Button variant="ghost" size="icon"><MoreVertical size={18} /></Button>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><MapPin size={14} />{seller.address?.city}, {seller.address?.state}</span>
                      <span className="flex items-center gap-1"><Phone size={14} />{seller.phone}</span>
                      <span className="flex items-center gap-1"><Mail size={14} />{seller.email}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2"><RatingStars rating={seller.rating} size="sm" /><span className="font-medium">{seller.rating}</span></div>
                      <span className="text-sm text-muted-foreground">{seller.totalOrders?.toLocaleString()} orders</span>
                      <span className="text-sm text-muted-foreground">{seller.commission}% commission</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="gap-2"><Eye size={14} /> View</Button>
                    {seller.kycStatus === 'pending' && (
                      <>
                        <Button variant="soft-success" size="sm" className="gap-2" onClick={() => approveMutation.mutate(seller._id)}><CheckCircle2 size={14} /> Approve</Button>
                        <Button variant="soft-destructive" size="sm" className="gap-2" onClick={() => rejectMutation.mutate(seller._id)}><XCircle size={14} /> Reject</Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!isLoading && sellers.length === 0 && (
        <div className="text-center py-12"><p className="text-muted-foreground">No sellers found</p></div>
      )}
    </AdminLayout>
  );
}
