import { UserLayout } from '@/layouts/UserLayout';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Scale, Truck, CreditCard, Users, AlertTriangle, Gavel } from 'lucide-react';

const sections = [
  {
    icon: FileText,
    title: 'Acceptance of Terms',
    content: `By accessing or using Dabba Nation, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. These terms apply to all users, including customers, restaurants, home chefs, and delivery partners.

    We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the platform after changes constitutes acceptance of the new terms.`
  },
  {
    icon: Users,
    title: 'User Accounts and Responsibilities',
    content: `When you create an account with Dabba Nation, you agree to:
    • Provide accurate, current, and complete information
    • Maintain the security of your account credentials
    • Accept responsibility for all activities under your account
    • Notify us immediately of any unauthorized use
    • Be at least 18 years old or have parental consent
    • Use the platform only for lawful purposes
    • Not create multiple accounts for fraudulent purposes`
  },
  {
    icon: Truck,
    title: 'Orders and Delivery',
    content: `Our platform connects you with restaurants and home chefs for food delivery:
    • Estimated delivery times are approximate and may vary
    • You must provide accurate delivery address and contact information
    • Someone must be available to receive the order at the delivery location
    • We are not responsible for delays due to traffic, weather, or restaurant preparation times
    • Orders may be cancelled by the restaurant if items are unavailable
    • Delivery partners may refuse delivery to unsafe locations`
  },
  {
    icon: CreditCard,
    title: 'Payments and Pricing',
    content: `All payments are processed through secure payment gateways:
    • Prices are inclusive of applicable taxes unless stated otherwise
    • You agree to pay all charges associated with your order
    • Payment must be completed before order processing
    • We accept wallet, Razorpay (UPI/Card), and Cash on Delivery
    • Additional verification may be required for large orders
    • Fraudulent payment attempts will result in account suspension`
  },
  {
    icon: AlertTriangle,
    title: 'Cancellations and Refunds',
    content: `Our cancellation and refund policies are as follows:
    • Orders can be cancelled before the restaurant starts preparation
    • Refunds are processed to your wallet within 5-7 business days
    • No refunds for delivered and consumed food
    • Quality issues must be reported within 24 hours with photo proof
    • We reserve the right to refuse refunds in cases of abuse
    • COD orders cancelled after dispatch may incur delivery charges`
  },
  {
    icon: Scale,
    title: 'Limitation of Liability',
    content: `Dabba Nation acts as an intermediary platform:
    • We are not responsible for food quality, preparation, or packaging by restaurants
    • Our liability is limited to the order value in case of service failures
    • We are not liable for indirect, incidental, or consequential damages
    • Force majeure events may affect service availability
    • You agree to indemnify us against claims arising from your use of the platform`
  },
  {
    icon: Gavel,
    title: 'Governing Law and Disputes',
    content: `These terms are governed by the laws of India:
    • Any disputes shall be subject to the exclusive jurisdiction of courts in Deoria, Uttar Pradesh
    • We encourage resolving disputes through our customer support first
    • Alternative dispute resolution may be offered at our discretion
    • You waive any right to participate in class action lawsuits
    • Legal notices should be sent to our registered address`
  },
];

export default function TermsOfService() {
  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scale className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: April 1, 2025</p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Dabba Nation! These Terms of Service govern your use of our food delivery platform, 
              including our website, mobile applications, and related services. By using Dabba Nation, you 
              agree to these terms. Please read them carefully before placing an order or creating an account.
            </p>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <section.icon className="text-primary" size={20} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                    <p className="text-muted-foreground whitespace-pre-line">{section.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Provisions */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Additional Provisions</h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong>Intellectual Property:</strong> All content on Dabba Nation, including logos, graphics, and software, is protected by copyright and trademark laws. You may not use our intellectual property without written permission.</p>
              
              <p><strong>Third-Party Services:</strong> Our platform may integrate with third-party services. Your use of these services is subject to their respective terms and policies.</p>
              
              <p><strong>Termination:</strong> We reserve the right to suspend or terminate your account for violations of these terms, fraudulent activities, or at our discretion with reasonable notice.</p>
              
              <p><strong>Severability:</strong> If any provision of these terms is found to be unenforceable, the remaining provisions will continue to be valid and enforceable.</p>
              
              <p><strong>Contact:</strong> For questions about these Terms of Service, please contact us at support@dabbanation.com.</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          By using Dabba Nation, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </p>
      </div>
    </UserLayout>
  );
}
