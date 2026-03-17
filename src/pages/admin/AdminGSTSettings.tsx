import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Settings, Save, RefreshCw, Receipt, Percent } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { AdminLayout } from "@/layouts/AdminLayout";

interface GSTSettings {
  platformGSTEnabled: boolean;
  platformCommissionRate: number;
  platformGSTRate: number;
  gstApplicable: boolean;
  defaultGSTIN: string;
  invoicePrefix: string;
}

export default function AdminGSTSettings() {
  const [settings, setSettings] = useState<GSTSettings>({
    platformGSTEnabled: false,
    platformCommissionRate: 0,
    platformGSTRate: 0,
    gstApplicable: false,
    defaultGSTIN: "",
    invoicePrefix: "DN"
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiRequest('/admin/gst/settings');
        if (response?.success && response?.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch GST settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (key: keyof GSTSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await apiRequest('/admin/gst/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      
      if (response?.success) {
        toast({ 
          title: "GST Settings Saved!", 
          description: "All GST rates have been updated successfully" 
        });
      } else {
        throw new Error(response?.message || "Failed to save settings");
      }
    } catch (error) {
      console.error('Failed to save GST settings:', error);
      toast({ 
        title: "Save Failed", 
        description: error.message || "Could not save GST settings", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto max-w-4xl p-6">
          <div className="flex items-center gap-4 mb-8">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">GST Settings</h1>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto max-w-4xl p-6">
        <div className="flex items-center gap-4 mb-8">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">GST Settings</h1>
            <p className="text-muted-foreground">Configure GST rates and tax settings for your platform</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Master GST Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Master GST Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Enable GST System</Label>
                  <p className="text-sm text-muted-foreground">
                    Turn on to apply GST on all orders. When disabled, all GST rates will be 0%.
                  </p>
                </div>
                <Switch
                  checked={settings.gstApplicable}
                  onCheckedChange={(checked) => handleInputChange('gstApplicable', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultGSTIN">Default GSTIN</Label>
                  <Input
                    id="defaultGSTIN"
                    placeholder="Enter company GSTIN"
                    value={settings.defaultGSTIN}
                    onChange={(e) => handleInputChange('defaultGSTIN', e.target.value)}
                    disabled={!settings.gstApplicable}
                  />
                </div>
                <div>
                  <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    placeholder="Invoice number prefix"
                    value={settings.invoicePrefix}
                    onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                    disabled={!settings.gstApplicable}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Commission GST */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Platform Commission GST
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Enable GST on Platform Commission</Label>
                  <p className="text-sm text-muted-foreground">
                    Apply GST on platform commission charged to sellers.
                  </p>
                </div>
                <Switch
                  checked={settings.platformGSTEnabled}
                  onCheckedChange={(checked) => handleInputChange('platformGSTEnabled', checked)}
                  disabled={!settings.gstApplicable}
                />
              </div>
              
              {settings.platformGSTEnabled && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="platformCommission">Commission Rate (%)</Label>
                      <Input
                        id="platformCommission"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="7.0"
                        value={settings.platformCommissionRate}
                        onChange={(e) => {
                          const commissionRate = parseFloat(e.target.value) || 0;
                          handleInputChange('platformCommissionRate', commissionRate);
                          // Auto-set GST to 18% when commission is entered
                          if (commissionRate > 0 && settings.platformGSTRate === 0) {
                            handleInputChange('platformGSTRate', 18);
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="platformGST">GST on Commission (%)</Label>
                      <Input
                        id="platformGST"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="18.0"
                        value={settings.platformGSTRate}
                        onChange={(e) => handleInputChange('platformGSTRate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => setSettings({
                platformGSTEnabled: false,
                platformCommissionRate: 0,
                platformGSTRate: 0,
                gstApplicable: false,
                defaultGSTIN: "",
                invoicePrefix: "DN"
              })}
              disabled={isSaving}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button
              onClick={saveSettings}
              disabled={isSaving}
              className="gradient-primary text-primary-foreground"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
