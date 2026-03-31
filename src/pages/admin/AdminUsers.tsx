import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { Search, Eye, Users, Ban, CheckCircle2, Mail, Phone, Calendar, Wallet, ShoppingBag, MapPin, Trash2 } from 'lucide-react';
import { safeArray } from '@/utils/safeArray';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewUser, setViewUser] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, statusFilter],
    queryFn: () => adminAPI.getUsers({ search, status: statusFilter === 'all' ? undefined : statusFilter }),
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => adminAPI.blockUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast({ title: 'User blocked' }); },
  });

  const unblockMutation = useMutation({
    mutationFn: (id: string) => adminAPI.unblockUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast({ title: 'User unblocked' }); },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminAPI.deleteUser(id),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['admin-users'] }); 
      toast({ title: 'User deleted successfully' }); 
    },
    onError: (err: any) => {
      toast({ title: 'Failed to delete user', description: err.message, variant: 'destructive' });
    },
  });

  const users = safeArray(data?.users || data);

  return (
    <AdminLayout title="User Management" subtitle="Manage customers on the platform">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold text-foreground">{data?.total || users.length}</p>
        </div>
        <div className="bg-success/10 rounded-xl p-4">
          <p className="text-sm text-success">Active</p>
          <p className="text-2xl font-bold text-success">{users.filter((u: any) => !u.isBlocked).length}</p>
        </div>
        <div className="bg-destructive/10 rounded-xl p-4">
          <p className="text-sm text-destructive">Blocked</p>
          <p className="text-2xl font-bold text-destructive">{users.filter((u: any) => u.isBlocked).length}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Search users by name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-secondary p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-card">All</TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-card">Active</TabsTrigger>
            <TabsTrigger value="blocked" className="data-[state=active]:bg-card">Blocked</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {users.map((user: any) => (
            <Card key={user._id}>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                    {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : user.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-foreground">{user.name}</h3>
                      {user.isBlocked && <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">Blocked</span>}
                      {user.isVerified && <CheckCircle2 size={16} className="text-success" />}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail size={14} />{user.email}</span>
                      <span className="flex items-center gap-1"><Phone size={14} />{user.phone}</span>
                      <span className="flex items-center gap-1"><Calendar size={14} />Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Wallet</p>
                    <p className="font-bold text-foreground">₹{user.wallet || 0}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setViewUser(user)}>
                      <Eye size={14} /> View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                          deleteUserMutation.mutate(user._id);
                        }
                      }}
                      disabled={deleteUserMutation.isPending}
                    >
                      <Trash2 size={14} /> Delete
                    </Button>
                    {user.isBlocked ? (
                      <Button variant="soft-success" size="sm" onClick={() => unblockMutation.mutate(user._id)}>Unblock</Button>
                    ) : (
                      <Button variant="soft-destructive" size="sm" onClick={() => blockMutation.mutate(user._id)}>Block</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {users.length === 0 && (
            <div className="text-center py-12"><p className="text-muted-foreground">No users found</p></div>
          )}
        </div>
      )}

      {/* ═══ VIEW USER DIALOG ═══ */}
      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                {viewUser?.avatar ? <img src={viewUser.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : viewUser?.name?.charAt(0)}
              </div>
              {viewUser?.name}
            </DialogTitle>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-5">
              {/* Status badges */}
              <div className="flex items-center gap-2">
                {viewUser.isBlocked ? (
                  <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">Blocked</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">Active</span>
                )}
                {viewUser.isVerified && <span className="px-2 py-0.5 rounded-full bg-info/10 text-info text-xs font-medium">Verified</span>}
                <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs font-medium capitalize">{viewUser.role}</span>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-muted-foreground" />
                  <span className="text-foreground">{viewUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-muted-foreground" />
                  <span className="text-foreground">{viewUser.phone || 'Not provided'}</span>
                </div>
                {viewUser.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin size={16} className="text-muted-foreground" />
                    <span className="text-foreground">{viewUser.address}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <Wallet size={20} className="mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold text-foreground">₹{viewUser.wallet || 0}</p>
                  <p className="text-xs text-muted-foreground">Wallet</p>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <ShoppingBag size={20} className="mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold text-foreground">{viewUser.totalOrders || 0}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <Users size={20} className="mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold text-foreground">{viewUser.loyaltyPoints || 0}</p>
                  <p className="text-xs text-muted-foreground">Loyalty Pts</p>
                </div>
              </div>

              {/* Referral */}
              {viewUser.referralCode && (
                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Referral Code</p>
                  <p className="font-bold text-primary tracking-widest">{viewUser.referralCode}</p>
                  {viewUser.referredBy && <p className="text-xs text-muted-foreground mt-1">Referred by: {viewUser.referredBy}</p>}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {viewUser.isBlocked ? (
                  <Button variant="soft-success" className="flex-1 gap-2" onClick={() => { unblockMutation.mutate(viewUser._id); setViewUser(null); }}>
                    <CheckCircle2 size={18} /> Unblock User
                  </Button>
                ) : (
                  <Button variant="soft-destructive" className="flex-1 gap-2" onClick={() => { blockMutation.mutate(viewUser._id); setViewUser(null); }}>
                    <Ban size={18} /> Block User
                  </Button>
                )}
              </div>

              {/* Joined */}
              <p className="text-xs text-muted-foreground text-center">
                Joined {new Date(viewUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}