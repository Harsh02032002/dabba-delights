import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { Search, FileText } from 'lucide-react';

export default function AdminAuditLogs() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', search],
    queryFn: () => adminAPI.getAuditLogs({ search: search || undefined }),
  });

  const logs = data?.logs || data || [];

  return (
    <AdminLayout title="Audit Logs" subtitle="Track all admin actions on the platform">
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Search by admin, action..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Admin</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Action</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Details</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Timestamp</th>
                </tr></thead>
                <tbody>
                  {logs.map((log: any) => (
                    <tr key={log._id} className="border-b border-border/50">
                      <td className="p-4 font-medium text-foreground">{log.adminName || log.adminId}</td>
                      <td className="p-4"><span className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">{log.action}</span></td>
                      <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">{log.details || '-'}</td>
                      <td className="p-4 text-sm text-muted-foreground">{new Date(log.timestamp || log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {logs.length === 0 && <p className="text-muted-foreground text-center py-12">No audit logs</p>}
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
}
