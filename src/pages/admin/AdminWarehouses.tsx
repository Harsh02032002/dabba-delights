import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Warehouse, Plus, MapPin, Users, Package, ToggleLeft, ToggleRight, Pencil, Trash2, Eye, Clock, Building2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function AdminWarehouses() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [viewWarehouse, setViewWarehouse] = useState<any>(null);
  const [filterCity, setFilterCity] = useState('');
  const [filterType, setFilterType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-warehouses', filterCity, filterType],
    queryFn: () => adminAPI.getWarehouses({ city: filterCity || undefined, type: filterType || undefined }),
  });

  const warehouses = data?.warehouses || [];

  const [form, setForm] = useState({
    name: '', type: 'dark_store', address: { street: '', city: '', state: '', pincode: '', location: { coordinates: [0, 0] } },
    manager: { name: '', phone: '', email: '' }, capacity: 100, deliveryRadius: 10,
    operatingHours: { open: '06:00', close: '23:00' }, zone: '',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminAPI.createWarehouse(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-warehouses'] }); setShowCreate(false); toast.success('Warehouse created'); },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminAPI.toggleWarehouseStatus(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-warehouses'] }); toast.success('Status updated'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminAPI.deleteWarehouse(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-warehouses'] }); toast.success('Warehouse deleted'); },
  });

  const handleCreate = () => createMutation.mutate(form);

  return (
    <AdminLayout title="Warehouse Management" subtitle="Manage dark stores, warehouses and hubs">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 className="text-primary" size={20} /></div>
          <div><p className="text-2xl font-bold">{warehouses.length}</p><p className="text-xs text-muted-foreground">Total Warehouses</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><ToggleRight className="text-success" size={20} /></div>
          <div><p className="text-2xl font-bold">{warehouses.filter((w: any) => w.isActive).length}</p><p className="text-xs text-muted-foreground">Active</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center"><Users className="text-info" size={20} /></div>
          <div><p className="text-2xl font-bold">{warehouses.reduce((a: number, w: any) => a + (w.assignedPartners?.length || 0), 0)}</p><p className="text-xs text-muted-foreground">Assigned Partners</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center"><Package className="text-warning" size={20} /></div>
          <div><p className="text-2xl font-bold">{warehouses.reduce((a: number, w: any) => a + (w.mappedSellers?.length || 0), 0)}</p><p className="text-xs text-muted-foreground">Mapped Sellers</p></div>
        </CardContent></Card>
      </div>

      {/* Filters & Create */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input placeholder="Filter by city..." value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="w-48" />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="dark_store">Dark Store</SelectItem>
            <SelectItem value="warehouse">Warehouse</SelectItem>
            <SelectItem value="hub">Hub</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="gap-2"><Plus size={16} /> Add Warehouse</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create New Warehouse</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mumbai Central Hub" /></div>
              <div><Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark_store">Dark Store</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="hub">Hub</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>City</Label><Input value={form.address.city} onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} /></div>
                <div><Label>State</Label><Input value={form.address.state} onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} /></div>
              </div>
              <div><Label>Street Address</Label><Input value={form.address.street} onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })} /></div>
              <div><Label>Pincode</Label><Input value={form.address.pincode} onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} /></div>
                <div><Label>Delivery Radius (km)</Label><Input type="number" value={form.deliveryRadius} onChange={(e) => setForm({ ...form, deliveryRadius: +e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Open Time</Label><Input value={form.operatingHours.open} onChange={(e) => setForm({ ...form, operatingHours: { ...form.operatingHours, open: e.target.value } })} /></div>
                <div><Label>Close Time</Label><Input value={form.operatingHours.close} onChange={(e) => setForm({ ...form, operatingHours: { ...form.operatingHours, close: e.target.value } })} /></div>
              </div>
              <div><Label>Manager Name</Label><Input value={form.manager.name} onChange={(e) => setForm({ ...form, manager: { ...form.manager, name: e.target.value } })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Manager Phone</Label><Input value={form.manager.phone} onChange={(e) => setForm({ ...form, manager: { ...form.manager, phone: e.target.value } })} /></div>
                <div><Label>Manager Email</Label><Input value={form.manager.email} onChange={(e) => setForm({ ...form, manager: { ...form.manager, email: e.target.value } })} /></div>
              </div>
              <div><Label>Zone</Label><Input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="e.g. South Mumbai" /></div>
              <Button variant="gradient" className="w-full" onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Warehouse'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      {isLoading ? <LoadingSpinner /> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Sellers</TableHead>
                <TableHead>Partners</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map((wh: any) => (
                <TableRow key={wh._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{wh.name}</p>
                      <p className="text-xs text-muted-foreground">{wh.code}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{wh.type?.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>{wh.address?.city || '—'}</TableCell>
                  <TableCell>{wh.currentLoad || 0}/{wh.capacity}</TableCell>
                  <TableCell>{wh.mappedSellers?.length || 0}</TableCell>
                  <TableCell>{wh.assignedPartners?.length || 0}</TableCell>
                  <TableCell>
                    <Badge variant={wh.isActive ? 'default' : 'secondary'}>
                      {wh.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon-sm" variant="ghost" onClick={() => setViewWarehouse(wh)}><Eye size={14} /></Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => toggleMutation.mutate(wh._id)}>
                        {wh.isActive ? <ToggleRight size={14} className="text-success" /> : <ToggleLeft size={14} />}
                      </Button>
                      <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(wh._id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {warehouses.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No warehouses found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* View Dialog */}
      <Dialog open={!!viewWarehouse} onOpenChange={() => setViewWarehouse(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewWarehouse?.name}</DialogTitle></DialogHeader>
          {viewWarehouse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Code</p><p className="font-medium">{viewWarehouse.code}</p></div>
                <div><p className="text-xs text-muted-foreground">Type</p><Badge variant="outline" className="capitalize">{viewWarehouse.type?.replace('_', ' ')}</Badge></div>
                <div><p className="text-xs text-muted-foreground">Status</p><Badge variant={viewWarehouse.isActive ? 'default' : 'secondary'}>{viewWarehouse.isActive ? 'Active' : 'Inactive'}</Badge></div>
                <div><p className="text-xs text-muted-foreground">Zone</p><p className="font-medium">{viewWarehouse.zone || '—'}</p></div>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm font-semibold mb-2 flex items-center gap-2"><MapPin size={14} /> Address</p>
                <p className="text-sm">{viewWarehouse.address?.street}, {viewWarehouse.address?.city}, {viewWarehouse.address?.state} - {viewWarehouse.address?.pincode}</p>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm font-semibold mb-2">Manager</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div><p className="text-xs text-muted-foreground">Name</p><p>{viewWarehouse.manager?.name || '—'}</p></div>
                  <div><p className="text-xs text-muted-foreground">Phone</p><p>{viewWarehouse.manager?.phone || '—'}</p></div>
                  <div><p className="text-xs text-muted-foreground">Email</p><p>{viewWarehouse.manager?.email || '—'}</p></div>
                </div>
              </div>
              <div className="border-t pt-3 grid grid-cols-3 gap-3">
                <div><p className="text-xs text-muted-foreground">Capacity</p><p className="font-bold">{viewWarehouse.currentLoad}/{viewWarehouse.capacity}</p></div>
                <div><p className="text-xs text-muted-foreground">Delivery Radius</p><p className="font-bold">{viewWarehouse.deliveryRadius} km</p></div>
                <div><p className="text-xs text-muted-foreground">Hours</p><p className="font-bold">{viewWarehouse.operatingHours?.open} - {viewWarehouse.operatingHours?.close}</p></div>
              </div>
              {viewWarehouse.mappedSellers?.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-sm font-semibold mb-2">Mapped Sellers ({viewWarehouse.mappedSellers.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {viewWarehouse.mappedSellers.map((s: any) => (
                      <Badge key={s._id || s} variant="outline">{s.businessName || s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
