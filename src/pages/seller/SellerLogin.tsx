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

  // ---------- SUBMIT ----------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 🔥 universal login hit hoga (/auth/login)
      const res = await login(email, password, 'seller');

      // 🧠 role check
      if (res.user.role !== "seller") {
        toast({
          title: "Access Denied",
          description: "This account is not registered as seller",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: "Seller login successful"
      });

      navigate('/seller'); // dashboard

    } catch (error: any) {

      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive"
      });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">

      {/* Left Side */}
      <div className="gradient-primary hidden flex-1 items-center justify-center p-12 lg:flex">
        <div className="max-w-lg text-center text-white">
          <div className="animate-float mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-3xl bg-white/20">
            <Store size={64} className="text-white" />
          </div>

          <h2 className="mb-4 font-display text-3xl font-bold">
            Grow Your Food Business
          </h2>

          <p className="text-white/80">
            Join thousands of home chefs and restaurants earning through Dabba Nation.
            Manage orders, track earnings, and grow your customer base.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex flex-1 flex-col p-8">

        {/* Back to Home - Right aligned */}
        <div className="flex justify-end mb-8">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} /> Back to Home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">

            {/* Logo - Centered */}
            <div className="flex justify-center mb-6">
              <Logo className="w-20 h-20" />
            </div>

            <div className="mb-8 text-center">
              <h1 className="mb-2 font-display text-3xl font-bold text-foreground">
                Seller Portal
              </h1>
              <p className="text-muted-foreground">
                Manage your kitchen, orders & earnings
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* EMAIL */}
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-10"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-10 pr-10"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In to Dashboard'}
              </Button>

              <div className="text-center">
                <Link to="/forgot-password?role=seller" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Want to become a seller?{' '}
                <Link to="/seller/register" className="font-medium text-primary hover:underline">
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
