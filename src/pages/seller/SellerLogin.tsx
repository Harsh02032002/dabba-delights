import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Phone, Lock, ArrowLeft, Store, KeyRound, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function SellerLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpTargetInfo, setOtpTargetInfo] = useState<{ maskedEmail?: string; maskedPhone?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { sendLoginOtp, verifyLoginOtp, logout } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast({ title: 'Required', description: 'Please enter your Email or Phone Number', variant: 'destructive' });
      return;
    }
    if (loginMode === 'password' && !password) {
      toast({ title: 'Required', description: 'Please enter your password', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const res: any = await sendLoginOtp(
        identifier.trim(),
        loginMode === 'password' ? password : undefined,
        'seller'
      );
      setOtpTargetInfo({
        maskedEmail: res?.maskedEmail,
        maskedPhone: res?.maskedPhone,
      });
      setOtpStep(true);
      toast({
        title: 'OTP Sent!',
        description: res?.message || '6-digit OTP has been sent to your Email & Phone number.',
      });
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      toast({ title: 'Invalid OTP', description: 'Please enter the 6-digit OTP', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyLoginOtp(identifier.trim(), otp.trim(), 'seller');

      if (res.user.role !== 'seller') {
        logout('seller');
        toast({
          title: 'Access Denied',
          description: 'This account is not registered as seller',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Welcome back!',
        description: 'Seller login successful',
      });

      navigate('/seller');
    } catch (error: any) {
      toast({
        title: 'OTP Verification Failed',
        description: error.message || 'Invalid or expired OTP',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const res: any = await sendLoginOtp(
        identifier.trim(),
        loginMode === 'password' ? password : undefined,
        'seller'
      );
      toast({
        title: 'OTP Resent!',
        description: res?.message || 'A new 6-digit OTP has been sent to your Email & Phone.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend OTP',
        variant: 'destructive',
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
        <div className="flex justify-end mb-8">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} /> Back to Home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-6">
              <Logo className="w-20 h-20" />
            </div>

            <div className="mb-6 text-center">
              <h1 className="mb-2 font-display text-3xl font-bold text-foreground">
                {otpStep ? 'Verify Seller OTP' : 'Seller Portal'}
              </h1>
              <p className="text-muted-foreground">
                {otpStep
                  ? `Enter the 6-digit OTP sent to ${[otpTargetInfo.maskedEmail, otpTargetInfo.maskedPhone].filter(Boolean).join(' & ') || 'your Email & Phone'}`
                  : 'Sign in with your Email or Phone Number'}
              </p>
            </div>

            {!otpStep ? (
              <>
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => setLoginMode('password')}
                    className={`py-2 text-sm font-medium rounded-lg transition-all ${
                      loginMode === 'password'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Password + OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMode('otp')}
                    className={`py-2 text-sm font-medium rounded-lg transition-all ${
                      loginMode === 'otp'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Direct OTP Login
                  </button>
                </div>

                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <div className="space-y-2">
                    <Label>Email or Phone Number</Label>
                    <div className="relative">
                      {/^\d+$/.test(identifier.replace(/\+/g, '')) && identifier.length > 0 ? (
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      ) : (
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      )}
                      <Input
                        type="text"
                        placeholder="Enter Seller Email or 10-digit Phone"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="h-12 pl-10"
                        required
                      />
                    </div>
                  </div>

                  {loginMode === 'password' && (
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
                  )}

                  <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending OTP...' : 'Continue & Send OTP'}
                  </Button>

                  <div className="text-center">
                    <Link to="/forgot-password?role=seller" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <Label>6-Digit OTP (Sent via SMS & Email)</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="pl-10 h-12 tracking-[0.4em] font-bold text-lg text-center"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Verifying OTP...' : 'Verify OTP & Open Dashboard'}
                </Button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(false);
                      setOtp('');
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Change Email / Phone
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
                  >
                    <RefreshCw size={14} />
                    Resend OTP
                  </button>
                </div>
              </form>
            )}

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
