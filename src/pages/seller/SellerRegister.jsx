import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  Mail,
  Lock,
  User,
  Phone,
  Store,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SellerRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    businessName: "",
    address: "",
  });

  const [showPass, setShowPass] = useState(false);

  // ✅ FIXED mutation
  const mutation = useMutation({
    mutationFn: async () => {
      console.log("Sending Data:", form); // debugging
      return await authAPI.sellerRegister(form);
    },

    onSuccess: () => {
      toast({ title: "Seller account created successfully!" });
      navigate("/seller/login");
    },

    onError: (err) => {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message || err.message || "Registration failed",
        variant: "destructive",
      });
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo className="mx-auto" />
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Become a Seller
          </h2>
          <p className="mt-2 text-muted-foreground">
            Start your home kitchen business with Dabba Nation
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              icon={<User size={16} />}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              icon={<Mail size={16} />}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              icon={<Phone size={16} />}
              required
            />
          </div>

          <div>
            <Label htmlFor="businessName">Business / Kitchen Name</Label>
            <Input
              id="businessName"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              icon={<Store size={16} />}
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Full Address</Label>
            <Input
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              icon={<MapPin size={16} />}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              icon={<Lock size={16} />}
              endIcon={
                showPass ? (
                  <EyeOff
                    size={16}
                    onClick={() => setShowPass(false)}
                    className="cursor-pointer"
                  />
                ) : (
                  <Eye
                    size={16}
                    onClick={() => setShowPass(true)}
                    className="cursor-pointer"
                  />
                )
              }
              required
            />
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? "Creating seller account..."
              : "Register as Seller"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already a seller?{" "}
          <Link
            to="/seller/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
