import {
  Phone,
  MapPin,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";

export default function Footer() {
  const { data: config } = useQuery({
    queryKey: ['public-platform-config'],
    queryFn: () => publicAPI.getPlatformConfig(),
    staleTime: 1000 * 60 * 10,
  });

  const supportEmail = config?.supportEmail || "support@dabbanation.com";
  const supportPhone = config?.supportPhone || "+91 73030 23539";
  const platformName = config?.platformName || "Dabba Nation";
  const footerTagline =
    config?.footerTagline ||
    "Your trusted food delivery partner, bringing delicious homemade and restaurant meals to your doorstep.";
  const footerAddress =
    config?.footerAddress ||
    "East Shastri Nagar, Ram Gulam Tola, Deoria 274001";
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
  const footerCopyright = config?.footerCopyright || "Made with ❤️ in India";

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-orange-500">
              {platformName}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {footerTagline}
            </p>
            <div className="flex space-x-3 pt-1">
              <a
                href={socialYoutube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-300 hover:scale-110"
              >
                <Youtube size={18} />
              </a>
              <a
                href={socialInstagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 text-gray-400 hover:bg-pink-600 hover:text-white transition-all duration-300 hover:scale-110"
              >
                <Instagram size={18} />
              </a>
              <a
                href={socialFacebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-110"
              >
                <Facebook size={18} />
              </a>
              <a
                href={socialLinkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 text-gray-400 hover:bg-blue-500 hover:text-white transition-all duration-300 hover:scale-110"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <a
                  href="/about"
                  className="hover:text-orange-500 transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  Become a Partner
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  Delivery Areas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Support</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <a
                  href="/help"
                  className="hover:text-orange-500 transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-orange-500 transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="hover:text-orange-500 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:text-orange-500 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/refund"
                  className="hover:text-orange-500 transition-colors"
                >
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <div className="space-y-3 text-gray-300 text-sm">
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-orange-500 shrink-0" />
                <a
                  href={`tel:${supportPhone}`}
                  className="hover:text-orange-500 transition-colors"
                >
                  {supportPhone}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-orange-500 mt-0.5 shrink-0" />
                <span>{footerAddress}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-orange-500 shrink-0" />
                <a
                  href={`mailto:${supportEmail}`}
                  className="hover:text-orange-500 transition-colors break-all"
                >
                  {supportEmail}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>
            &copy; {new Date().getFullYear()} {platformName}. All rights
            reserved.
          </p>
          <p className="mt-1">{footerCopyright}</p>
        </div>
      </div>
    </footer>
  );
}
