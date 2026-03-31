import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Settings, Save, RefreshCw, Receipt, Percent, Truck, Wallet, IndianRupee } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface AllSettings {
  // GST Settings
  cgstRate: number;
  sgstRate: number;
  commissionGstRate: number;
  hsnCode: string;
  gstApplicable: boolean;
  
  // Fee Settings
  platformFee: number;
  deliveryFee: number;
  
  // Commission Settings
  commissionRate: number;
  
  // Other
  defaultGSTIN: string;
}

export default function AdminGSTSettings() {
  const [settings, setSettings] = useState<AllSettings>({
    cgstRate: 2.5,
    sgstRate: 2.5,
    commissionGstRate: 18,
    hsnCode: "996331",
    gstApplicable: true,
    platformFee: 5,
    deliveryFee: 40,
    commissionRate: 15,
    defaultGSTIN: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch all settings in parallel
        const [gstRes, platformRes, commissionRes] = await Promise.all([
          apiRequest('/admin/gst'),
          apiRequest('/admin/config'),
          apiRequest('/admin/commission')
        ]);
        
        const newSettings: AllSettings = {
          cgstRate: gstRes?.cgstRate ?? 2.5,
          sgstRate: gstRes?.sgstRate ?? 2.5,
          commissionGstRate: gstRes?.commissionGstRate ?? 18,
          hsnCode: gstRes?.hsnCode ?? "996331",
          gstApplicable: (gstRes?.cgstRate || 0) > 0,
          platformFee: platformRes?.platformFee ?? 5,
          deliveryFee: platformRes?.deliveryFee ?? 40,
          commissionRate: commissionRes?.defaultRate ?? 15,
          defaultGSTIN: gstRes?.gstNumber ?? "",
        };
        
        setSettings(newSettings);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast({ 
          title: "Warning", 
          description: "Using default values. Save settings to update.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (key: keyof AllSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Save all settings to their respective endpoints
      await Promise.all([
        // Save GST Config
        apiRequest('/admin/gst', {
          method: 'PUT',
          body: JSON.stringify({
            cgstRate: settings.cgstRate,
            sgstRate: settings.sgstRate,
            commissionGstRate: settings.commissionGstRate,
            hsnCode: settings.hsnCode,
            gstNumber: settings.defaultGSTIN
          })
        }),
        // Save Platform Config (fees)
        apiRequest('/admin/config', {
          method: 'PUT',
          body: JSON.stringify({
            platformFee: settings.platformFee,
            deliveryFee: settings.deliveryFee
          })
        }),
        // Save Commission Config
        apiRequest('/admin/commission', {
          method: 'PUT',
          body: JSON.stringify({
            defaultRate: settings.commissionRate
          })
        })
      ]);
      
      toast({ 
        title: "Settings Saved!", 
        description: "All GST rates, fees, and commission updated successfully" 
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({ 
        title: "Save Failed", 
        description: "Could not save settings. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <Settings className="h-8 w-8 text-primary animate-spin" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Platform Settings</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
          
          {/* GST Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                GST Configuration (Food Orders)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Enable GST</Label>
                  <p className="text-sm text-muted-foreground">
                    Apply GST on food orders
                  </p>
                </div>
                <Switch
                  checked={settings.gstApplicable}
                  onCheckedChange={(checked) => handleInputChange('gstApplicable', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="cgstRate">CGST (%)</Label>
                  <Input
                    id="cgstRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.cgstRate}
                    onChange={(e) => handleInputChange('cgstRate', parseFloat(e.target.value) || 0)}
                    disabled={!settings.gstApplicable}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Central GST</p>
                </div>
                <div>
                  <Label htmlFor="sgstRate">SGST (%)</Label>
                  <Input
                    id="sgstRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.sgstRate}
                    onChange={(e) => handleInputChange('sgstRate', parseFloat(e.target.value) || 0)}
                    disabled={!settings.gstApplicable}
                  />
                  <p className="text-xs text-muted-foreground mt-1">State GST</p>
                </div>
                <div>
                  <Label htmlFor="commissionGstRate">Commission GST (%)</Label>
                  <Input
                    id="commissionGstRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.commissionGstRate}
                    onChange={(e) => handleInputChange('commissionGstRate', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">On platform fee</p>
                </div>
                <div>
                  <Label htmlFor="hsnCode">HSN Code</Label>
                  <Input
                    id="hsnCode"
                    value={settings.hsnCode}
                    onChange={(e) => handleInputChange('hsnCode', e.target.value)}
                    disabled={!settings.gstApplicable}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Food services</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Platform & Delivery Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platformFee" className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" />
                    Platform Fee (₹)
                  </Label>
                  <Input
                    id="platformFee"
                    type="number"
                    min="0"
                    value={settings.platformFee}
                    onChange={(e) => handleInputChange('platformFee', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Fixed fee per order (goes to admin)
                  </p>
                </div>
                <div>
                  <Label htmlFor="deliveryFee" className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Delivery Fee (₹)
                  </Label>
                  <Input
                    id="deliveryFee"
                    type="number"
                    min="0"
                    value={settings.deliveryFee}
                    onChange={(e) => handleInputChange('deliveryFee', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Paid by customer, goes to delivery partner
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commission Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" />
                Seller Commission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commissionRate">Default Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.commissionRate}
                    onChange={(e) => handleInputChange('commissionRate', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    % deducted from seller's order amount
                  </p>
                </div>
                <div>
                  <Label htmlFor="defaultGSTIN">Platform GSTIN (Optional)</Label>
                  <Input
                    id="defaultGSTIN"
                    placeholder="Enter your GSTIN"
                    value={settings.defaultGSTIN}
                    onChange={(e) => handleInputChange('defaultGSTIN', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    For invoice generation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Card - Centered */}
          <Card className="bg-primary/5 border-primary/20 max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg text-center">Current Configuration Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-card text-center">
                  <p className="text-muted-foreground">Food GST</p>
                  <p className="text-xl font-bold">{settings.cgstRate + settings.sgstRate}%</p>
                  <p className="text-xs text-muted-foreground">CGST {settings.cgstRate}% + SGST {settings.sgstRate}%</p>
                </div>
                <div className="p-3 rounded-lg bg-card text-center">
                  <p className="text-muted-foreground">Platform Fee</p>
                  <p className="text-xl font-bold">₹{settings.platformFee}</p>
                </div>
                <div className="p-3 rounded-lg bg-card text-center">
                  <p className="text-muted-foreground">Delivery Fee</p>
                  <p className="text-xl font-bold">₹{settings.deliveryFee}</p>
                </div>
                <div className="p-3 rounded-lg bg-card text-center">
                  <p className="text-muted-foreground">Commission</p>
                  <p className="text-xl font-bold">{settings.commissionRate}%</p>
                  <p className="text-xs text-muted-foreground">+ {settings.commissionGstRate}% GST</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => setSettings({
                cgstRate: 2.5,
                sgstRate: 2.5,
                commissionGstRate: 18,
                hsnCode: "996331",
                gstApplicable: true,
                platformFee: 5,
                deliveryFee: 40,
                commissionRate: 15,
                defaultGSTIN: "",
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
              {isSaving ? 'Saving...' : 'Save All Settings'}
            </Button>
          </div>
        </div>
  );
}
