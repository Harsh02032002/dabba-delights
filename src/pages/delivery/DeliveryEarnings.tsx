import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  DollarSign, TrendingUp, Calendar, Wallet, ArrowUpRight,
  ArrowDownRight, Download, Clock, Package
} from "lucide-react";
import { deliveryAPI } from "@/lib/api";

interface EarningsData {
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalEarnings: number;
  walletBalance: number;
  totalDeliveries: number;
  todayDeliveries: number;
  averageRating: number;
  recentTransactions: Array<{
    _id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    createdAt: string;
    balance: number;
  }>;
  weeklyStats: Array<{
    day: string;
    earnings: number;
    deliveries: number;
  }>;
}

export default function DeliveryEarnings() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 💰 Fetch Earnings Data
  const fetchEarnings = async () => {
    try {
      setIsLoading(true);
      const response = await deliveryAPI.getEarnings();
      setEarnings(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 💸 Withdraw Wallet
  const handleWithdraw = async () => {
    if (!earnings?.walletBalance || earnings.walletBalance < 500) {
      toast({
        title: "Insufficient Balance",
        description: "Minimum withdrawal amount is ₹500",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      await deliveryAPI.withdrawFromWallet(earnings.walletBalance);
      
      toast({
        title: "✅ Withdrawal Successful",
        description: `₹${earnings.walletBalance} withdrawn to your account`
      });
      
      // Refresh earnings
      fetchEarnings();
    } catch (error: any) {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  if (!earnings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">₹{earnings.todayEarnings}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Package size={12} />
                  {earnings.todayDeliveries} deliveries
                </p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">₹{earnings.weeklyEarnings}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ArrowUpRight size={12} />
                  +12% from last week
                </p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">₹{earnings.monthlyEarnings}</p>
                <p className="text-xs text-muted-foreground">
                  {earnings.totalDeliveries} total deliveries
                </p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
                <p className="text-2xl font-bold">₹{earnings.walletBalance}</p>
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i < Math.floor(earnings.averageRating)
                            ? 'bg-yellow-400'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {earnings.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={20} />
            Weekly Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {earnings.weeklyStats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-xs text-muted-foreground mb-2">{stat.day}</p>
                <div className="relative">
                  <div className="h-20 bg-gray-100 rounded-lg flex items-end justify-center">
                    <div
                      className="w-full bg-gradient-to-t from-orange-500 to-amber-500 rounded-lg transition-all duration-300"
                      style={{
                        height: `${Math.max(10, (stat.earnings / Math.max(...earnings.weeklyStats.map(s => s.earnings))) * 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-xs font-medium mt-1">₹{stat.earnings}</p>
                  <p className="text-xs text-muted-foreground">{stat.deliveries}d</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {earnings.recentTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <ArrowUpRight size={16} className="text-green-600" />
                      ) : (
                        <ArrowDownRight size={16} className="text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bal: ₹{transaction.balance}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Wallet Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet size={20} />
              Wallet Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Available Balance</span>
                <span className="text-lg font-bold text-orange-600">₹{earnings.walletBalance}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Minimum withdrawal amount: ₹500
              </p>
              <Button
                onClick={handleWithdraw}
                disabled={isLoading || earnings.walletBalance < 500}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign size={16} className="mr-2" />
                    Withdraw to Bank
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                Download Statement
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar size={16} />
                Payment History
              </Button>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Payments are processed within 24-48 hours
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
