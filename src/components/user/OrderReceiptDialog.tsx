import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { userAPI } from "@/lib/api";
import { Download } from "lucide-react";

/** Shape of GET /api/invoice/receipt/:orderId (backend services/order-receipt.service.js) */
type OrderReceipt = {
  orderNumber: string | null;
  invoiceNumber: string | null;
  orderDate: string | null;
  customer: { name: string | null; deliveryAddress: string | null };
  seller: { name: string | null; address: string | null; gstNumber: string | null; fssaiLicense: string | null };
  items: { name: string; quantity: number; unitPrice: number; lineTotal: number }[];
  summary: { itemTotal: number; taxTotal: number; deliveryFee: number; discount: number; grandTotal: number; subscriptionCredit: number; amountDue: number };
  payment: { methodLabel: string | null; status: string; reference: string | null };
};

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(Number(n) || 0);

const PAYMENT_STATUS: Record<string, string> = {
  paid: "Paid",
  pending: "Payment pending",
  failed: "Payment failed",
  refunded: "Refunded",
};

/**
 * Order receipt rendered from the backend's authoritative receipt — the mobile app and the
 * invoice PDF use the same data, so totals can't drift between platforms.
 */
export function OrderReceiptDialog({ orderId, onClose }: { orderId: string | null; onClose: () => void }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["order-receipt", orderId],
    queryFn: () => userAPI.getOrderReceipt(orderId as string),
    enabled: !!orderId,
  });
  const receipt: OrderReceipt | undefined = (data as any)?.receipt;

  return (
    <Dialog open={!!orderId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order receipt</DialogTitle>
        </DialogHeader>

        {isLoading && <div className="py-8 flex justify-center"><LoadingSpinner /></div>}
        {error && <p className="text-sm text-destructive">Couldn't load the receipt. Please try again.</p>}

        {receipt && (
          <div className="space-y-4 text-sm" data-testid="order-receipt">
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-semibold" data-testid="receipt-order-number">#{receipt.orderNumber}</p>
                {receipt.orderDate && (
                  <p className="text-muted-foreground">{new Date(receipt.orderDate).toLocaleString("en-IN")}</p>
                )}
              </div>
              {receipt.invoiceNumber && (
                <p className="text-right text-muted-foreground">Invoice<br /><span className="text-foreground">{receipt.invoiceNumber}</span></p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs uppercase text-muted-foreground">From</p>
                <p className="font-medium">{receipt.seller.name}</p>
                {receipt.seller.address && <p className="text-muted-foreground">{receipt.seller.address}</p>}
                {receipt.seller.fssaiLicense && <p className="text-xs text-muted-foreground">FSSAI {receipt.seller.fssaiLicense}</p>}
                {receipt.seller.gstNumber && <p className="text-xs text-muted-foreground">GSTIN {receipt.seller.gstNumber}</p>}
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">To</p>
                <p className="font-medium">{receipt.customer.name}</p>
                {receipt.customer.deliveryAddress && <p className="text-muted-foreground">{receipt.customer.deliveryAddress}</p>}
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground border-b">
                  <th className="text-left py-1 font-medium">Item</th>
                  <th className="text-right py-1 font-medium">Qty</th>
                  <th className="text-right py-1 font-medium">Price</th>
                  <th className="text-right py-1 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1.5 pr-2">{item.name}</td>
                    <td className="py-1.5 text-right">{item.quantity}</td>
                    <td className="py-1.5 text-right">{inr(item.unitPrice)}</td>
                    <td className="py-1.5 text-right">{inr(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1">
              <Row label="Item total" value={inr(receipt.summary.itemTotal)} />
              {receipt.summary.taxTotal > 0 && <Row label="GST" value={inr(receipt.summary.taxTotal)} />}
              <Row label="Delivery fee" value={inr(receipt.summary.deliveryFee)} />
              {receipt.summary.discount > 0 && <Row label="Discount" value={`-${inr(receipt.summary.discount)}`} />}
              <div className="flex justify-between border-t pt-2 font-semibold text-base">
                <span>Grand total</span>
                <span data-testid="receipt-grand-total">{inr(receipt.summary.grandTotal)}</span>
              </div>
              {receipt.summary.subscriptionCredit > 0 && (
                <>
                  <Row label="Subscription credit" value={`-${inr(receipt.summary.subscriptionCredit)}`} />
                  <Row label="Amount due" value={inr(receipt.summary.amountDue)} />
                </>
              )}
            </div>

            <p className="text-muted-foreground">
              {receipt.payment.methodLabel} · {PAYMENT_STATUS[receipt.payment.status] || receipt.payment.status}
              {receipt.payment.reference ? ` · Ref ${receipt.payment.reference}` : ""}
            </p>

            <Button variant="outline" className="w-full gap-2" onClick={() => userAPI.downloadInvoice(orderId as string)}>
              <Download size={16} /> Download PDF
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span>{value}</span>
  </div>
);
