import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authAPI } from '@/lib/api';
import { Mail, Lock, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'user';
  
  const [step, setStep] = useState<'email' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Send reset code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authAPI.forgotPassword(email);
      toast({
        title: 'Code sent!',
        description: 'Check your email for the reset code',
      });
      setStep('reset');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset code',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.resetPassword(email, code, newPassword);
      toast({
        title: 'Success!',
        description: 'Your password has been reset',
      });
      setStep('success');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getLoginPath = () => {
    if (role === 'seller') return '/seller/login';
    if (role === 'admin') return '/admin/login';
    return '/login';
  };

  const getRegisterPath = () => {
    if (role === 'seller') return '/seller/register';
    return '/register';
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col p-8">
        {/* Back to Home */}
        <div className="flex justify-between items-center mb-8">
          <Link 
            to={getLoginPath()} 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Login
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Logo className="w-20 h-20" />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                {step === 'email' && 'Forgot Password?'}
                {step === 'reset' && 'Reset Password'}
                {step === 'success' && 'Password Reset!'}
              </h1>
              <p className="text-muted-foreground">
                {step === 'email' && "Enter your email and we'll send you a reset code"}
                {step === 'reset' && 'Enter the code from your email and your new password'}
                {step === 'success' && 'Your password has been reset successfully'}
              </p>
            </div>

            {/* Step 1: Email Form */}
            {step === 'email' && (
              <form onSubmit={handleSendCode} className="space-y-5">
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

                <Button 
                  type="submit" 
                  variant="gradient" 
                  size="lg" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Code'
                  )}
                </Button>
              </form>
            )}

            {/* Step 2: Reset Form */}
            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="code">Reset Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-12 text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="gradient" 
                  size="lg" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-sm text-primary hover:underline"
                  >
                    Didn't receive code? Try again
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success */}
            {step === 'success' && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                
                <p className="text-muted-foreground">
                  You can now log in with your new password
                </p>

                <Button 
                  variant="gradient" 
                  size="lg" 
                  className="w-full"
                  onClick={() => navigate(getLoginPath())}
                >
                  Go to Login
                </Button>
              </div>
            )}

            {/* Register Link */}
            {step !== 'success' && (
              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to={getRegisterPath()} className="text-primary font-medium hover:underline">
                    Sign Up
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 to-orange-500/20 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="w-48 h-48 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-2xl">
            <span className="text-8xl">🔐</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">
            Secure Your Account
          </h2>
          <p className="text-muted-foreground">
            We take your security seriously. Reset your password quickly and securely.
          </p>
        </div>
      </div>
    </div>
  );
}
