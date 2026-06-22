import { AdminLayout } from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  Settings,
  Bell,
  Lock,
  Globe,
  Save,
  Share2,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { authAPI } from "@/lib/api";

// Password Changer Component
function AdminPasswordChanger() {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast({ title: "Error", description: "All fields are required" });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({ title: "Error", description: "New passwords do not match" });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Password updated successfully",
        });
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update password",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label>Current Password</Label>
        <Input
          type="password"
          value={passwords.current}
          onChange={(e) =>
            setPasswords({ ...passwords, current: e.target.value })
          }
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>New Password</Label>
          <Input
            type="password"
            value={passwords.new}
            onChange={(e) =>
              setPasswords({ ...passwords, new: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Confirm Password</Label>
          <Input
            type="password"
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords({ ...passwords, confirm: e.target.value })
            }
          />
        </div>
      </div>
      <Button
        variant="outline"
        onClick={handlePasswordChange}
        disabled={isLoading}
      >
        {isLoading ? "Updating..." : "Update Password"}
      </Button>
    </>
  );
}

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<any>({});

  const { data } = useQuery({
    queryKey: ["admin-platform-config"],
    queryFn: () => adminAPI.getPlatformConfig(),
  });

  useEffect(() => {
    if (data) setConfig(data);
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminAPI.updatePlatformConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-platform-config"] });
      toast({ title: "Settings updated" });
    },
  });

  return (
    <AdminLayout
      title="Platform Settings"
      subtitle="Configure global platform settings"
    >
      <div className="space-y-6 max-w-3xl">
        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Globe size={20} /> General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform Name</Label>
                <Input
                  value={config.platformName || ""}
                  onChange={(e) =>
                    setConfig({ ...config, platformName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input
                  value={config.supportEmail || ""}
                  onChange={(e) =>
                    setConfig({ ...config, supportEmail: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Support Phone</Label>
              <Input
                value={config.supportPhone || ""}
                onChange={(e) =>
                  setConfig({ ...config, supportPhone: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Fees — matches PlatformConfig in DB */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Settings size={20} /> Delivery & platform fee
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              These values are stored in the database. Leave a field empty and
              save to skip updating it. Customer checkout uses{" "}
              <strong>delivery fee</strong> from here; platform fee is for
              internal records (not added to customer total — commission is set
              under GST settings).
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Delivery charge (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={config.deliveryFee ?? ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      deliveryFee:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  placeholder="e.g. 40"
                />
              </div>
              <div className="space-y-2">
                <Label>Platform fee (₹) — internal / settlement</Label>
                <Input
                  type="number"
                  min={0}
                  value={config.platformFee ?? ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      platformFee:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  placeholder="e.g. 5"
                />
              </div>
              <div className="space-y-2">
                <Label>Free delivery above (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={config.freeDeliveryThreshold ?? ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      freeDeliveryThreshold:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  placeholder="e.g. 500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Bell size={20} /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: "emailNotifications",
                label: "Email Notifications",
                desc: "Send email alerts for critical events",
              },
              {
                key: "smsNotifications",
                label: "SMS Notifications",
                desc: "Send SMS for order updates",
              },
              {
                key: "pushNotifications",
                label: "Push Notifications",
                desc: "Enable push notifications",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"
              >
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={config[item.key] || false}
                  onCheckedChange={(v) =>
                    setConfig({ ...config, [item.key]: v })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Lock size={20} /> Admin Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdminPasswordChanger />
          </CardContent>
        </Card>

        {/* Footer & Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Share2 size={20} /> Footer & Social Links
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Yahan se footer ka address, tagline aur social media links change
              kar sakte hain.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Footer Tagline</Label>
              <Input
                value={config.footerTagline || ""}
                onChange={(e) =>
                  setConfig({ ...config, footerTagline: e.target.value })
                }
                placeholder="Your trusted food delivery partner..."
              />
            </div>
            <div className="space-y-2">
              <Label>Footer Address</Label>
              <Input
                value={config.footerAddress || ""}
                onChange={(e) =>
                  setConfig({ ...config, footerAddress: e.target.value })
                }
                placeholder="East Shastri Nagar, Ram Gulam Tola, Deoria 274001"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>YouTube Link</Label>
                <Input
                  value={config.socialYoutube || ""}
                  onChange={(e) =>
                    setConfig({ ...config, socialYoutube: e.target.value })
                  }
                  placeholder="https://youtube.com/@..."
                />
              </div>
              <div className="space-y-2">
                <Label>Instagram Link</Label>
                <Input
                  value={config.socialInstagram || ""}
                  onChange={(e) =>
                    setConfig({ ...config, socialInstagram: e.target.value })
                  }
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Facebook Link</Label>
                <Input
                  value={config.socialFacebook || ""}
                  onChange={(e) =>
                    setConfig({ ...config, socialFacebook: e.target.value })
                  }
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn Link</Label>
                <Input
                  value={config.socialLinkedin || ""}
                  onChange={(e) =>
                    setConfig({ ...config, socialLinkedin: e.target.value })
                  }
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Us Page Content */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <FileText size={20} /> About Us Page Content
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Yahan se About Us page ka saara content change kar sakte hain —
              style aisi hi rahegi.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tagline (Hero heading ke neeche)</Label>
              <Input
                value={config.aboutTagline || ""}
                onChange={(e) =>
                  setConfig({ ...config, aboutTagline: e.target.value })
                }
                placeholder="Empowering Home Chefs & Restaurants Across India"
              />
            </div>
            <div className="space-y-2">
              <Label>
                Introduction (2-3 paragraphs, alag karne ke liye ek blank line
                chhode)
              </Label>
              <Textarea
                rows={6}
                value={config.aboutIntro || ""}
                onChange={(e) =>
                  setConfig({ ...config, aboutIntro: e.target.value })
                }
                placeholder="Dabba Nation is an Indian food-tech platform..."
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mission Statement</Label>
                <Textarea
                  rows={3}
                  value={config.aboutMission || ""}
                  onChange={(e) =>
                    setConfig({ ...config, aboutMission: e.target.value })
                  }
                  placeholder="To empower home chefs..."
                />
              </div>
              <div className="space-y-2">
                <Label>Vision Statement</Label>
                <Textarea
                  rows={3}
                  value={config.aboutVision || ""}
                  onChange={(e) =>
                    setConfig({ ...config, aboutVision: e.target.value })
                  }
                  placeholder="To become India's most trusted food ecosystem..."
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Founder Name</Label>
                <Input
                  value={config.aboutFounderName || ""}
                  onChange={(e) =>
                    setConfig({ ...config, aboutFounderName: e.target.value })
                  }
                  placeholder="Akash Dwivedi"
                />
              </div>
              <div className="space-y-2">
                <Label>Tech Lead Name</Label>
                <Input
                  value={config.aboutTechLeadName || ""}
                  onChange={(e) =>
                    setConfig({ ...config, aboutTechLeadName: e.target.value })
                  }
                  placeholder="Harshdeep"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                Founder Description (blank line se paragraphs alag karo)
              </Label>
              <Textarea
                rows={4}
                value={config.aboutFounderDesc || ""}
                onChange={(e) =>
                  setConfig({ ...config, aboutFounderDesc: e.target.value })
                }
                placeholder="Driven by a passion for entrepreneurship..."
              />
            </div>
            <div className="space-y-2">
              <Label>Tech Lead Description</Label>
              <Textarea
                rows={3}
                value={config.aboutTechLeadDesc || ""}
                onChange={(e) =>
                  setConfig({ ...config, aboutTechLeadDesc: e.target.value })
                }
                placeholder="The technical development..."
              />
            </div>
            <div className="space-y-2">
              <Label>MSME / Udyam Registration Number</Label>
              <Input
                value={config.aboutUdyamNumber || ""}
                onChange={(e) =>
                  setConfig({ ...config, aboutUdyamNumber: e.target.value })
                }
                placeholder="UDYAM-UP-21-0060612"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          variant="gradient"
          className="gap-2"
          onClick={() => {
            const payload: Record<string, unknown> = { ...config };
            for (const k of [
              "deliveryFee",
              "platformFee",
              "freeDeliveryThreshold",
            ]) {
              if (payload[k] === "") payload[k] = 0;
            }
            updateMutation.mutate(payload);
          }}
          disabled={updateMutation.isPending}
        >
          <Save size={18} />{" "}
          {updateMutation.isPending ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </AdminLayout>
  );
}
