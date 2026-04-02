import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function UserLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res: any = await login(email, password, 'user');
      if (res?.user?.role && res.user.role !== 'user') {
        logout('user');
        toast({
          title: 'Use the correct portal',
          description: 'This account is for seller or admin. Open the matching login page.',
          variant: 'destructive',
        });
        return;
      }
      toast({ title: 'Welcome back!', description: 'Login successful' });
      navigate('/');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Invalid credentials';
      toast({ title: 'Login failed', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col p-8">
        {/* Back to Home - Right aligned */}
        <div className="flex justify-end mb-8">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Logo - Centered */}
            <div className="flex justify-center mb-6">
              <Logo className="w-20 h-20" />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                Welcome Back!
              </h1>
              <p className="text-muted-foreground">
                Sign in to order delicious food
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
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-background text-muted-foreground">
                    Are you a seller or admin?
                  </span>
                </div>
              </div>
              
              <div className="flex gap-4 mt-4">
                <Link to="/seller/login" className="flex-1">
                  <Button variant="outline" className="w-full">Seller Login</Button>
                </Link>
                <Link to="/admin/login" className="flex-1">
                  <Button variant="outline" className="w-full">Admin Login</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex flex-1 bg-secondary items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="w-64 h-64 mx-auto mb-8 rounded-full gradient-primary flex items-center justify-center animate-float">
            <span className="text-8xl">🍛</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">
            Craving Something Delicious?
          </h2>
          <p className="text-muted-foreground">
            Order from 500+ home chefs and restaurants. Get your favorite meals delivered in minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
