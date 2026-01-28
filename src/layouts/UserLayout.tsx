import { ReactNode } from 'react';
import { UserNavbar } from '@/components/user/UserNavbar';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

interface UserLayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
}

export function UserLayout({ children, onSearch }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <UserNavbar onSearch={onSearch} />
      
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-foreground text-background mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Logo size="md" showText />
              </div>
              <p className="text-background/70 text-sm">
                Connecting you with the best home-cooked meals and restaurants in your city.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                  <Facebook size={16} />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                  <Instagram size={16} />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                  <Twitter size={16} />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                  <Youtube size={16} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link to="/" className="hover:text-background transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-background transition-colors">About Us</Link></li>
                <li><Link to="/restaurants" className="hover:text-background transition-colors">Restaurants</Link></li>
                <li><Link to="/home-chefs" className="hover:text-background transition-colors">Home Chefs</Link></li>
                <li><Link to="/subscriptions" className="hover:text-background transition-colors">Subscriptions</Link></li>
              </ul>
            </div>

            {/* Partner With Us */}
            <div>
              <h4 className="font-semibold mb-4">Partner With Us</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link to="/seller/register" className="hover:text-background transition-colors">Register as Seller</Link></li>
                <li><Link to="/seller/login" className="hover:text-background transition-colors">Seller Login</Link></li>
                <li><a href="#" className="hover:text-background transition-colors">Delivery Partner</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Corporate Orders</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm text-background/70">
                <li className="flex items-center gap-2">
                  <MapPin size={16} className="text-primary shrink-0" />
                  <span>123 Food Street, Mumbai, Maharashtra</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={16} className="text-primary shrink-0" />
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={16} className="text-primary shrink-0" />
                  <span>support@dabbanation.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-background/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-background/50">
              © 2024 Dabba Nation. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-background/50">
              <a href="#" className="hover:text-background transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-background transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-background transition-colors">Refund Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
