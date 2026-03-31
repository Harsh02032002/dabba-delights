import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  Receipt, FileText, TrendingUp, Percent, 
  Building2, Download, AlertCircle 
} from 'lucide-react';
import { safeArray } from '@/utils/safeArray';

export default function SellerGST() {
  const [period, setPeriod] = useState('monthly');
  const [activeTab, setActiveTab] = useState('summary');

  const { data: gstData, isLoading } = useQuery({
    queryKey: ['seller-gst', period],
    queryFn: () => sellerAPI.getGSTReport(period),
  });

  const { data: profile } = useQuery({
    queryKey: ['seller-profile'],
    queryFn: () => sellerAPI.getProfile(),
  });

  const data = gstData || {};
  const orders = safeArray(data.orders);
  const seller = profile?.seller || {};

  // Calculate totals
  const totalCGST = orders.reduce((sum: number, o: any) => sum + (o.cgstTotal || 0), 0);
  const totalSGST = orders.reduce((sum: number, o: any) => sum + (o.sgstTotal || 0), 0);
  const totalGST = totalCGST + totalSGST;
  const totalSales = orders.reduce((sum: number, o: any) => sum + (o.itemTotal || 0), 0);

  const isGstRegistered = seller?.gstNumber && seller?.isGstRegistered;

  return (
    <SellerLayout title="GST & Taxation" subtitle="View your GST collection and tax compliance">
      
      {!isGstRegistered && (
        <Card className="mb-6 border-warning">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-warning mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Not GST Registered</p>
              <p className="text-sm text-muted-foreground">
                You are currently marked as an unregistered seller. GST is being collected from customers but you don't need to file GST returns. 
                <a href="/seller/profile" className="text-primary hover:underline ml-1">Update GST details</a>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-secondary p-1">
          <TabsTrigger value="summary" className="data-[state=active]:bg-card">GST Summary</TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-card">Order-wise</TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-card">Tax Invoices</TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs value={period} onValueChange={setPeriod} className="mb-6">
        <TabsList className="bg-secondary p-1">
          <TabsTrigger value="daily" className="data-[state=active]:bg-card">Today</TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-card">This Week</TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-card">This Month</TabsTrigger>
          <TabsTrigger value="quarterly" className="data-[state=active]:bg-card">This Quarter</TabsTrigger>
          <TabsTrigger value="yearly" className="data-[state=active]:bg-card">This Year</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? <LoadingSpinner /> : (
        <>
          {activeTab === 'summary' && (
            <>
              {/* Seller GST Info */}
              {isGstRegistered && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <Building2 size={20} />
                      GST Registration Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">GSTIN Number</p>
                        <p className="text-lg font-bold">{seller.gstNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">GST Type</p>
                        <p className="text-lg font-bold capitalize">{seller.gstType || 'Regular'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">HSN Code</p>
                        <p className="text-lg font-bold">996331</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* GST Summary Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="stat-card">
                  <CardContent className="p-0">
                    <p className="text-sm text-muted-foreground mb-1">Total Sales (Excl. GST)</p>
                    <p className="text-3xl font-bold text-foreground">₹{totalSales.toLocaleString()}</p>
                    <div className="mt-2 w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                      <TrendingUp size={24} className="text-primary-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="stat-card">
                  <CardContent className="p-0">
                    <p className="text-sm text-muted-foreground mb-1">CGST Collected (2.5%)</p>
                    <p className="text-3xl font-bold text-foreground">₹{totalCGST.toLocaleString()}</p>
                    <div className="mt-2 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Receipt size={24} className="text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="stat-card">
                  <CardContent className="p-0">
                    <p className="text-sm text-muted-foreground mb-1">SGST Collected (2.5%)</p>
                    <p className="text-3xl font-bold text-foreground">₹{totalSGST.toLocaleString()}</p>
                    <div className="mt-2 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Receipt size={24} className="text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="stat-card">
                  <CardContent className="p-0">
                    <p className="text-sm text-muted-foreground mb-1">Total GST (5%)</p>
                    <p className="text-3xl font-bold text-success">₹{totalGST.toLocaleString()}</p>
                    <div className="mt-2 w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <Percent size={24} className="text-success" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* GST Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Understanding Your GST</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      <strong className="text-foreground">CGST (Central GST):</strong> 2.5% of item price goes to Central Government
                    </p>
                    <p>
                      <strong className="text-foreground">SGST (State GST):</strong> 2.5% of item price goes to State Government
                    </p>
                    <p>
                      <strong className="text-foreground">Total GST:</strong> 5% collected from customers on food items
                    </p>
                    {isGstRegistered ? (
                      <p className="text-warning">
                        You are GST registered. You need to file GST returns and pay the collected GST to the government.
                      </p>
                    ) : (
                      <p className="text-info">
                        You are not GST registered. The platform handles GST compliance on your behalf.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'orders' && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Order-wise GST Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.map((order: any) => (
                    <div key={order._id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium">{order.orderNumber}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            order.status === 'delivered' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Items</p>
                            <p className="font-medium">₹{(order.itemTotal || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">CGST</p>
                            <p className="font-medium">₹{(order.cgstTotal || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">SGST</p>
                            <p className="font-medium">₹{(order.sgstTotal || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-bold">₹{(order.total || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-12">
                      <Receipt size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No GST data available for this period</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'invoices' && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center justify-between">
                  <span>Tax Invoices</span>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download size={16} /> Export All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.filter((o: any) => o.status === 'delivered').map((order: any) => (
                    <div key={order._id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                      <div>
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-primary" />
                          <p className="font-medium">Invoice #{order.invoiceNumber || order.orderNumber}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Order: {order.orderNumber} • {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </p>
                        {isGstRegistered && (
                          <p className="text-xs text-primary">Your GSTIN: {seller.gstNumber}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">₹{(order.total || 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            GST: ₹{((order.cgstTotal || 0) + (order.sgstTotal || 0)).toLocaleString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download size={16} /> PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                  {orders.filter((o: any) => o.status === 'delivered').length === 0 && (
                    <div className="text-center py-12">
                      <FileText size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No invoices available. Invoices are generated after order delivery.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </SellerLayout>
  );
}
