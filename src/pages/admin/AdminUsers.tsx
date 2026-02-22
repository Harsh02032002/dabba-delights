import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { Search, Filter, Users, Ban, CheckCircle2, Mail, Phone, Calendar } from 'lucide-react';
import { safeArray } from '@/utils/safeArray';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  return (
    <AdminLayout title="User Management" subtitle="Manage customers on the platform">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold text-foreground">{data?.total || 0}</p>
        </div>
        <div className="bg-success/10 rounded-xl p-4">
          <p className="text-sm text-success">Active</p>
          <p className="text-2xl font-bold text-success">{safeArray(data?.users || data).filter((u: any) => !u.isBlocked).length}</p>
        </div>
        <div className="bg-destructive/10 rounded-xl p-4">
          <p className="text-sm text-destructive">Blocked</p>
          <p className="text-2xl font-bold text-destructive">{safeArray(data?.users || data).filter((u: any) => u.isBlocked).length}</p>
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
          {safeArray(data?.users || data).map((user: any) => (
            <Card key={user._id}>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                    {user.name?.charAt(0)}
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
                  <div>
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
          {safeArray(data?.users || data).length === 0 && (
            <div className="text-center py-12"><p className="text-muted-foreground">No users found</p></div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
