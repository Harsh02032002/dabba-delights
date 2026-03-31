import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  FileText, Download, TrendingUp, Building2, 
  Receipt, ArrowLeftRight
} from 'lucide-react';
import { safeArray } from '@/utils/safeArray';

export default function AdminGSTReports() {
  const [period, setPeriod] = useState('monthly');
  const [activeTab, setActiveTab] = useState('summary');

  const { data: gstData, isLoading } = useQuery({
    queryKey: ['admin-gst-reports', period],
    queryFn: () => adminAPI.getGSTReports(period),
  });

  const { data: gstConfig } = useQuery({
    queryKey: ['gst-config'],
    queryFn: () => adminAPI.getGSTConfig(),
  });

  const data = gstData || {};
  const orders = safeArray(data.orders);

  // Calculate totals
  const totalCGST = orders.reduce((sum: number, o: any) => sum + (o.cgstTotal || 0), 0);
  const totalSGST = orders.reduce((sum: number, o: any) => sum + (o.sgstTotal || 0), 0);
  const totalGST = totalCGST + totalSGST;
  const totalCommissionGst = orders.reduce((sum: number, o: any) => sum + (o.commissionGst || 0), 0);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-secondary p-1">
          <TabsTrigger value="summary" className="data-[state=active]:bg-card">Summary</TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-card">Order-wise GST</TabsTrigger>
          <TabsTrigger value="sellers" className="data-[state=active]:bg-card">Seller-wise GST</TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-card">Invoices</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-4 mb-6">
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="bg-secondary p-1">
            <TabsTrigger value="daily" className="data-[state=active]:bg-card">Today</TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-card">This Week</TabsTrigger>
            <TabsTrigger value="monthly" className="data-[state=active]:bg-card">This Month</TabsTrigger>
            <TabsTrigger value="quarterly" className="data-[state=active]:bg-card">This Quarter</TabsTrigger>
            <TabsTrigger value="yearly" className="data-[state=active]:bg-card">This Year</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" className="gap-2">
          <Download size={18} /> Export Excel
        </Button>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <>
          {activeTab === 'summary' && (
            <>
              {/* GST Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">CGST Collected (2.5%)</p>
                        <p className="text-2xl font-bold text-foreground">₹{totalCGST.toLocaleString()}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Receipt size={20} className="text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">SGST Collected (2.5%)</p>
                        <p className="text-2xl font-bold text-foreground">₹{totalSGST.toLocaleString()}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Receipt size={20} className="text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total GST (5%)</p>
                        <p className="text-2xl font-bold text-success">₹{totalGST.toLocaleString()}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                        <TrendingUp size={20} className="text-success" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Commission GST (18%)</p>
                        <p className="text-2xl font-bold text-warning">₹{totalCommissionGst.toLocaleString()}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                        <Building2 size={20} className="text-warning" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* GST Breakup Info */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="font-display text-lg">GST Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Food Items GST</p>
                      <p className="text-2xl font-bold">5%</p>
                      <p className="text-xs text-muted-foreground">CGST 2.5% + SGST 2.5%</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Platform Commission GST</p>
                      <p className="text-2xl font-bold">{gstConfig?.commissionGstRate || 18}%</p>
                      <p className="text-xs text-muted-foreground">On platform commission</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">HSN Code</p>
                      <p className="text-2xl font-bold">{gstConfig?.hsnCode || '996331'}</p>
                      <p className="text-xs text-muted-foreground">Food services</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* How it Works */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <ArrowLeftRight size={20} />
                    GST Distribution Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-4 p-3 rounded-xl bg-secondary/50">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">1</div>
                      <div>
                        <p className="font-medium">Customer Order</p>
                        <p className="text-muted-foreground">Customer places order → 5% GST (CGST 2.5% + SGST 2.5%) added to item price</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-3 rounded-xl bg-secondary/50">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">2</div>
                      <div>
                        <p className="font-medium">Order Delivery</p>
                        <p className="text-muted-foreground">When order is delivered → GST is collected from customer</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-3 rounded-xl bg-secondary/50">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">3</div>
                      <div>
                        <p className="font-medium">Commission Calculation</p>
                        <p className="text-muted-foreground">Platform takes commission → 18% GST calculated on commission amount</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-3 rounded-xl bg-secondary/50">
                      <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white font-bold">4</div>
                      <div>
                        <p className="font-medium">GST Payment</p>
                        <p className="text-muted-foreground">Seller pays 5% GST to government on food items sold</p>
                        <p className="text-muted-foreground">Platform pays 18% GST to government on commission earned</p>
                      </div>
                    </div>
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
                          <p className="font-medium">Order #{order.orderNumber}</p>
                          <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.sellerId?.businessName} • {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </p>
                        {order.sellerGstin && (
                          <p className="text-xs text-primary">Seller GSTIN: {order.sellerGstin}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">CGST</p>
                            <p className="font-medium">₹{(order.cgstTotal || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">SGST</p>
                            <p className="font-medium">₹{(order.sgstTotal || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Commission GST</p>
                            <p className="font-medium">₹{(order.commissionGst || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total GST</p>
                            <p className="font-bold text-success">
                              ₹{((order.cgstTotal || 0) + (order.sgstTotal || 0) + (order.commissionGst || 0)).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-4">
                        <FileText size={18} />
                      </Button>
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

          {activeTab === 'sellers' && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Seller-wise GST Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.sellerWise?.map((seller: any) => (
                    <div key={seller._id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                      <div>
                        <p className="font-medium">{seller.businessName}</p>
                        <p className="text-xs text-muted-foreground">{seller.gstNumber || 'Unregistered'}</p>
                        <p className="text-xs text-muted-foreground">{seller.totalOrders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">₹{seller.totalGST.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Total GST collected</p>
                      </div>
                    </div>
                  ))}
                  {!data.sellerWise?.length && (
                    <div className="text-center py-12">
                      <Building2 size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No seller GST data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'invoices' && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">GST Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.filter((o: any) => o.invoiceNumber).map((order: any) => (
                    <div key={order._id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                      <div>
                        <p className="font-medium">Invoice #{order.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">Order: {order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.invoiceDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">₹{order.total?.toLocaleString()}</p>
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
                  {orders.filter((o: any) => o.invoiceNumber).length === 0 && (
                    <div className="text-center py-12">
                      <FileText size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No invoices generated yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
