import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { UserLayout } from "@/layouts/UserLayout";

const DEFAULT_SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using Dabba Nation's platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.",
  },
  {
    title: "2. Account Registration",
    content:
      "You must provide accurate, complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.",
  },
  {
    title: "3. Orders & Payments",
    content:
      "• All orders are subject to acceptance by the seller\n• Prices displayed include applicable taxes unless stated otherwise\n• Payment can be made via Razorpay (UPI, cards, netbanking) or Cash on Delivery\n• Orders once confirmed cannot be modified; cancellation policies apply",
  },
  {
    title: "4. Delivery",
    content:
      "Delivery times are estimates and may vary based on distance, traffic, and order volume. We strive to deliver within the estimated timeframe but do not guarantee exact delivery times.",
  },
  {
    title: "5. Seller Responsibilities",
    content:
      "Sellers on our platform are responsible for food quality, hygiene, accurate menu descriptions, and timely preparation. Dabba Nation acts as a marketplace facilitator.",
  },
  {
    title: "6. User Conduct",
    content:
      "Users must not misuse the platform, submit fraudulent orders, harass delivery partners or sellers, or engage in any activity that violates applicable laws.",
  },
  {
    title: "7. Intellectual Property",
    content:
      "All content on Dabba Nation, including logos, designs, and text, is owned by Dabba Nation and protected by intellectual property laws.",
  },
  {
    title: "8. Limitation of Liability",
    content:
      "Dabba Nation is not liable for any food quality issues, allergic reactions, delivery delays beyond our control, or any indirect/consequential damages arising from the use of our platform.",
  },
  {
    title: "9. Changes to Terms",
    content:
      "We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.",
  },
  {
    title: "10. Contact",
    content:
      "For questions about these terms, contact us at support@dabbanation.com.",
  },
];

export default function TermsOfService() {
  const { data: config } = useQuery({
    queryKey: ['public-platform-config'],
    queryFn: () => publicAPI.getPlatformConfig(),
    staleTime: 0,
  });

  const platformName = config?.platformName || "Dabba Nation";
  const currentYear = new Date().getFullYear();

  let sections = DEFAULT_SECTIONS;
  try {
    if (config?.termsPageContent)
      sections = JSON.parse(config.termsPageContent);
  } catch {}

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">
          Terms of Service
        </h1>
        <p className="text-muted-foreground mb-8">Effective: {currentYear}</p>

        <div className="prose max-w-none space-y-8 text-muted-foreground">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-xl font-semibold text-foreground">
                {section.title}
              </h2>
              <p style={{ whiteSpace: "pre-line" }}>{section.content}</p>
            </section>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12">
          © {currentYear} {platformName}. All rights reserved.
        </p>
      </div>
    </UserLayout>
  );
}
