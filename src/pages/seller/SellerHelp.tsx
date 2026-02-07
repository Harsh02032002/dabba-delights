import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react';

const faqs = [
  { q: 'How do I add a new menu item?', a: 'Go to Menu Management and click "Add Item". Fill in the details and upload an image.' },
  { q: 'When will I receive my settlement?', a: 'Settlements are processed after T+2 days from order delivery. Check the Settlements page for details.' },
  { q: 'How do I update my operating hours?', a: 'Go to your Profile page and scroll to Operating Hours section to update timings.' },
  { q: 'What is the commission structure?', a: 'Commission varies by seller type. Check your Earnings page for your current commission rate.' },
  { q: 'How do I handle order cancellations?', a: 'You can cancel orders from the Orders page. The refund will be processed automatically.' },
];

export default function SellerHelp() {
  return (
    <SellerLayout title="Help & Support" subtitle="Get help with your seller account">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* FAQ */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Frequently Asked Questions</CardTitle></CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Send us a message</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Subject</Label><Input placeholder="What do you need help with?" /></div>
              <div className="space-y-2"><Label>Message</Label><Textarea placeholder="Describe your issue..." rows={4} /></div>
              <Button variant="gradient" className="gap-2"><MessageCircle size={18} /> Send Message</Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Phone size={32} className="mx-auto text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Call Us</h3>
              <p className="text-muted-foreground">+91 1800-123-4567</p>
              <p className="text-xs text-muted-foreground mt-1">Mon-Sat, 9am-6pm</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Mail size={32} className="mx-auto text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
              <p className="text-muted-foreground">seller-support@dabbanation.com</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SellerLayout>
  );
}
