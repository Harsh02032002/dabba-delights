import { UserLayout } from '@/layouts/UserLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, apiRequest } from '@/lib/api';
import { Bell, ArrowLeft, CheckCircle2, Package, Wallet, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const iconMap: Record<string, any> = {
  order: Package,
  wallet: Wallet,
  promo: Gift,
  default: Bell,
};

export default function UserNotifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['user-notifications'],
    queryFn: () => userAPI.getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/user/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-notifications'] }),
  });

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft size={20} /></Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">{notifications.filter((n: any) => !n.isRead).length} unread</p>
          </div>
        </div>

        {isLoading ? <LoadingSpinner /> : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n: any) => {
              const Icon = iconMap[n.type] || iconMap.default;
              return (
                <Card key={n._id} className={n.isRead ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${n.isRead ? 'bg-muted' : 'bg-primary/10'}`}>
                        <Icon size={20} className={n.isRead ? 'text-muted-foreground' : 'text-primary'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{n.title || n.message}</p>
                        {n.body && <p className="text-sm text-muted-foreground mt-1">{n.body}</p>}
                        <p className="text-xs text-muted-foreground mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                      {!n.isRead && (
                        <Button variant="ghost" size="sm" onClick={() => markReadMutation.mutate(n._id)}>
                          <CheckCircle2 size={16} />
                        </Button>
                      )}
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
