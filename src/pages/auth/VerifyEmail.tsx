import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialEmail = (location.state as any)?.email || params.get("email") || "";
  const role = (location.state as any)?.role || params.get("role") || "user";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.verifyEmail(email, code);
      toast({ title: "Email verified", description: "You can now sign in." });
      navigate(role === "seller" ? "/seller/login" : "/login");
    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: err?.message || "Invalid or expired code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo className="mx-auto" />
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Verify your email
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">
            We&apos;ve sent a 6-digit code to your email. Enter it below to activate your account.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>
      </div>
    </div>
  );
}

