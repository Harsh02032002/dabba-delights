import { UserLayout } from '@/layouts/UserLayout';

export default function TermsOfService() {
  const currentYear = new Date().getFullYear();

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Effective: January {currentYear}</p>

        <div className="prose max-w-none space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using Dabba Nation's platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Account Registration</h2>
            <p>You must provide accurate, complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Orders & Payments</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All orders are subject to acceptance by the seller</li>
              <li>Prices displayed include applicable taxes unless stated otherwise</li>
              <li>Payment can be made via Razorpay (UPI, cards, netbanking) or Cash on Delivery</li>
              <li>Orders once confirmed cannot be modified; cancellation policies apply</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Delivery</h2>
            <p>Delivery times are estimates and may vary based on distance, traffic, and order volume. We strive to deliver within the estimated timeframe but do not guarantee exact delivery times.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Seller Responsibilities</h2>
            <p>Sellers on our platform are responsible for food quality, hygiene, accurate menu descriptions, and timely preparation. Dabba Nation acts as a marketplace facilitator.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. User Conduct</h2>
            <p>Users must not misuse the platform, submit fraudulent orders, harass delivery partners or sellers, or engage in any activity that violates applicable laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Intellectual Property</h2>
            <p>All content on Dabba Nation, including logos, designs, and text, is owned by Dabba Nation and protected by intellectual property laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Limitation of Liability</h2>
            <p>Dabba Nation is not liable for any food quality issues, allergic reactions, delivery delays beyond our control, or any indirect/consequential damages arising from the use of our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
            <p>For questions about these terms, contact us at legal@dabbanation.com.</p>
          </section>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12">
          © {currentYear} Dabba Nation. All rights reserved.
        </p>
      </div>
    </UserLayout>
  );
}
