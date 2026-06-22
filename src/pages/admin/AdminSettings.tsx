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
  Phone,
  Clock,
  Trash2,
  Plus,
  ShieldCheck,
  ReceiptText,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { authAPI } from "@/lib/api";

// ── Sections Editor (for static pages) ───────────────────────────────────────
type Section = { title: string; content: string };

function SectionsEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const sections: Section[] = useMemo(() => {
    try {
      return JSON.parse(value || "[]");
    } catch {
      return [];
    }
  }, [value]);

  const update = (next: Section[]) => onChange(JSON.stringify(next));

  const set = (i: number, field: keyof Section, val: string) => {
    const next = sections.map((s, idx) =>
      idx === i ? { ...s, [field]: val } : s,
    );
    update(next);
  };

  const remove = (i: number) => update(sections.filter((_, idx) => idx !== i));

  const add = () => update([...sections, { title: "", content: "" }]);

  return (
    <div className="space-y-4">
      {sections.map((s, i) => (
        <div
          key={i}
          className="border border-border rounded-xl p-4 space-y-3 bg-secondary/30"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider w-5">
              {i + 1}
            </span>
            <Input
              value={s.title}
              onChange={(e) => set(i, "title", e.target.value)}
              placeholder="Section heading (e.g. 1. Information We Collect)"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10 shrink-0"
              onClick={() => remove(i)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
          <Textarea
            rows={3}
            value={s.content}
            onChange={(e) => set(i, "content", e.target.value)}
            placeholder="Section content. Bullet points ke liye • likh ke start karo. Nayi line ke liye Enter dabo."
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={add}
      >
        <Plus size={15} /> Section Add Karo
      </Button>
    </div>
  );
}

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
      // Invalidate both keys so footer, about us, contact & static pages update instantly
      queryClient.invalidateQueries({ queryKey: ["admin-platform-config"] });
      queryClient.invalidateQueries({ queryKey: ["platform-config"] });
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

        {/* Contact Us Page */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Phone size={20} /> Contact Us Page
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Phone, email aur address footer & Contact Us page dono pe update
              ho jayega.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Support Phone</Label>
                <Input
                  value={config.supportPhone || ""}
                  onChange={(e) =>
                    setConfig({ ...config, supportPhone: e.target.value })
                  }
                  placeholder="+91 73030 23539"
                />
              </div>
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input
                  value={config.supportEmail || ""}
                  onChange={(e) =>
                    setConfig({ ...config, supportEmail: e.target.value })
                  }
                  placeholder="support@dabbanation.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                Office Address (footer & contact page dono mein dikhega)
              </Label>
              <Input
                value={config.footerAddress || ""}
                onChange={(e) =>
                  setConfig({ ...config, footerAddress: e.target.value })
                }
                placeholder="East Shastri Nagar, Ram Gulam Tola, Deoria 274001"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Clock size={14} /> Working Hours
              </Label>
              <Input
                value={config.contactWorkingHours || ""}
                onChange={(e) =>
                  setConfig({ ...config, contactWorkingHours: e.target.value })
                }
                placeholder="Monday – Saturday, 9:00 AM – 9:00 PM IST"
              />
            </div>
            <div className="space-y-2">
              <Label>Footer Copyright Line (neeche wali line)</Label>
              <Input
                value={config.footerCopyright || ""}
                onChange={(e) =>
                  setConfig({ ...config, footerCopyright: e.target.value })
                }
                placeholder="Made with ❤️ in India"
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy Sections */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <ShieldCheck size={20} /> Privacy Policy Content
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Har section ka heading aur content change karo. Bullet points ke
              liye • se shuru karo.
            </p>
          </CardHeader>
          <CardContent>
            <SectionsEditor
              value={config.privacyPageContent || "[]"}
              onChange={(v) => setConfig({ ...config, privacyPageContent: v })}
            />
          </CardContent>
        </Card>

        {/* Terms of Service Sections */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <FileText size={20} /> Terms of Service Content
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Har section ka heading aur content change karo.
            </p>
          </CardHeader>
          <CardContent>
            <SectionsEditor
              value={config.termsPageContent || "[]"}
              onChange={(v) => setConfig({ ...config, termsPageContent: v })}
            />
          </CardContent>
        </Card>

        {/* Refund Policy Sections */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <ReceiptText size={20} /> Refund & Cancellation Policy Content
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Har section ka heading aur content change karo.
            </p>
          </CardHeader>
          <CardContent>
            <SectionsEditor
              value={config.refundPageContent || "[]"}
              onChange={(v) => setConfig({ ...config, refundPageContent: v })}
            />
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
