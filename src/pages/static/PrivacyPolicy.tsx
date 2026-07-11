import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { UserLayout } from "@/layouts/UserLayout";

const DEFAULT_SECTIONS = [
  {
    title: "1. Information We Collect",
    content:
      "We collect information you provide directly, including your name, email address, phone number, delivery addresses, payment details, and order history. We also collect device information, IP addresses, and usage data automatically.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "• To process and deliver your food orders\n• To communicate order updates and delivery status\n• To provide customer support\n• To personalize your experience and recommendations\n• To process payments securely\n• To improve our platform and services\n• To send promotional offers (with your consent)",
  },
  {
    title: "3. Information Sharing",
    content:
      "We share your information only with:\n• Sellers/restaurants to fulfill your orders\n• Delivery partners for order delivery\n• Payment processors for secure transactions\n• As required by law or legal proceedings\n\nWe never sell your personal data to third parties.",
  },
  {
    title: "4. Data Security",
    content:
      "We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal information.",
  },
  {
    title: "5. Cookies & Tracking",
    content:
      "We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze platform usage.",
  },
  {
    title: "6. Your Rights",
    content:
      "You have the right to access, update, or delete your personal data. You can manage your preferences in your account settings or contact us at support@dabbanation.com.",
  },
  {
    title: "7. Contact Us",
    content:
      "For privacy-related questions, contact us at:\nEmail: support@dabbanation.com\nPhone: +91 73030 23539\nAddress: East Shastri Nagar, Ram Gulam Tola, Deoria 274001",
  },
];

export default function PrivacyPolicy() {
  const { data: config } = useQuery({
    queryKey: ['public-platform-config'],
    queryFn: () => publicAPI.getPlatformConfig(),
    staleTime: 0,
  });

  const platformName = config?.platformName || "Dabba Nation";
  const currentYear = new Date().getFullYear();

  let sections = DEFAULT_SECTIONS;
  try {
    if (config?.privacyPageContent)
      sections = JSON.parse(config.privacyPageContent);
  } catch {}

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-8">
          Last updated: {currentYear}
        </p>

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
