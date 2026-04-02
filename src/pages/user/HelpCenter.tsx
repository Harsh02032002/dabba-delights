import { UserLayout } from '@/layouts/UserLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, HelpCircle, Truck, CreditCard, User, Shield, MessageCircle } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    category: 'Orders',
    icon: Truck,
    questions: [
      { q: 'How do I place an order?', a: 'Browse through our wide selection of restaurants and home chefs, add items to your cart, and proceed to checkout. You can pay via wallet, Razorpay, or Cash on Delivery.' },
      { q: 'How can I track my order?', a: 'Once your order is confirmed, you can track its status in real-time through the "My Orders" section. You\'ll receive updates at every stage - confirmed, preparing, ready, and out for delivery.' },
      { q: 'Can I cancel my order?', a: 'Yes, you can cancel your order if the restaurant hasn\'t started preparing it yet. Go to "My Orders" and click on the cancel button. Refunds are processed instantly to your wallet.' },
      { q: 'What if my order is late?', a: 'We strive to deliver all orders on time. If your order is significantly delayed, please contact our support team immediately. We\'ll coordinate with the delivery partner and restaurant to ensure quick delivery.' },
    ]
  },
  {
    category: 'Payments',
    icon: CreditCard,
    questions: [
      { q: 'What payment methods are accepted?', a: 'We accept multiple payment methods: Wallet (Dabba Nation Wallet), Razorpay (UPI, Cards, Netbanking), and Cash on Delivery (COD).' },
      { q: 'How does the wallet work?', a: 'Your Dabba Nation wallet can be topped up and used for instant payments. You also receive 2% cashback on every order paid through the wallet!' },
      { q: 'Is my payment information secure?', a: 'Absolutely! We use industry-standard encryption and secure payment gateways. Your card details are never stored on our servers.' },
      { q: 'How do refunds work?', a: 'Refunds for cancelled orders or failed payments are processed instantly to your wallet. You can use this amount for future orders or request a bank transfer.' },
    ]
  },
  {
    category: 'Account',
    icon: User,
    questions: [
      { q: 'How do I create an account?', a: 'Click on "Sign Up" and fill in your details including name, email, phone number, and delivery address. Verify your phone number with OTP and you\'re all set!' },
      { q: 'Can I change my delivery address?', a: 'Yes, you can add multiple addresses in your profile settings and select your preferred address during checkout.' },
      { q: 'How do I update my profile?', a: 'Go to "Settings" from your profile menu. You can update your name, email, phone number, and add/edit delivery addresses.' },
    ]
  },
  {
    category: 'Safety',
    icon: Shield,
    questions: [
      { q: 'How do you ensure food safety?', a: 'All our partner restaurants and home chefs are FSSAI certified. We regularly audit their kitchens and ensure they follow strict hygiene protocols.' },
      { q: 'What if I receive wrong or spilled food?', a: 'Please report any issues immediately through the app or contact our support. We\'ll investigate and process a full refund or replacement.' },
      { q: 'Are the delivery partners verified?', a: 'Yes, all delivery partners undergo background verification and are trained in safe food handling practices.' },
    ]
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">Help Center</h1>
          <p className="text-muted-foreground mb-6">Find answers to your questions and get support</p>
          
          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input 
              placeholder="Search for answers..." 
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <MessageCircle className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-semibold">Chat Support</h3>
                <p className="text-sm text-muted-foreground">Available 9 AM - 9 PM</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <HelpCircle className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-semibold">Call Support</h3>
                <p className="text-sm text-muted-foreground">+91 73030 23539</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <div className="space-y-8">
          {filteredFaqs.map((category, catIdx) => (
            <div key={category.category}>
              <div className="flex items-center gap-2 mb-4">
                <category.icon className="text-primary" size={24} />
                <h2 className="text-xl font-semibold">{category.category}</h2>
              </div>
              <div className="space-y-3">
                {category.questions.map((faq, qIdx) => {
                  const key = `${catIdx}-${qIdx}`;
                  const isExpanded = expandedIndex === key;
                  return (
                    <Card key={key} className="overflow-hidden">
                      <button
                        className="w-full p-4 text-left flex justify-between items-center hover:bg-muted/50 transition-colors"
                        onClick={() => setExpandedIndex(isExpanded ? null : key)}
                      >
                        <span className="font-medium">{faq.q}</span>
                        <span className="text-2xl text-muted-foreground">
                          {isExpanded ? '−' : '+'}
                        </span>
                      </button>
                      {isExpanded && (
                        <CardContent className="pt-0 pb-4 text-muted-foreground">
                          {faq.a}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still need help */}
        <Card className="mt-10 bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Still need help?</h3>
            <p className="text-muted-foreground mb-4">Our support team is here to assist you</p>
            <Button asChild>
              <a href="/contact">Contact Us</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}
