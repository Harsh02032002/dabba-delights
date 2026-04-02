import { UserLayout } from '@/layouts/UserLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Eye, Database, Share2, UserCheck, Bell } from 'lucide-react';

const sections = [
  {
    icon: Shield,
    title: 'Information We Collect',
    content: `We collect information that you provide directly to us, including:
    • Personal information (name, email, phone number, address)
    • Payment information (processed securely through our payment partners)
    • Order history and preferences
    • Location data (with your permission) for delivery purposes
    • Device and usage information to improve our services`
  },
  {
    icon: Lock,
    title: 'How We Protect Your Data',
    content: `We implement comprehensive security measures to protect your personal information:
    • Industry-standard SSL encryption for all data transmission
    • Secure payment processing through PCI-DSS compliant gateways
    • Regular security audits and vulnerability assessments
    • Restricted access to personal data within our organization
    • Secure data storage with regular backups`
  },
  {
    icon: Eye,
    title: 'How We Use Your Information',
    content: `Your information is used to provide and improve our services:
    • Processing and delivering your orders
    • Communicating order updates and promotional offers
    • Personalizing your experience and recommendations
    • Analyzing usage patterns to improve our platform
    • Complying with legal obligations and preventing fraud`
  },
  {
    icon: Share2,
    title: 'Information Sharing',
    content: `We share your information only when necessary:
    • With restaurants and delivery partners to fulfill orders
    • With payment processors for transaction processing
    • With analytics providers to improve our services
    • When required by law or to protect our rights
    • We never sell your personal information to third parties`
  },
  {
    icon: UserCheck,
    title: 'Your Rights and Choices',
    content: `You have control over your personal information:
    • Access and update your profile information anytime
    • Opt-out of promotional communications
    • Request deletion of your account and data
    • Disable location services through device settings
    • Choose payment methods and manage saved cards`
  },
  {
    icon: Database,
    title: 'Data Retention',
    content: `We retain your information as long as necessary:
    • Account information: Until you delete your account
    • Order history: For 7 years for legal and tax purposes
    • Payment records: As required by financial regulations
    • Marketing preferences: Until you opt-out
    • Anonymized usage data: Indefinitely for analytics`
  },
  {
    icon: Bell,
    title: 'Cookies and Tracking',
    content: `We use cookies and similar technologies:
    • Essential cookies for platform functionality
    • Analytics cookies to understand user behavior
    • Preference cookies to remember your settings
    • You can control cookies through browser settings
    • Third-party cookies are limited and disclosed`
  },
];

export default function PrivacyPolicy() {
  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: April 1, 2025</p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">
              At Dabba Nation, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our food delivery platform. 
              Please read this policy carefully. By using Dabba Nation, you consent to the practices 
              described in this policy.
            </p>
          </CardContent>
        </Card>

        {/* Policy Sections */}
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

        {/* Contact for Privacy Concerns */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Privacy Concerns?</h3>
            <p className="text-muted-foreground mb-4">
              If you have any questions or concerns about our privacy practices, please contact us at:
            </p>
            <p className="font-medium">privacy@dabbanation.com</p>
            <p className="text-sm text-muted-foreground mt-1">
              Dabba Nation, East Shastri Nagar, Ram Gulam Tola, Deoria 274001, India
            </p>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          This privacy policy is subject to change. We will notify you of any material changes via email or platform notifications.
        </p>
      </div>
    </UserLayout>
  );
}
