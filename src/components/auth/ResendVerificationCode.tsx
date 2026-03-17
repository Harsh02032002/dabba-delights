import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, Mail } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Link } from "react-router-dom";

export default function ResendVerificationCode() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResendCode = async () => {
    if (!email) {
      toast({ title: "Email Required", description: "Please enter your email address", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      if (response?.success) {
        toast({ 
          title: "Code Sent! 🎉", 
          description: "Please check your email for the new verification code." 
        });
      } else {
        throw new Error(response?.message || "Failed to send code");
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to send verification code", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Resend Verification Code</h1>
          <p className="text-muted-foreground">Enter your email to receive a new verification code</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleResendCode} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend Verification Code
              </>
            )}
          </Button>

          <div className="text-center">
            <Link to="/verify-email" className="text-orange-500 hover:text-orange-600 text-sm">
              ← Back to Verification Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
