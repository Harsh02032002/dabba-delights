import { useState } from 'react';
import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Users, Gift, Search } from 'lucide-react';
import { safeArray } from '@/utils/safeArray';

export default function SellerCustomers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [pointsInput, setPointsInput] = useState<Record<string, string>>({});

  const { data: customersRaw, isLoading } = useQuery({
    queryKey: ['seller-customers'],
    queryFn: () => sellerAPI.getCustomers(),
  });
  const customers = safeArray(customersRaw);

  const awardMutation = useMutation({
    mutationFn: ({ userId, points }: { userId: string; points: number }) => sellerAPI.awardLoyaltyPoints(userId, points),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-customers'] });
      toast({ title: 'Points awarded!' });
    },
  });

  const filtered = customers.filter((c: any) => c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <SellerLayout title="Customers" subtitle="View your customers and award loyalty points">
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {filtered.map((customer: any) => (
            <Card key={customer._id}>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                    {customer.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{customer.name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>{customer.orderCount || 0} orders</span>
                      <span>Spent: ₹{customer.totalSpent?.toLocaleString() || 0}</span>
                      {customer.loyaltyPoints > 0 && <span className="text-primary">Points: {customer.loyaltyPoints}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Points"
                      value={pointsInput[customer._id] || ''}
                      onChange={(e) => setPointsInput(prev => ({ ...prev, [customer._id]: e.target.value }))}
                      className="w-20"
                    />
                    <Button
                      size="sm"
                      variant="gradient"
                      className="gap-1"
                      disabled={!pointsInput[customer._id] || awardMutation.isPending}
                      onClick={() => {
                        awardMutation.mutate({ userId: customer._id, points: Number(pointsInput[customer._id]) });
                        setPointsInput(prev => ({ ...prev, [customer._id]: '' }));
                      }}
                    >
                      <Gift size={14} /> Award
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <div className="text-center py-12"><p className="text-muted-foreground">No customers found</p></div>}
        </div>
      )}
    </SellerLayout>
  );
}
