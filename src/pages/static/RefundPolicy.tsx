import { UserLayout } from '@/layouts/UserLayout';

export default function RefundPolicy() {
  const currentYear = new Date().getFullYear();

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">Refund & Cancellation Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January {currentYear}</p>

        <div className="prose max-w-none space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Order Cancellation</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Before confirmation:</strong> Full refund if cancelled before the seller confirms the order</li>
              <li><strong>After confirmation:</strong> Cancellation may not be possible once the seller has started preparing your order</li>
              <li><strong>After dispatch:</strong> Orders cannot be cancelled once out for delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Refund Eligibility</h2>
            <p>You may be eligible for a refund in the following cases:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Wrong items delivered</li>
              <li>Missing items from your order</li>
              <li>Food quality issues (spoiled, stale, or contaminated food)</li>
              <li>Order not delivered within a reasonable timeframe</li>
              <li>Significant difference between menu description and actual product</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Refund Process</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Report issues within 24 hours of delivery through the app or website</li>
              <li>Provide photos/evidence of the issue when applicable</li>
              <li>Our team will review your complaint within 24-48 hours</li>
              <li>Approved refunds will be processed within 5-7 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Refund Methods</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Online payments (Razorpay):</strong> Refund to original payment method</li>
              <li><strong>Cash on Delivery:</strong> Refund credited to Dabba Nation wallet</li>
              <li><strong>Wallet payments:</strong> Refund to Dabba Nation wallet</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Non-Refundable Cases</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Change of mind after order is confirmed</li>
              <li>Incorrect delivery address provided by user</li>
              <li>Delay due to factors beyond our control (weather, traffic, etc.)</li>
              <li>Issues reported after 24 hours of delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Delivery Fee Refund</h2>
            <p>Delivery fees are non-refundable unless the entire order is cancelled before confirmation or the order was not delivered at all.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Contact Us</h2>
            <p>For refund-related queries, contact us at:</p>
            <p>Email: support@dabbanation.com<br/>Phone: +91 98765 43210</p>
          </section>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12">
          © {currentYear} Dabba Nation. All rights reserved.
        </p>
      </div>
    </UserLayout>
  );
}
