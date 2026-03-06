import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { RatingStars } from '@/components/shared/RatingStars';
import { TrendingUp, Award, Star, ShoppingBag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminPerformance() {
  const { data: sellers, isLoading } = useQuery({
    queryKey: ['admin-seller-performance'],
    queryFn: () => adminAPI.getSellerPerformance(),
  });

  const { data: overview } = useQuery({
    queryKey: ['admin-performance-overview'],
    queryFn: () => adminAPI.getPerformanceOverview(),
  });

  const sellerList = (sellers as any)?.sellers || sellers || [];

  return (
    <AdminLayout title="Performance" subtitle="Seller performance metrics and comparisons">
      {/* Overview Stats */}
      <div className="grid sm:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card">
          <CardContent className="p-0">
            <p className="text-sm text-muted-foreground mb-1">Avg Rating</p>
            <p className="text-3xl font-bold text-foreground">{overview?.avgRating || '0'}</p>
            <Star size={20} className="text-warning mt-2" />
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-0">
            <p className="text-sm text-muted-foreground mb-1">Avg Delivery Time</p>
            <p className="text-3xl font-bold text-foreground">{overview?.avgDeliveryTime || '0'} min</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-0">
            <p className="text-sm text-muted-foreground mb-1">Order Completion</p>
            <p className="text-3xl font-bold text-success">{overview?.completionRate || '0'}%</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-0">
            <p className="text-sm text-muted-foreground mb-1">Cancellation Rate</p>
            <p className="text-3xl font-bold text-destructive">{overview?.cancellationRate || '0'}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Seller Performance Chart */}
      {sellerList.length > 0 && (
        <Card className="mb-8">
          <CardHeader><CardTitle className="font-display text-lg">Seller Revenue Comparison</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sellerList.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(30, 20%, 90%)" />
                  <XAxis dataKey="businessName" axisLine={false} tickLine={false} angle={-15} textAnchor="end" height={60} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="hsl(16, 85%, 55%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seller Rankings */}
      {isLoading ? <LoadingSpinner /> : (
        <Card>
          <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Award size={20} /> Seller Rankings</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sellerList.map((seller: any, index: number) => (
                <div key={seller._id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-warning/20 text-warning' :
                    index === 1 ? 'bg-muted text-muted-foreground' :
                    index === 2 ? 'bg-primary/10 text-primary' :
                    'bg-secondary text-secondary-foreground'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{seller.businessName}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{seller.totalOrders} orders</span>
                      <RatingStars rating={seller.rating} size="sm" />
                      <span>{seller.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">₹{seller.revenue?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{seller.type}</p>
                  </div>
                </div>
              ))}
              {sellerList.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No performance data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
}
