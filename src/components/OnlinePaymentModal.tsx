import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, QrCode, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PAYMENT_QR_DATA } from "@/assets/qrCodeData";

interface OnlinePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  title?: string;
  description?: string;
  onPaymentSuccess: (transactionId?: string) => Promise<void> | void;
}

export function OnlinePaymentModal({
  isOpen,
  onClose,
  amount,
  title = "Pay Online via UPI / PhonePe",
  description = "Scan the QR code using PhonePe, Google Pay, Paytm, or any UPI app to complete your payment.",
  onPaymentSuccess,
}: OnlinePaymentModalProps) {
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(PAYMENT_QR_DATA.upiId);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "UPI ID copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onPaymentSuccess(transactionId);
      onClose();
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error?.message || "Failed to process online payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            <QrCode className="w-6 h-6" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-2">
          {/* Amount Badge */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 w-full text-center">
            <span className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold block">Total Amount Payable</span>
            <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">₹{amount.toLocaleString('en-IN')}</span>
          </div>

          {/* PhonePe QR Image Container */}
          <div className="relative border-2 border-dashed border-emerald-400 dark:border-emerald-600 p-2 rounded-2xl bg-black shadow-lg max-w-[260px] overflow-hidden">
            <img
              src="/payment_qr.jpg"
              alt="PhonePe QR Code - AKASH DIWIVEDI"
              className="w-full h-auto rounded-xl object-contain"
              onError={(e) => {
                // Fallback to backend static URL if local public asset fails
                (e.target as HTMLImageElement).src = "https://api.dabbanation.in/public/payment_qr.jpg";
              }}
            />
          </div>

          {/* Account Details & UPI ID */}
          <div className="w-full space-y-2 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg text-sm border">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Account Holder:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{PAYMENT_QR_DATA.payeeName}</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs text-gray-500">UPI ID:</span>
              <div className="flex items-center gap-1 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                <span>{PAYMENT_QR_DATA.upiId}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-500 hover:text-emerald-600"
                  onClick={handleCopyUpi}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Transaction ID Input */}
          <div className="w-full space-y-1.5 text-left">
            <Label htmlFor="txnId" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              UTR / Transaction ID / Reference No. (Optional)
            </Label>
            <Input
              id="txnId"
              placeholder="e.g. 423456789012"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="text-sm font-mono"
            />
            <p className="text-[11px] text-gray-400">
              Enter 12-digit UTR from PhonePe/GPay after completing payment.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {isSubmitting ? "Processing..." : "I Have Paid / Confirm Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
