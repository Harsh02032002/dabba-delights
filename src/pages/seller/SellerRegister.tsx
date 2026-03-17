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
  FileText,
  Building,
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
    type: "home_chef",
    // GST Fields
    panNumber: "",
    isGstRegistered: false,
    gstinNumber: "",
    gstType: "regular",
    registeredBusinessAddress: "",
  });

  const [showPass, setShowPass] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      console.log("Sending Data:", form);
      return await authAPI.sellerRegister(form);
    },

    onSuccess: () => {
      toast({
        title: "Seller account created successfully!",
        description: "Please verify your email to activate your seller account.",
      });
      navigate(`/verify-email?email=${encodeURIComponent(form.email)}&role=seller`);
    },

    onError: (err: any) => {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message || err.message || "Registration failed",
        variant: "destructive",
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
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
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="businessName">Business / Kitchen Name</Label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="businessName"
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="type">Business Type</Label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="home_chef">Home Chef</option>
              <option value="restaurant">Restaurant</option>
              <option value="cloud_kitchen">Cloud Kitchen</option>
              <option value="catering">Catering</option>
            </select>
          </div>

          <div>
            <Label htmlFor="address">Full Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* PAN Number */}
          <div>
            <Label htmlFor="panNumber">PAN Number</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="panNumber"
                name="panNumber"
                value={form.panNumber}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                className="pl-10 uppercase"
                maxLength={10}
              />
            </div>
          </div>

          {/* GST Registration Toggle */}
          <div className="space-y-3">
            <Label className="text-base font-medium">GST Registration</Label>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isGstRegistered"
                checked={form.isGstRegistered}
                onChange={(e) => setForm(prev => ({ 
                  ...prev, 
                  isGstRegistered: e.target.checked,
                  gstinNumber: e.target.checked ? prev.gstinNumber : "",
                  gstType: e.target.checked ? prev.gstType : "regular",
                  registeredBusinessAddress: e.target.checked ? prev.registeredBusinessAddress : ""
                }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <Label htmlFor="isGstRegistered" className="text-sm">
                I am GST Registered
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              {form.isGstRegistered ? "GST registered seller" : "Unregistered seller"}
            </p>
          </div>

          {/* GST Fields - Show only if GST Registered */}
          {form.isGstRegistered && (
            <div className="space-y-4 p-4 border border-orange-200 rounded-lg bg-orange-50">
              <h3 className="text-sm font-medium text-orange-900 flex items-center gap-2">
                <Building size={16} />
                GST Details
              </h3>
              
              {/* GSTIN Number */}
              <div>
                <Label htmlFor="gstinNumber">GSTIN Number</Label>
                <Input
                  id="gstinNumber"
                  name="gstinNumber"
                  value={form.gstinNumber}
                  onChange={handleChange}
                  placeholder="12ABCDE1234F1ZV"
                  className="uppercase"
                  maxLength={15}
                />
              </div>

              {/* GST Type */}
              <div>
                <Label htmlFor="gstType">GST Type</Label>
                <select
                  id="gstType"
                  name="gstType"
                  value={form.gstType}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="regular">Regular</option>
                  <option value="composition">Composition</option>
                </select>
              </div>

              {/* Registered Business Address */}
              <div>
                <Label htmlFor="registeredBusinessAddress">Registered Business Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="registeredBusinessAddress"
                    name="registeredBusinessAddress"
                    value={form.registeredBusinessAddress}
                    onChange={handleChange}
                    placeholder="Enter registered business address"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="password"
                name="password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
