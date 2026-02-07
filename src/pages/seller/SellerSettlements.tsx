import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/Badge';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Receipt, CheckCircle2, Clock, DollarSign } from 'lucide-react';

export default function SellerSettlements() {
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: settlements, isLoading } = useQuery({
    queryKey: ['seller-settlements', statusFilter],
    queryFn: () => sellerAPI.getSettlements(statusFilter === 'all' ? undefined : statusFilter),
  });

  return (
    <SellerLayout title="Settlements" subtitle="Track your payment settlements">
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
        <TabsList className="bg-secondary p-1">
          <TabsTrigger value="all" className="data-[state=active]:bg-card">All</TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-card">Pending</TabsTrigger>
          <TabsTrigger value="settled" className="data-[state=active]:bg-card">Settled</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {(settlements || []).map((s: any) => (
            <Card key={s._id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.status === 'settled' ? 'bg-success/10' : 'bg-warning/10'}`}>
                      {s.status === 'settled' ? <CheckCircle2 size={24} className="text-success" /> : <Clock size={24} className="text-warning" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Order #{s.orderId}</p>
                      <p className="text-sm text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm text-muted-foreground">Order: ₹{s.orderAmount}</span>
                      <span className="text-sm text-destructive">Commission: ₹{s.commission}</span>
                      <span className="text-sm text-muted-foreground">GST: ₹{s.gst}</span>
                    </div>
                    <p className="text-xl font-bold text-success">Net: ₹{s.netAmount}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                {s.settlementDate && (
                  <p className="text-xs text-muted-foreground mt-2">Settled on: {new Date(s.settlementDate).toLocaleDateString()}</p>
                )}
              </CardContent>
            </Card>
          ))}
          {(!settlements || settlements.length === 0) && (
            <div className="text-center py-12"><p className="text-muted-foreground">No settlements found</p></div>
          )}
        </div>
      )}
    </SellerLayout>
  );
}
