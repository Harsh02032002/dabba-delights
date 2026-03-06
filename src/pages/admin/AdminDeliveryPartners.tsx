import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Users, Bike, CheckCircle2, Clock, XCircle, Eye, MapPin, Star, Wallet, ShieldCheck, ShieldX, Truck, Phone, Mail, CreditCard, FileText, CircleDot } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminDeliveryPartners() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('all');
  const [viewPartner, setViewPartner] = useState<any>(null);
  const [searchCity, setSearchCity] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-delivery-partners', tab, searchCity],
    queryFn: () => {
      const params: Record<string, unknown> = {};
      if (tab === 'pending') params.status = 'pending';
      if (tab === 'active') params.status = 'active';
      if (tab === 'online') params.online = 'true';
      if (searchCity) params.city = searchCity;
      return adminAPI.getDeliveryPartners(params);
    },
  });

  const { data: dashData } = useQuery({
    queryKey: ['admin-delivery-dashboard'],
    queryFn: () => adminAPI.getDeliveryDashboard(),
  });

  const partners = data?.partners || [];

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminAPI.approveDeliveryPartner(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-delivery-partners'] }); queryClient.invalidateQueries({ queryKey: ['admin-delivery-dashboard'] }); toast.success('Partner approved'); },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminAPI.rejectDeliveryPartner(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-delivery-partners'] }); toast.success('Partner rejected'); },
  });

  const kycStatusBadge = (status: string) => {
    const map: Record<string, { variant: any; label: string }> = {
      verified: { variant: 'default', label: 'Verified' },
      submitted: { variant: 'secondary', label: 'Submitted' },
      pending: { variant: 'outline', label: 'Pending' },
      rejected: { variant: 'destructive', label: 'Rejected' },
    };
    const cfg = map[status] || map.pending;
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  const docStatusIcon = (status: string) => {
    if (status === 'verified') return <CheckCircle2 size={14} className="text-success" />;
    if (status === 'uploaded') return <Clock size={14} className="text-warning" />;
    if (status === 'rejected') return <XCircle size={14} className="text-destructive" />;
    return <CircleDot size={14} className="text-muted-foreground" />;
  };

  return (
    <AdminLayout title="Delivery Partners" subtitle="Manage delivery partner fleet & KYC approvals">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="text-primary" size={20} /></div>
          <div><p className="text-2xl font-bold">{dashData?.totalPartners || 0}</p><p className="text-xs text-muted-foreground">Total Partners</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><CircleDot className="text-success" size={20} /></div>
          <div><p className="text-2xl font-bold">{dashData?.onlinePartners || 0}</p><p className="text-xs text-muted-foreground">Online Now</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center"><ShieldCheck className="text-info" size={20} /></div>
          <div><p className="text-2xl font-bold">{dashData?.verifiedPartners || 0}</p><p className="text-xs text-muted-foreground">Verified</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center"><Clock className="text-warning" size={20} /></div>
          <div><p className="text-2xl font-bold">{dashData?.pendingKYC || 0}</p><p className="text-xs text-muted-foreground">Pending KYC</p></div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input placeholder="Search by city..." value={searchCity} onChange={(e) => setSearchCity(e.target.value)} className="w-48" />
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending KYC</TabsTrigger>
            <TabsTrigger value="online">Online</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      {isLoading ? <LoadingSpinner /> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Deliveries</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((p: any) => (
                <TableRow key={p._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Bike size={14} />
                      <span className="text-sm capitalize">{p.vehicleType}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.vehicleNumber || '—'}</p>
                  </TableCell>
                  <TableCell>{p.city || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={p.isOnline ? 'default' : 'outline'}>
                      {p.isOnline ? '🟢 Online' : '⚪ Offline'}
                    </Badge>
                  </TableCell>
                  <TableCell>{kycStatusBadge(p.kycStatus)}</TableCell>
                  <TableCell className="font-medium">{p.totalDeliveries || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-warning fill-warning" />
                      <span>{p.rating?.toFixed(1) || '5.0'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">₹{p.earnings || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon-sm" variant="ghost" onClick={() => setViewPartner(p)}><Eye size={14} /></Button>
                      {(p.kycStatus === 'submitted' || p.kycStatus === 'pending') && (
                        <>
                          <Button size="icon-sm" variant="ghost" className="text-success" onClick={() => approveMutation.mutate(p._id)}><ShieldCheck size={14} /></Button>
                          <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => rejectMutation.mutate(p._id)}><ShieldX size={14} /></Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {partners.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No delivery partners found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* View Partner Dialog */}
      <Dialog open={!!viewPartner} onOpenChange={() => setViewPartner(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Delivery Partner Details</DialogTitle></DialogHeader>
          {viewPartner && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{viewPartner.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Phone size={12} />{viewPartner.phone}</span>
                    {viewPartner.email && <span className="flex items-center gap-1"><Mail size={12} />{viewPartner.email}</span>}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{viewPartner.totalDeliveries || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Deliveries</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{viewPartner.rating?.toFixed(1) || '5.0'}</p>
                  <p className="text-[10px] text-muted-foreground">Rating</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">₹{viewPartner.earnings || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Total Earned</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold capitalize">{viewPartner.shiftStatus?.replace('_', ' ') || 'Off'}</p>
                  <p className="text-[10px] text-muted-foreground">Shift</p>
                </div>
              </div>

              {/* Vehicle */}
              <div className="border-t pt-3">
                <p className="text-sm font-semibold mb-2 flex items-center gap-2"><Bike size={14} /> Vehicle Info</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div><p className="text-xs text-muted-foreground">Type</p><p className="capitalize">{viewPartner.vehicleType}</p></div>
                  <div><p className="text-xs text-muted-foreground">Number</p><p>{viewPartner.vehicleNumber || '—'}</p></div>
                  <div><p className="text-xs text-muted-foreground">License</p><p>{viewPartner.licenseNumber || '—'}</p></div>
                </div>
              </div>

              {/* KYC Documents */}
              <div className="border-t pt-3">
                <p className="text-sm font-semibold mb-2 flex items-center gap-2"><FileText size={14} /> KYC Documents</p>
                <div className="grid grid-cols-2 gap-3">
                  {['aadhaar', 'pan', 'drivingLicense', 'vehicleRC'].map((doc) => {
                    const d = viewPartner.kycDocuments?.[doc];
                    const status = typeof d === 'object' ? d?.status : (d ? 'uploaded' : 'pending');
                    const url = typeof d === 'object' ? d?.url : d;
                    return (
                      <div key={doc} className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex items-center gap-2">
                          {docStatusIcon(status)}
                          <span className="text-sm capitalize">{doc.replace(/([A-Z])/g, ' $1')}</span>
                        </div>
                        {url && (
                          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => window.open(url.startsWith('http') ? url : `${API_BASE_URL.replace('/api', '')}${url}`, '_blank')}>
                            View
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bank Details */}
              {viewPartner.bankDetails && (
                <div className="border-t pt-3">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2"><CreditCard size={14} /> Bank Details</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">Account Holder</p><p>{viewPartner.bankDetails.accountHolder || '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Bank</p><p>{viewPartner.bankDetails.bankName || '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Account No.</p><p>{viewPartner.bankDetails.accountNumber || '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">IFSC</p><p>{viewPartner.bankDetails.ifscCode || '—'}</p></div>
                  </div>
                </div>
              )}

              {/* Warehouse */}
              {viewPartner.assignedWarehouseId && (
                <div className="border-t pt-3">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2"><MapPin size={14} /> Assigned Warehouse</p>
                  <p className="text-sm">{viewPartner.assignedWarehouseId.name || viewPartner.assignedWarehouseId.code || viewPartner.assignedWarehouseId}</p>
                </div>
              )}

              {/* Actions */}
              {(viewPartner.kycStatus === 'submitted' || viewPartner.kycStatus === 'pending') && (
                <div className="border-t pt-3 flex gap-3">
                  <Button variant="gradient" className="flex-1 gap-2" onClick={() => { approveMutation.mutate(viewPartner._id); setViewPartner(null); }}>
                    <ShieldCheck size={16} /> Approve KYC
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 text-destructive" onClick={() => { rejectMutation.mutate(viewPartner._id); setViewPartner(null); }}>
                    <ShieldX size={16} /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
