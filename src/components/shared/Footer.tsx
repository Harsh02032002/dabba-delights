import { Phone, MapPin, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-orange-500">Dabba Nation</h3>
            <p className="text-gray-300 text-sm">
              Your trusted food delivery partner, bringing delicious homemade and restaurant meals to your doorstep.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="/about" className="hover:text-orange-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Become a Partner</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Delivery Areas</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Support</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="/help" className="hover:text-orange-500 transition-colors">Help Center</a></li>
              <li><a href="/contact" className="hover:text-orange-500 transition-colors">Contact Us</a></li>
              <li><a href="/privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-orange-500 transition-colors">Terms of Service</a></li>
              <li><a href="/refund" className="hover:text-orange-500 transition-colors">Refund Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <div className="space-y-3 text-gray-300 text-sm">
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-orange-500" />
                <span>+91 73030 23539</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-orange-500 mt-1" />
                <span>
                  East Shastri Nagar<br />
                  Ram Gulam Tola<br />
                  Deoria 274001
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-orange-500" />
                <span>support@dabbanation.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2024 Dabba Nation. All rights reserved.</p>
          <p className="mt-2">Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}
