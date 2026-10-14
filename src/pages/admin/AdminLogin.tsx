import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Phone, Lock, ArrowLeft, Shield, KeyRound, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminLogin() {
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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast({ title: 'Required', description: 'Please enter Admin Email or Phone Number', variant: 'destructive' });
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
        'admin'
      );
      setOtpTargetInfo({
        maskedEmail: res?.maskedEmail,
        maskedPhone: res?.maskedPhone,
      });
      setOtpStep(true);
      toast({
        title: 'OTP Sent!',
        description: res?.message || '6-digit OTP has been sent to Admin Email & Phone.',
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Invalid credentials';
      toast({ title: 'Login failed', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      toast({ title: 'Invalid OTP', description: 'Please enter the 6-digit OTP', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const res: any = await verifyLoginOtp(identifier.trim(), otp.trim(), 'admin');
      if (res?.user?.role !== 'admin') {
        logout('admin');
        toast({
          title: 'Access Denied',
          description: 'This account is not an admin',
          variant: 'destructive',
        });
        return;
      }
      toast({ title: 'Welcome!', description: 'Admin login successful' });
      navigate('/admin');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Invalid or expired OTP';
      toast({ title: 'OTP Verification Failed', description: msg, variant: 'destructive' });
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
        'admin'
      );
      toast({
        title: 'OTP Resent!',
        description: res?.message || 'A new 6-digit OTP has been sent to Admin Email & Phone.',
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to resend OTP';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-foreground p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-xl">
          <div className="flex justify-center mb-6">
            <Logo className="w-20 h-20" />
          </div>

          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 gradient-primary rounded-2xl flex items-center justify-center">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              {otpStep ? 'Verify Admin OTP' : 'Admin Portal'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {otpStep
                ? `Enter the 6-digit OTP sent to ${[otpTargetInfo.maskedEmail, otpTargetInfo.maskedPhone].filter(Boolean).join(' & ') || 'your Email & Phone'}`
                : 'Sign in with Admin Email or Phone Number'}
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
                  <Label htmlFor="identifier">Admin Email or Phone Number</Label>
                  <div className="relative">
                    {/^\d+$/.test(identifier.replace(/\+/g, '')) && identifier.length > 0 ? (
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    ) : (
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    )}
                    <Input
                      id="identifier"
                      type="text"
                      placeholder="admin@dabbanation.com or 10-digit Phone"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                {loginMode === 'password' && (
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
                )}

                <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending OTP...' : 'Continue & Send OTP'}
                </Button>
              </form>
            </>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="otp">6-Digit OTP (Sent via SMS & Email)</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="otp"
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

              <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying OTP...' : 'Verify OTP & Access Admin Panel'}
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

          <p className="text-xs text-muted-foreground text-center mt-6">
            This portal is restricted to authorized personnel only.
            <br />
            All activities are logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
