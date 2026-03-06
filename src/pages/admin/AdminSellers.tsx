import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge, SellerBadge } from '@/components/shared/Badge';
import { RatingStars } from '@/components/shared/RatingStars';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Filter, Eye, CheckCircle2, XCircle, MoreVertical, MapPin, Phone, Mail, Clock, Store, FileCheck, IndianRupee, ExternalLink, Download, Image, FileText, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI, API_BASE_URL } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { safeArray } from '@/utils/safeArray';

const docTypeLabels: Record<string, string> = {
  aadhaar: 'Aadhaar Card',
  pan: 'PAN Card',
  fssai: 'FSSAI License',
  gst: 'GST Certificate',
  bankProof: 'Bank Proof',
  bank: 'Bank Statement',
};

export default function AdminSellers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewSeller, setViewSeller] = useState<any>(null);

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

  const sellers = safeArray(data?.sellers || data).filter((s: any) =>
    s?.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className="bg-warning/10 rounded-xl p-4"><p className="text-sm text-warning">Pending</p><p className="text-2xl font-bold text-warning">{sellers.filter((s: any) => s.kycStatus === 'pending' || s.kycStatus === 'submitted').length}</p></div>
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
                      <span className="text-sm text-muted-foreground">{seller.commissionRate || 15}% commission</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setViewSeller(seller)}>
                      <Eye size={14} /> View
                    </Button>
                    {(seller.kycStatus === 'pending' || seller.kycStatus === 'submitted') && (
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

      {/* ═══ VIEW SELLER DIALOG ═══ */}
      <Dialog open={!!viewSeller} onOpenChange={(open) => !open && setViewSeller(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {viewSeller?.logo && <img src={viewSeller.logo} alt="" className="w-10 h-10 rounded-lg object-cover" />}
              {viewSeller?.businessName}
              <SellerBadge type={viewSeller?.type} />
            </DialogTitle>
          </DialogHeader>
          {viewSeller && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <StatusBadge status={viewSeller.kycStatus} />
                {viewSeller.isActive && <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">Active</span>}
                {viewSeller.isVerified && <span className="px-2 py-0.5 rounded-full bg-info/10 text-info text-xs font-medium">Verified</span>}
              </div>

              {/* Description */}
              {viewSeller.description && (
                <p className="text-muted-foreground">{viewSeller.description}</p>
              )}

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
                  <p className="font-medium text-foreground flex items-center gap-2"><Phone size={14} />{viewSeller.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="font-medium text-foreground flex items-center gap-2"><Mail size={14} />{viewSeller.email}</p>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Address</p>
                <p className="font-medium text-foreground flex items-center gap-2">
                  <MapPin size={14} />
                  {[viewSeller.address?.street, viewSeller.address?.city, viewSeller.address?.state, viewSeller.address?.pincode].filter(Boolean).join(', ') || 'Not provided'}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{viewSeller.rating || 0}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{viewSeller.totalOrders || 0}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">₹{(viewSeller.totalRevenue || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{viewSeller.commissionRate || 15}%</p>
                  <p className="text-xs text-muted-foreground">Commission</p>
                </div>
              </div>

              {/* KYC Documents */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">KYC Documents</p>
                <div className="space-y-3">
                  {viewSeller.kycDocuments && Object.entries(viewSeller.kycDocuments).map(([key, doc]: [string, any]) => {
                    const hasDoc = doc?.url;
                    const docUrl = hasDoc ? (doc.url.startsWith('http') ? doc.url : `${API_BASE_URL.replace('/api', '')}${doc.url}`) : null;
                    const isImage = docUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(docUrl);

                    return (
                      <div key={key} className={`rounded-xl border p-3 ${hasDoc ? 'border-success/30 bg-success/5' : 'border-border bg-secondary/30'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {hasDoc ? <FileCheck size={18} className="text-success" /> : <AlertTriangle size={18} className="text-muted-foreground" />}
                            <span className="font-medium text-sm text-foreground">{docTypeLabels[key] || key}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            doc?.status === 'verified' ? 'bg-success/10 text-success' :
                            doc?.status === 'uploaded' ? 'bg-info/10 text-info' :
                            hasDoc ? 'bg-warning/10 text-warning' :
                            'bg-secondary text-muted-foreground'
                          }`}>
                            {doc?.status || (hasDoc ? 'Uploaded' : 'Missing')}
                          </span>
                        </div>

                        {/* Document Preview */}
                        {hasDoc && (
                          <div className="mt-2">
                            {isImage ? (
                              <div className="relative group">
                                <img
                                  src={docUrl}
                                  alt={`${key} document`}
                                  className="w-full max-h-48 object-contain rounded-lg bg-background border border-border"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                  <Button size="sm" variant="secondary" className="gap-1" onClick={() => window.open(docUrl, '_blank')}>
                                    <ExternalLink size={14} /> Full View
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <FileText size={16} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground truncate flex-1">{doc.url}</span>
                                <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => window.open(docUrl, '_blank')}>
                                  <ExternalLink size={12} /> Open
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {(!viewSeller.kycDocuments || Object.keys(viewSeller.kycDocuments).length === 0) && (
                    <div className="text-center py-4 rounded-xl bg-secondary/30 border border-border">
                      <AlertTriangle size={24} className="mx-auto text-warning mb-2" />
                      <p className="text-sm text-muted-foreground">No KYC documents uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* FSSAI & GST Numbers */}
              {(viewSeller.fssaiLicense || viewSeller.gstNumber) && (
                <div className="grid grid-cols-2 gap-3">
                  {viewSeller.fssaiLicense && (
                    <div className="bg-secondary/50 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">FSSAI License</p>
                      <p className="font-mono text-sm text-foreground">{viewSeller.fssaiLicense}</p>
                    </div>
                  )}
                  {viewSeller.gstNumber && (
                    <div className="bg-secondary/50 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">GST Number</p>
                      <p className="font-mono text-sm text-foreground">{viewSeller.gstNumber}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bank Details */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Bank Details</p>
                {viewSeller.bankDetails?.accountNumber ? (
                  <div className="bg-secondary/50 rounded-xl p-3 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Account:</span> <span className="text-foreground font-mono">{viewSeller.bankDetails.accountNumber}</span></p>
                    <p><span className="text-muted-foreground">IFSC:</span> <span className="text-foreground font-mono">{viewSeller.bankDetails.ifscCode}</span></p>
                    <p><span className="text-muted-foreground">Holder:</span> <span className="text-foreground">{viewSeller.bankDetails.accountHolder}</span></p>
                    <p><span className="text-muted-foreground">Bank:</span> <span className="text-foreground">{viewSeller.bankDetails.bankName}</span></p>
                  </div>
                ) : (
                  <p className="text-sm text-warning bg-warning/10 rounded-lg p-2">Bank details not provided</p>
                )}
              </div>

              {/* Operating Hours */}
              {viewSeller.operatingHours && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Operating Hours</p>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    {Object.entries(viewSeller.operatingHours).map(([day, hrs]: [string, any]) => (
                      <div key={day} className="flex items-center gap-2 py-1">
                        <span className="capitalize text-muted-foreground w-20">{day}</span>
                        {hrs?.isOpen ? (
                          <span className="text-foreground">{hrs.open} - {hrs.close}</span>
                        ) : (
                          <span className="text-destructive text-xs">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cuisines & Tags */}
              {(viewSeller.cuisines?.length > 0 || viewSeller.tags?.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {viewSeller.cuisines?.map((c: string) => (
                    <span key={c} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">{c}</span>
                  ))}
                  {viewSeller.tags?.map((t: string) => (
                    <span key={t} className="px-2 py-1 rounded-full bg-secondary text-muted-foreground text-xs">{t}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              {(viewSeller.kycStatus === 'pending' || viewSeller.kycStatus === 'submitted') && (
                <div className="flex gap-3 pt-2">
                  <Button variant="soft-success" className="flex-1 gap-2" onClick={() => { approveMutation.mutate(viewSeller._id); setViewSeller(null); }}>
                    <CheckCircle2 size={18} /> Approve Seller
                  </Button>
                  <Button variant="soft-destructive" className="flex-1 gap-2" onClick={() => { rejectMutation.mutate(viewSeller._id); setViewSeller(null); }}>
                    <XCircle size={18} /> Reject Seller
                  </Button>
                </div>
              )}

              {/* Joined */}
              <p className="text-xs text-muted-foreground text-center">
                Joined {new Date(viewSeller.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}