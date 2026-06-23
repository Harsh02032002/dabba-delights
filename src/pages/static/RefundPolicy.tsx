import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { UserLayout } from "@/layouts/UserLayout";

const DEFAULT_SECTIONS = [
  {
    title: "1. Order Cancellation",
    content:
      "• Before confirmation: Full refund if cancelled before the seller confirms the order\n• After confirmation: Cancellation may not be possible once the seller has started preparing your order\n• After dispatch: Orders cannot be cancelled once out for delivery",
  },
  {
    title: "2. Refund Eligibility",
    content:
      "You may be eligible for a refund in the following cases:\n• Wrong items delivered\n• Missing items from your order\n• Food quality issues (spoiled, stale, or contaminated food)\n• Order not delivered within a reasonable timeframe\n• Significant difference between menu description and actual product",
  },
  {
    title: "3. Refund Process",
    content:
      "• Report issues within 24 hours of delivery through the app or website\n• Provide photos/evidence of the issue when applicable\n• Our team will review your complaint within 24-48 hours\n• Approved refunds will be processed within 5-7 business days",
  },
  {
    title: "4. Refund Methods",
    content:
      "• Online payments (Razorpay): Refund to original payment method\n• Cash on Delivery: Refund credited to Dabba Nation wallet\n• Wallet payments: Refund to Dabba Nation wallet",
  },
  {
    title: "5. Non-Refundable Cases",
    content:
      "• Change of mind after order is confirmed\n• Incorrect delivery address provided by user\n• Delay due to factors beyond our control (weather, traffic, etc.)\n• Issues reported after 24 hours of delivery",
  },
  {
    title: "6. Delivery Fee Refund",
    content:
      "Delivery fees are non-refundable unless the entire order is cancelled before confirmation or the order was not delivered at all.",
  },
  {
    title: "7. Contact Us",
    content:
      "For refund-related queries, contact us at:\nEmail: support@dabbanation.com\nPhone: +91 73030 23539",
  },
];

export default function RefundPolicy() {
  const { data: config } = useQuery({
    queryKey: ['public-platform-config'],
    queryFn: () => publicAPI.getPlatformConfig(),
    staleTime: 1000 * 60 * 10,
  });

  const platformName = config?.platformName || "Dabba Nation";
  const currentYear = new Date().getFullYear();

  let sections = DEFAULT_SECTIONS;
  try {
    if (config?.refundPageContent)
      sections = JSON.parse(config.refundPageContent);
  } catch {}

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">
          Refund & Cancellation Policy
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
