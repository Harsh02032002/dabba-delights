import { useState } from 'react';
import { UserLayout } from '@/layouts/UserLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

type AccountType = 'user' | 'seller' | 'delivery';

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'user', label: 'Customer' },
  { value: 'seller', label: 'Kitchen / seller' },
  { value: 'delivery', label: 'Delivery partner' },
];

const post = async (path: string, body: unknown, token?: string, method = 'POST') => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).message || 'Something went wrong. Please try again.');
  return data as any;
};

/**
 * Public page (Play Store requirement): anyone can delete their Dabba Nation account
 * without the app by signing in and confirming.
 */
export default function DeleteAccount() {
  const [accountType, setAccountType] = useState<AccountType>('user');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      setError('Type DELETE to confirm.');
      return;
    }
    setBusy(true);
    try {
      const login = accountType === 'delivery'
        ? await post('/partner/login', { identifier, email: identifier, password })
        : await post('/auth/login', { identifier, email: identifier, password, role: accountType });
      if (!login.token) throw new Error(login.message || 'Could not sign in.');
      await post(accountType === 'delivery' ? '/partner/account' : '/auth/account', { confirm: 'DELETE' }, login.token, 'DELETE');
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="text-destructive" size={30} />
          </div>
          <h1 className="text-3xl font-bold mb-3">Delete your Dabba Nation account</h1>
          <p className="text-muted-foreground">
            You can also delete your account inside the app: Settings &rarr; Delete account (customers) or
            Profile &rarr; Delete Account (delivery partners).
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-semibold"><ShieldCheck size={18} /> What happens</div>
            <p><strong className="text-foreground">Deleted:</strong> your name, email, phone number, password, profile photo, saved addresses,
              wishlist, notifications, any remaining wallet balance and, for kitchens and delivery partners, KYC documents and bank details.
              Kitchens are taken offline.</p>
            <p><strong className="text-foreground">Kept without your name:</strong> past orders, invoices and payment records, which we must keep
              for tax and accounting purposes (up to 7 years).</p>
            <p>You cannot delete an account while an order is being prepared or delivered. Deletion is permanent.</p>
          </CardContent>
        </Card>

        {done ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="text-success mx-auto mb-3" size={40} />
              <h2 className="text-xl font-bold mb-2">Your account has been deleted</h2>
              <p className="text-muted-foreground">We are sorry to see you go.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                  <Label>Account type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {ACCOUNT_TYPES.map((t) => (
                      <Button key={t.value} type="button" variant={accountType === t.value ? 'default' : 'outline'} onClick={() => setAccountType(t.value)}>
                        {t.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="del-id">Email or phone</Label>
                  <Input id="del-id" autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="del-pass">Password</Label>
                  <Input id="del-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="del-confirm">Type DELETE to confirm</Label>
                  <Input id="del-confirm" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} required />
                </div>
                {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
                <Button type="submit" variant="destructive" className="w-full" disabled={busy}>
                  {busy ? 'Deleting…' : 'Delete my account'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Signed up with an OTP and never set a password? Use "Forgot password" on the login page first,
                  or email support@dabbanation.com from your registered email address.
                </p>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </UserLayout>
  );
}
