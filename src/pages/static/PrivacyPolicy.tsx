import { UserLayout } from '@/layouts/UserLayout';

export default function PrivacyPolicy() {
  const currentYear = new Date().getFullYear();

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January {currentYear}</p>

        <div className="prose max-w-none space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
            <p>We collect information you provide directly, including your name, email address, phone number, delivery addresses, payment details, and order history. We also collect device information, IP addresses, and usage data automatically.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To process and deliver your food orders</li>
              <li>To communicate order updates and delivery status</li>
              <li>To provide customer support</li>
              <li>To personalize your experience and recommendations</li>
              <li>To process payments securely</li>
              <li>To improve our platform and services</li>
              <li>To send promotional offers (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Information Sharing</h2>
            <p>We share your information only with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sellers/restaurants to fulfill your orders</li>
              <li>Delivery partners for order delivery</li>
              <li>Payment processors for secure transactions</li>
              <li>As required by law or legal proceedings</li>
            </ul>
            <p>We never sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Cookies & Tracking</h2>
            <p>We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze platform usage.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal data. You can manage your preferences in your account settings or contact us at privacy@dabbanation.com.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Contact Us</h2>
            <p>For privacy-related questions, contact us at:</p>
            <p>Email: privacy@dabbanation.com<br/>Phone: +91 98765 43210<br/>Address: 123 Food Street, Mumbai, Maharashtra, India</p>
          </section>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12">
          © {currentYear} Dabba Nation. All rights reserved.
        </p>
      </div>
    </UserLayout>
  );
}
