import { useCallback, useEffect, useState } from 'react';
import { paymentAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface RazorpayOptions {
  amount: number;
  onSuccess: (response: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) => void;
  onError?: (error: any) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  description?: string;
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const pay = useCallback(async (options: RazorpayOptions) => {
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay SDK failed to load');

      const orderRes = await paymentAPI.createRazorpayOrder({ amount: options.amount });
      if (!orderRes.success) throw new Error(orderRes.message || 'Failed to create order');

      const rzp = new window.Razorpay({
        key: orderRes.key,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: 'Dabba Nation',
        description: options.description || 'Payment',
        order_id: orderRes.orderId,
        prefill: options.prefill || {},
        theme: { color: '#E86F2A' },
        handler: async (response: any) => {
          try {
            const verifyRes = await paymentAPI.verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verifyRes.verified) {
              options.onSuccess({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err: any) {
            toast({ title: 'Verification Failed', description: err.message, variant: 'destructive' });
            options.onError?.(err);
          }
        },
        modal: {
          ondismiss: () => { setLoading(false); },
        },
      });

      rzp.on('payment.failed', (response: any) => {
        toast({ title: 'Payment Failed', description: response.error?.description || 'Payment failed', variant: 'destructive' });
        options.onError?.(response.error);
        setLoading(false);
      });

      rzp.open();
    } catch (err: any) {
      toast({ title: 'Payment Error', description: err.message, variant: 'destructive' });
      options.onError?.(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { pay, loading };
}
