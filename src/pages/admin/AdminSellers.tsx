import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge, SellerBadge } from '@/components/shared/Badge';
import { RatingStars } from '@/components/shared/RatingStars';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Filter, Eye, CheckCircle2, XCircle, MoreVertical, MapPin, Phone, Mail, Clock, Store, FileCheck, IndianRupee, ExternalLink, Download, Image, FileText, AlertTriangle, Plus, Trash2 } from 'lucide-react';
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
  const [showAddSeller, setShowAddSeller] = useState(false);
  const [newSellerForm, setNewSellerForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    type: 'home_chef',
    address: '',
    fssaiLicense: '',
    gstNumber: '',
    panNumber: '',
    bankAccount: '',
    ifscCode: '',
    accountHolder: '',
    bankName: '',
    commissionRate: 15,
  });

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

  const createSellerMutation = useMutation({
    mutationFn: () => adminAPI.createSeller(newSellerForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
      toast({ title: 'Seller created successfully' });
      setShowAddSeller(false);
      setNewSellerForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        businessName: '',
        type: 'home_chef',
        address: '',
        fssaiLicense: '',
        gstNumber: '',
        panNumber: '',
        bankAccount: '',
        ifscCode: '',
        accountHolder: '',
        bankName: '',
        commissionRate: 15,
      });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to create seller', description: err.message, variant: 'destructive' });
    },
  });

  const deleteSellerMutation = useMutation({
    mutationFn: (id: string) => adminAPI.deleteSeller(id),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['admin-sellers'] }); 
      toast({ title: 'Seller deleted successfully' }); 
    },
    onError: (err: any) => {
      toast({ title: 'Failed to delete seller', description: err.message, variant: 'destructive' });
    },
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
        <Button variant="gradient" className="gap-2" onClick={() => setShowAddSeller(true)}><Plus size={18} /> Add Seller</Button>
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this seller? This action cannot be undone.')) {
                          deleteSellerMutation.mutate(seller._id);
                        }
                      }}
                      disabled={deleteSellerMutation.isPending}
                    >
                      <Trash2 size={14} /> Delete
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

      {/* ═══ ADD SELLER DIALOG ═══ */}
      <Dialog open={showAddSeller} onOpenChange={setShowAddSeller}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Store size={24} className="text-primary" />
              Add New Seller
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createSellerMutation.mutate();
            }}
            className="space-y-4"
          >
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newSellerForm.name}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={newSellerForm.businessName}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, businessName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newSellerForm.email}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={newSellerForm.phone}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newSellerForm.password}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, password: e.target.value })}
                  placeholder="Leave blank for default: Seller@123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Business Type *</Label>
                <select
                  id="type"
                  value={newSellerForm.type}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, type: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  required
                >
                  <option value="home_chef">Home Chef</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="cloud_kitchen">Cloud Kitchen</option>
                  <option value="catering">Catering</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Input
                id="address"
                value={newSellerForm.address}
                onChange={(e) => setNewSellerForm({ ...newSellerForm, address: e.target.value })}
                required
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Business Details</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fssaiLicense">FSSAI License</Label>
                <Input
                  id="fssaiLicense"
                  value={newSellerForm.fssaiLicense}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, fssaiLicense: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={newSellerForm.gstNumber}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, gstNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input
                  id="panNumber"
                  value={newSellerForm.panNumber}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, panNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Bank Details</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Account Number</Label>
                <Input
                  id="bankAccount"
                  value={newSellerForm.bankAccount}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, bankAccount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={newSellerForm.ifscCode}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, ifscCode: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountHolder">Account Holder Name</Label>
                <Input
                  id="accountHolder"
                  value={newSellerForm.accountHolder}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, accountHolder: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={newSellerForm.bankName}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, bankName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                min={0}
                max={50}
                value={newSellerForm.commissionRate}
                onChange={(e) => setNewSellerForm({ ...newSellerForm, commissionRate: parseInt(e.target.value) || 15 })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddSeller(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                className="flex-1"
                disabled={createSellerMutation.isPending}
              >
                {createSellerMutation.isPending ? 'Creating...' : 'Create Seller'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}