import { UserLayout } from '@/layouts/UserLayout';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Clock, AlertCircle, CheckCircle, Phone, Wallet, Package } from 'lucide-react';

const refundTypes = [
  {
    icon: Clock,
    title: 'Order Cancellation',
    description: 'When you cancel an order before it is prepared',
    policy: 'Full refund to wallet within 24 hours',
    condition: 'Must cancel before restaurant starts preparation'
  },
  {
    icon: Package,
    title: 'Wrong Item Delivered',
    description: 'If you receive an item different from what you ordered',
    policy: 'Full refund or replacement',
    condition: 'Report within 30 minutes of delivery with photo proof'
  },
  {
    icon: AlertCircle,
    title: 'Missing Items',
    description: 'If items are missing from your delivered order',
    policy: 'Refund for missing items',
    condition: 'Report within 30 minutes of delivery with photo proof'
  },
  {
    icon: RefreshCw,
    title: 'Quality Issues',
    description: 'If the food quality is not acceptable',
    policy: 'Full or partial refund based on severity',
    condition: 'Report within 24 hours with photo/video proof'
  },
  {
    icon: AlertCircle,
    title: 'Spilled/Damaged Packaging',
    description: 'If food packaging is damaged causing spillage',
    policy: 'Full refund or replacement',
    condition: 'Report immediately at delivery with photo proof'
  },
  {
    icon: Clock,
    title: 'Excessive Delay',
    description: 'If order delivery is significantly delayed',
    policy: 'Partial refund (up to 50%)',
    condition: 'Delay must be more than 60 minutes beyond estimated time'
  },
];

const nonRefundableCases = [
  'Change of mind after order is prepared',
  'Incorrect delivery address provided by customer',
  'Customer unavailable at delivery location',
  'Order refused at delivery without valid reason',
  'Promotional or discounted items (unless defective)',
  'Complaints raised after 24 hours of delivery',
];

export default function RefundPolicy() {
  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Refund Policy</h1>
          <p className="text-muted-foreground">Last updated: April 1, 2025</p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">
              At Dabba Nation, we strive to ensure your complete satisfaction with every order. 
              Our refund policy is designed to be fair and transparent. If you are not satisfied 
              with your order for any valid reason, we are here to help you with a refund or replacement.
            </p>
          </CardContent>
        </Card>

        {/* Refund Process Overview */}
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">How Refunds Work</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertCircle className="text-primary" size={24} />
                </div>
                <h3 className="font-medium mb-1">1. Report Issue</h3>
                <p className="text-sm text-muted-foreground">Contact us immediately with details and photos</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="text-primary" size={24} />
                </div>
                <h3 className="font-medium mb-1">2. Review</h3>
                <p className="text-sm text-muted-foreground">Our team reviews your request within 24 hours</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Wallet className="text-primary" size={24} />
                </div>
                <h3 className="font-medium mb-1">3. Refund</h3>
                <p className="text-sm text-muted-foreground">Approved refunds credited to your wallet</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refund Types */}
        <h2 className="text-2xl font-semibold mb-6">Refund Scenarios</h2>
        <div className="space-y-4 mb-8">
          {refundTypes.map((type, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <type.icon className="text-primary" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{type.title}</h3>
                    <p className="text-muted-foreground mb-2">{type.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {type.policy}
                      </span>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                        Condition: {type.condition}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Non-Refundable Cases */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-destructive" size={24} />
              <h2 className="text-xl font-semibold">Non-Refundable Cases</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Refunds will not be provided in the following situations:
            </p>
            <ul className="space-y-2">
              {nonRefundableCases.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-destructive mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Refund Timeline */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Refund Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <CheckCircle className="text-green-500 mt-1" size={20} />
                <div>
                  <h4 className="font-medium">Wallet Refunds</h4>
                  <p className="text-sm text-muted-foreground">Instant to 24 hours after approval</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="text-green-500 mt-1" size={20} />
                <div>
                  <h4 className="font-medium">Original Payment Method</h4>
                  <p className="text-sm text-muted-foreground">5-7 business days (for Razorpay/card payments)</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="text-green-500 mt-1" size={20} />
                <div>
                  <h4 className="font-medium">Bank Transfer</h4>
                  <p className="text-sm text-muted-foreground">7-10 business days (if wallet balance transferred to bank)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact for Refunds */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <Phone className="text-primary mx-auto mb-3" size={32} />
            <h3 className="font-semibold mb-2">Need Help with a Refund?</h3>
            <p className="text-muted-foreground mb-4">
              Our support team is available to assist you with any refund-related queries
            </p>
            <div className="space-y-1">
              <p className="font-medium">+91 73030 23539</p>
              <p className="text-sm text-muted-foreground">support@dabbanation.com</p>
              <p className="text-sm text-muted-foreground">Available: Mon-Sat, 9 AM - 9 PM</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Dabba Nation reserves the right to modify this refund policy at any time. Changes will be effective immediately upon posting.
        </p>
      </div>
    </UserLayout>
  );
}
