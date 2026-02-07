import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Book, MessageCircle, Phone, Mail } from 'lucide-react';

const faqs = [
  { q: 'How do I approve a new seller?', a: 'Navigate to Sellers page, find the pending seller, and click Approve after reviewing their KYC documents.' },
  { q: 'How do commission overrides work?', a: 'Go to the Sellers page, click on a seller, and set a custom commission rate. This overrides the default rate.' },
  { q: 'How are settlements processed?', a: 'Settlements are auto-calculated after T+X days. You can process them manually from the Settlements page.' },
  { q: 'How do I configure GST?', a: 'Go to GST Config page to set CGST, SGST, and IGST rates. You can also enable auto-invoicing.' },
  { q: 'How do I view platform analytics?', a: 'The Analytics page shows revenue, orders, city-wise data, category sales, and cart drop-off metrics.' },
];

export default function AdminHelp() {
  return (
    <AdminLayout title="Help & Support" subtitle="Admin documentation and support">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Admin FAQ</CardTitle></CardHeader>
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
        </div>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Phone size={32} className="mx-auto text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Emergency Support</h3>
              <p className="text-muted-foreground">+91 1800-123-4567</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Mail size={32} className="mx-auto text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Admin Email</h3>
              <p className="text-muted-foreground">admin@dabbanation.com</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Book size={32} className="mx-auto text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Documentation</h3>
              <p className="text-muted-foreground">docs.dabbanation.com</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
