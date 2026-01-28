import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Store } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function SellerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password, 'seller');
      toast({ title: 'Welcome back!', description: 'Seller login successful' });
      navigate('/seller');
    } catch (error) {
      toast({ title: 'Login failed', description: 'Invalid credentials', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12">
        <div className="max-w-lg text-center text-white">
          <div className="w-32 h-32 mx-auto mb-8 bg-white/20 rounded-3xl flex items-center justify-center animate-float">
            <Store size={64} className="text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-4">
            Grow Your Food Business
          </h2>
          <p className="text-white/80">
            Join thousands of home chefs and restaurants earning through Dabba Nation. 
            Manage orders, track earnings, and grow your customer base.
          </p>
          
          <div className="grid grid-cols-3 gap-6 mt-12">
            <div>
              <p className="text-3xl font-bold">10K+</p>
              <p className="text-white/70 text-sm">Active Sellers</p>
            </div>
            <div>
              <p className="text-3xl font-bold">₹50L+</p>
              <p className="text-white/70 text-sm">Daily Payouts</p>
            </div>
            <div>
              <p className="text-3xl font-bold">4.8★</p>
              <p className="text-white/70 text-sm">Avg. Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col p-8">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Logo size="lg" className="justify-center mb-6" />
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                Seller Portal
              </h1>
              <p className="text-muted-foreground">
                Manage your kitchen, orders & earnings
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
                <Link to="/seller/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In to Dashboard'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Want to become a seller?{' '}
                <Link to="/seller/register" className="text-primary font-medium hover:underline">
                  Register Here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
