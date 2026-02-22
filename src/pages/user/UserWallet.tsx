import { useState } from 'react';
import { UserLayout } from '@/layouts/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, apiRequest } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Wallet, Plus, ArrowLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserWallet() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [topupAmount, setTopupAmount] = useState('');

  // ✅ Wallet Balance
  const { data: walletData, isLoading } = useQuery({
    queryKey: ['user-wallet'],
    queryFn: async () => {
      const res = await apiRequest('/user/wallet/balance');
      return res?.data || res || {};
    },
    placeholderData: (prev) => prev,
  });

  // ✅ Transaction History
  const { data: historyData } = useQuery({
    queryKey: ['user-wallet-history'],
    queryFn: async () => {
      const res = await apiRequest('/user/wallet/history');
      return res?.data || res || [];
    },
    placeholderData: (prev) => prev,
  });

  const wallet = walletData || {};
  const history = Array.isArray(historyData) ? historyData : [];

  const topupMutation = useMutation({
    mutationFn: (amount: number) => userAPI.topupWallet(amount),
    onSuccess: () => {
      toast({
        title: 'Top-up initiated',
        description: 'Complete payment to add funds.',
      });

      queryClient.invalidateQueries({ queryKey: ['user-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['user-wallet-history'] });

      setTopupAmount('');
    },
    onError: (err: any) =>
      toast({
        title: 'Error',
        description: err?.message || 'Something went wrong',
        variant: 'destructive',
      }),
  });

  const quickAmounts = [100, 200, 500, 1000, 2000];

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-display font-bold text-foreground">
            My Wallet
          </h1>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Balance Card */}
            <Card className="mb-8 overflow-hidden">
              <div className="gradient-primary p-8 text-center">
                <Wallet
                  size={40}
                  className="mx-auto text-primary-foreground mb-3"
                />
                <p className="text-primary-foreground/80 text-sm mb-1">
                  Available Balance
                </p>
                <p className="text-4xl font-bold text-primary-foreground">
                  ₹{Number(wallet?.balance || 0).toLocaleString()}
                </p>
              </div>
            </Card>

            {/* Top Up */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  Add Money
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {quickAmounts.map((amt) => (
                    <Button
                      key={amt}
                      variant={
                        topupAmount === String(amt)
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        setTopupAmount(String(amt))
                      }
                    >
                      ₹{amt}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <Label>Custom Amount</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={topupAmount}
                      onChange={(e) =>
                        setTopupAmount(e.target.value)
                      }
                    />
                  </div>

                  <Button
                    variant="gradient"
                    className="self-end gap-2"
                    disabled={
                      !topupAmount ||
                      Number(topupAmount) <= 0 ||
                      topupMutation.isPending
                    }
                    onClick={() =>
                      topupMutation.mutate(
                        Number(topupAmount)
                      )
                    }
                  >
                    <Plus size={18} />
                    {topupMutation.isPending
                      ? 'Processing...'
                      : 'Add Money'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((txn: any) => (
                    <div
                      key={txn?._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            txn?.type === 'credit'
                              ? 'bg-success/10'
                              : 'bg-destructive/10'
                          }`}
                        >
                          {txn?.type === 'credit' ? (
                            <ArrowDownRight
                              size={20}
                              className="text-success"
                            />
                          ) : (
                            <ArrowUpRight
                              size={20}
                              className="text-destructive"
                            />
                          )}
                        </div>

                        <div>
                          <p className="font-medium text-foreground">
                            {txn?.description || 'Transaction'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {txn?.createdAt
                              ? new Date(
                                  txn.createdAt
                                ).toLocaleString()
                              : ''}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`font-bold ${
                          txn?.type === 'credit'
                            ? 'text-success'
                            : 'text-destructive'
                        }`}
                      >
                        {txn?.type === 'credit'
                          ? '+'
                          : '-'}
                        ₹{txn?.amount || 0}
                      </span>
                    </div>
                  ))}

                  {history.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No transactions yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </UserLayout>
  );
}