import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { UserLayout } from "@/layouts/UserLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Phone,
  MapPin,
  Mail,
  Clock,
  Send,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function ContactUs() {
  const { data: config } = useQuery({
    queryKey: ["platform-config"],
    queryFn: () => adminAPI.getPlatformConfig(),
    staleTime: 1000 * 60 * 10,
  });

  const supportPhone = config?.supportPhone || "+91 73030 23539";
  const supportEmail = config?.supportEmail || "support@dabbanation.com";
  const footerAddress =
    config?.footerAddress ||
    "East Shastri Nagar, Ram Gulam Tola, Deoria 274001";
  const contactWorkingHours =
    config?.contactWorkingHours || "Monday – Saturday, 9:00 AM – 9:00 PM IST";
  const socialYoutube =
    config?.socialYoutube ||
    "https://youtube.com/@dabbanationofficial?si=hjZTZz5eQ-t0gMlO";
  const socialInstagram =
    config?.socialInstagram ||
    "https://www.instagram.com/dabbanation?utm_source=qr&igsh=aGlweTZ1cDRvZjQ5";
  const socialFacebook =
    config?.socialFacebook || "https://www.facebook.com/share/1D1u1We4vN/";
  const socialLinkedin =
    config?.socialLinkedin ||
    "https://www.linkedin.com/in/akash-diwivedi-a01a65411?utm_source=share_via&utm_content=profile&utm_medium=member_android";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const socialLinks = [
    {
      href: socialYoutube,
      Icon: Youtube,
      label: "YouTube",
      hover: "hover:bg-red-600",
    },
    {
      href: socialInstagram,
      Icon: Instagram,
      label: "Instagram",
      hover: "hover:bg-pink-600",
    },
    {
      href: socialFacebook,
      Icon: Facebook,
      label: "Facebook",
      hover: "hover:bg-blue-600",
    },
    {
      href: socialLinkedin,
      Icon: Linkedin,
      label: "LinkedIn",
      hover: "hover:bg-blue-500",
    },
  ];

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
          <p className="text-muted-foreground">
            We'd love to hear from you. Reach out to us for any queries or
            support.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Name *</label>
                    <Input
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject *</label>
                  <Input
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message *</label>
                  <Textarea
                    placeholder="Please describe your query in detail..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <Send size={18} className="mr-2" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Phone className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium">Phone Support</h3>
                      <a
                        href={`tel:${supportPhone}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {supportPhone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Mail className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium">Email Us</h3>
                      <a
                        href={`mailto:${supportEmail}`}
                        className="text-muted-foreground hover:text-primary transition-colors break-all"
                      >
                        {supportEmail}
                      </a>
                      <p className="text-sm text-muted-foreground">
                        We reply within 24 hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium">Office Address</h3>
                      <p
                        className="text-muted-foreground"
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {footerAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Clock className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium">Working Hours</h3>
                      <p
                        className="text-muted-foreground"
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {contactWorkingHours}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {socialLinks.map(({ href, Icon, label, hover }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={`w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center ${hover} hover:text-white transition-all duration-200 hover:scale-110`}
                    >
                      <Icon size={20} />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
