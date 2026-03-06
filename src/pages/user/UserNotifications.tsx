import { UserLayout } from '@/layouts/UserLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, apiRequest } from '@/lib/api';
import { Bell, ArrowLeft, CheckCircle2, Package, Wallet, Gift, Trash2, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const iconMap: Record<string, any> = {
  order: Package,
  settlement: Wallet,
  referral: Gift,
  default: Bell,
};

export default function UserNotifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['user-notifications'],
    queryFn: async () => {
      const res: any = await userAPI.getNotifications();
      return res?.notifications || res?.data || res || [];
    },
  });

  const notifications = Array.isArray(data) ? data : [];

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/user/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () =>
      apiRequest('/user/notifications/mark-all-read', { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
      toast({ title: 'All notifications marked as read' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/user/notifications/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
      toast({ title: 'Notification deleted' });
    },
  });

  const unreadCount = notifications.filter((n: any) => !n?.isRead).length;

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
              <p className="text-muted-foreground">{unreadCount} unread</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="gap-1" onClick={() => markAllReadMutation.mutate()} disabled={markAllReadMutation.isPending}>
              <CheckCheck size={16} /> Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n: any) => {
              const Icon = iconMap[n?.type] || iconMap.default;
              return (
                <Card key={n?._id} className={n?.isRead ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${n?.isRead ? 'bg-muted' : 'bg-primary/10'}`}>
                        <Icon size={20} className={n?.isRead ? 'text-muted-foreground' : 'text-primary'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{n?.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {n?.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!n?.isRead && (
                          <Button variant="ghost" size="sm" onClick={() => markReadMutation.mutate(n?._id)} disabled={markReadMutation.isPending}>
                            <CheckCircle2 size={16} />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(n?._id)} disabled={deleteMutation.isPending}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </UserLayout>
  );
}