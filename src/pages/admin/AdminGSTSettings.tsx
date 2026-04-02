import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Settings, Save, Receipt, Percent } from "lucide-react";
import { adminAPI } from "@/lib/api";

type GSTForm = {
  gstApplicable: boolean;
  foodGSTEnabled: boolean;
  foodCGST: number;
  foodSGST: number;
  foodIGST: number;
  platformGSTEnabled: boolean;
  commissionRate: number;
  commissionGST: number;
  deliveryGSTEnabled: boolean;
  deliveryCGST: number;
  deliverySGST: number;
  deliveryIGST: number;
  defaultGSTIN: string;
  invoicePrefix: string;
};

const defaultForm: GSTForm = {
  gstApplicable: false,
  foodGSTEnabled: false,
  foodCGST: 0,
  foodSGST: 0,
  foodIGST: 0,
  platformGSTEnabled: false,
  commissionRate: 0,
  commissionGST: 0,
  deliveryGSTEnabled: false,
  deliveryCGST: 0,
  deliverySGST: 0,
  deliveryIGST: 0,
  defaultGSTIN: "",
  invoicePrefix: "DN",
};

export default function AdminGSTSettings() {
  const [form, setForm] = useState<GSTForm>(defaultForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res: any = await adminAPI.getGSTSettingsDoc();
        const d = res?.data ?? res;
        if (cancelled || !d) return;
        setForm({
          gstApplicable: !!d.gstApplicable,
          foodGSTEnabled: !!d.foodGSTEnabled,
          foodCGST: Number(d.foodCGSTRate) || 0,
          foodSGST: Number(d.foodSGSTRate) || 0,
          foodIGST: Number(d.foodIGSTRate) || 0,
          platformGSTEnabled: !!d.platformGSTEnabled,
          commissionRate: Number(d.platformCommissionRate) || 0,
          commissionGST: Number(d.platformGSTRate) || 0,
          deliveryGSTEnabled: !!d.deliveryGSTEnabled,
          deliveryCGST: Number(d.deliveryCGSTRate) || 0,
          deliverySGST: Number(d.deliverySGSTRate) || 0,
          deliveryIGST: Number(d.deliveryIGSTRate) || 0,
          defaultGSTIN: d.defaultGSTIN || "",
          invoicePrefix: d.invoicePrefix || "DN",
        });
      } catch {
        toast({
          title: "Could not load GST settings",
          description: "Defaults shown; save to create settings.",
          variant: "destructive",
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const patch = (k: keyof GSTForm, v: boolean | number | string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    setIsSaving(true);
    try {
      await adminAPI.saveGSTSettingsDoc({
        gstApplicable: form.gstApplicable,
        foodGSTEnabled: form.foodGSTEnabled,
        foodCGSTRate: form.foodCGST,
        foodSGSTRate: form.foodSGST,
        foodIGSTRate: form.foodIGST,
        platformGSTEnabled: form.platformGSTEnabled,
        commissionRate: form.commissionRate,
        commissionGST: form.commissionGST,
        deliveryGSTEnabled: form.deliveryGSTEnabled,
        deliveryCGSTRate: form.deliveryCGST,
        deliverySGSTRate: form.deliverySGST,
        deliveryIGSTRate: form.deliveryIGST,
        defaultGSTIN: form.defaultGSTIN || "",
        invoicePrefix: form.invoicePrefix || "DN",
      });
      toast({
        title: "Saved",
        description: "GST settings updated. Customer checkout shows food + delivery tax only; commission is for platform settlement.",
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Save failed";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center gap-3">
        <Settings className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading GST settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            GST — customer vs platform
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            <strong>Food GST (CGST/SGST or IGST)</strong> is what the customer sees and pays — collected on behalf of the seller.
            <strong className="block mt-1">Commission % + GST on commission</strong> are for Dabba Nation only (not added to customer total).
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">GST applicable</Label>
              <p className="text-sm text-muted-foreground">Master switch</p>
            </div>
            <Switch checked={form.gstApplicable} onCheckedChange={(c) => patch("gstApplicable", c)} />
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <Label>Food GST</Label>
            <Switch
              checked={form.foodGSTEnabled}
              onCheckedChange={(c) => patch("foodGSTEnabled", c)}
              disabled={!form.gstApplicable}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Same state: CGST + SGST on item subtotal. Different state: IGST — use IGST % below, or leave 0 to use CGST+SGST sum.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>CGST %</Label>
              <Input
                type="number"
                step={0.01}
                min={0}
                value={form.foodCGST}
                disabled={!form.gstApplicable || !form.foodGSTEnabled}
                onChange={(e) => patch("foodCGST", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>SGST %</Label>
              <Input
                type="number"
                step={0.01}
                min={0}
                value={form.foodSGST}
                disabled={!form.gstApplicable || !form.foodGSTEnabled}
                onChange={(e) => patch("foodSGST", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>IGST % (inter-state)</Label>
              <Input
                type="number"
                step={0.01}
                min={0}
                value={form.foodIGST}
                disabled={!form.gstApplicable || !form.foodGSTEnabled}
                onChange={(e) => patch("foodIGST", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <Separator />
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Platform commission (not on customer bill)
            </Label>
            <Switch
              checked={form.platformGSTEnabled}
              onCheckedChange={(c) => patch("platformGSTEnabled", c)}
              disabled={!form.gstApplicable}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Commission % of subtotal</Label>
              <Input
                type="number"
                step={0.01}
                min={0}
                value={form.commissionRate}
                disabled={!form.gstApplicable || !form.platformGSTEnabled}
                onChange={(e) => patch("commissionRate", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>GST on commission % (e.g. 18)</Label>
              <Input
                type="number"
                step={0.01}
                min={0}
                value={form.commissionGST}
                disabled={!form.gstApplicable || !form.platformGSTEnabled}
                onChange={(e) => patch("commissionGST", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <Separator />
          <div className="flex items-center justify-between">
            <Label>GST on delivery charge</Label>
            <Switch
              checked={form.deliveryGSTEnabled}
              onCheckedChange={(c) => patch("deliveryGSTEnabled", c)}
              disabled={!form.gstApplicable}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Delivery CGST %</Label>
              <Input
                type="number"
                step={0.01}
                min={0}
                value={form.deliveryCGST}
                disabled={!form.gstApplicable || !form.deliveryGSTEnabled}
                onChange={(e) => patch("deliveryCGST", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Delivery SGST %</Label>
              <Input
                type="number"
                step={0.01}
                min={0}
                value={form.deliverySGST}
                disabled={!form.gstApplicable || !form.deliveryGSTEnabled}
                onChange={(e) => patch("deliverySGST", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Delivery IGST %</Label>
              <Input
                type="number"
                step={0.01}
                min={0}
                value={form.deliveryIGST}
                disabled={!form.gstApplicable || !form.deliveryGSTEnabled}
                onChange={(e) => patch("deliveryIGST", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Default GSTIN (platform)</Label>
              <Input value={form.defaultGSTIN} onChange={(e) => patch("defaultGSTIN", e.target.value)} />
            </div>
            <div>
              <Label>Invoice prefix</Label>
              <Input value={form.invoicePrefix} onChange={(e) => patch("invoicePrefix", e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="button" onClick={save} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
