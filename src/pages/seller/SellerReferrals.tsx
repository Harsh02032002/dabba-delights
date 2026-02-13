import { useState } from 'react';
import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Gift, Copy, Share2, Users, DollarSign } from 'lucide-react';

export default function SellerReferrals() {
  const queryClient = useQueryClient();

  const { data: referrals, isLoading } = useQuery({
    queryKey: ['seller-referrals'],
    queryFn: () => sellerAPI.getReferrals(),
  });

  const generateMutation = useMutation({
    mutationFn: () => sellerAPI.generateReferralCode(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-referrals'] });
      toast({ title: 'Referral code generated!' });
    },
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied!', description: 'Referral code copied to clipboard' });
  };

  const referralCode = referrals?.referralCode || '';
  const referredUsers = referrals?.referredUsers || [];
  const totalEarned = referrals?.totalEarned || 0;

  return (
    <SellerLayout title="Refer & Earn" subtitle="Invite sellers and earn rewards">
      {isLoading ? <LoadingSpinner /> : (
        <>
          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <Card className="stat-card"><CardContent className="p-0">
              <p className="text-sm text-muted-foreground mb-1">Total Referrals</p>
              <p className="text-3xl font-bold text-foreground">{referredUsers.length}</p>
              <Users size={20} className="text-primary mt-2" />
            </CardContent></Card>
            <Card className="stat-card"><CardContent className="p-0">
              <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
              <p className="text-3xl font-bold text-success">₹{totalEarned}</p>
              <DollarSign size={20} className="text-success mt-2" />
            </CardContent></Card>
            <Card className="stat-card"><CardContent className="p-0">
              <p className="text-sm text-muted-foreground mb-1">Reward Per Referral</p>
              <p className="text-3xl font-bold text-foreground">₹500</p>
              <Gift size={20} className="text-warning mt-2" />
            </CardContent></Card>
          </div>

          {/* Referral Code */}
          <Card className="mb-8">
            <CardHeader><CardTitle className="font-display text-lg">Your Referral Code</CardTitle></CardHeader>
            <CardContent>
              {referralCode ? (
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-secondary rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-primary tracking-widest">{referralCode}</p>
                  </div>
                  <Button variant="outline" className="gap-2" onClick={() => copyCode(referralCode)}>
                    <Copy size={18} /> Copy
                  </Button>
                  <Button variant="gradient" className="gap-2" onClick={() => {
                    const url = `${window.location.origin}/seller/register?ref=${referralCode}`;
                    if (navigator.share) navigator.share({ title: 'Join Dabba Nation', url });
                    else copyCode(url);
                  }}>
                    <Share2 size={18} /> Share
                  </Button>
                </div>
              ) : (
                <Button variant="gradient" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                  {generateMutation.isPending ? 'Generating...' : 'Generate Referral Code'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Referred Users */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Referred Users</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {referredUsers.map((user: any) => (
                  <div key={user._id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {user.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {user.status}
                      </span>
                      <p className="text-sm font-bold text-foreground mt-1">₹{user.reward || 500}</p>
                    </div>
                  </div>
                ))}
                {referredUsers.length === 0 && <p className="text-muted-foreground text-center py-8">No referrals yet. Share your code!</p>}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </SellerLayout>
  );
}
