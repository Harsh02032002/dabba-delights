import { useQuery } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle, Clock, FileCheck } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ReactNode } from 'react';
import { SELLER_KYC_QUERY_KEY, KYC_DOC_LABELS } from '@/lib/sellerKyc';

interface KYCGateProps {
  children: ReactNode;
}

export function KYCGate({ children }: KYCGateProps) {
  const navigate = useNavigate();

  // Same cache as the KYC page, so uploads and submission show here immediately
  const { data: kyc, isLoading } = useQuery({
    queryKey: SELLER_KYC_QUERY_KEY,
    queryFn: () => sellerAPI.getKYCStatus(),
    staleTime: 15 * 1000,
    refetchOnWindowFocus: true,
    // While under review, keep checking so the panel unlocks as soon as admin approves
    refetchInterval: (query) => ((query.state.data as any)?.kycStatus === 'submitted' ? 20000 : false),
  });

  const status: string = kyc?.kycStatus || 'pending';

  if (isLoading) return <SellerLayout><LoadingSpinner /></SellerLayout>;

  if (status === 'verified') return <>{children}</>;

  const required: string[] = kyc?.requiredDocuments || ['aadhaar', 'pan', 'fssai'];
  const missing: string[] = kyc?.missingDocuments || required;
  const uploadedCount = (kyc?.documents || []).length;
  const readyToSubmit = status === 'pending' && missing.length === 0;
  const started = status === 'pending' && uploadedCount > 0;

  let cfg: { icon: any; title: string; desc: string; color: string; bg: string; cta?: string };
  if (status === 'submitted') {
    cfg = {
      icon: Clock,
      title: 'KYC under review',
      desc: 'Your documents have been received and are being reviewed by our team. This usually takes 24-48 hours. This page unlocks automatically once you are approved.',
      color: 'text-info',
      bg: 'bg-info/10',
    };
  } else if (status === 'rejected') {
    cfg = {
      icon: AlertCircle,
      title: 'KYC needs changes',
      desc: kyc?.kycRejectReason
        ? `Reason: ${kyc.kycRejectReason}. Please replace the documents and submit again.`
        : 'Your documents were not accepted. Please replace them and submit again.',
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      cta: 'Update documents',
    };
  } else if (readyToSubmit) {
    cfg = {
      icon: FileCheck,
      title: 'Documents uploaded, submit for review',
      desc: 'All required documents are uploaded. Submit them for verification to unlock your seller panel.',
      color: 'text-primary',
      bg: 'bg-primary/10',
      cta: 'Review and submit',
    };
  } else if (started) {
    cfg = {
      icon: AlertCircle,
      title: 'Finish your KYC',
      desc: `${required.length - missing.length} of ${required.length} required documents uploaded. Still needed: ${missing.map((t) => KYC_DOC_LABELS[t]?.label || t).join(', ')}.`,
      color: 'text-warning',
      bg: 'bg-warning/10',
      cta: 'Continue KYC',
    };
  } else {
    cfg = {
      icon: AlertCircle,
      title: 'KYC documents required',
      desc: 'Upload your Aadhaar, PAN and FSSAI license to start using the seller panel. Bank proof and GST certificate are optional.',
      color: 'text-warning',
      bg: 'bg-warning/10',
      cta: 'Upload KYC documents',
    };
  }
  const Icon = cfg.icon;

  return (
    <SellerLayout title="Account Verification" subtitle="Complete your KYC to access all features">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <div className={`w-20 h-20 rounded-2xl ${cfg.bg} flex items-center justify-center mx-auto mb-6`}>
              <Icon size={40} className={cfg.color} />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">{cfg.title}</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">{cfg.desc}</p>
            {cfg.cta && (
              <Button variant="gradient" size="lg" className="gap-2" onClick={() => navigate('/seller/kyc')}>
                <Shield size={20} />
                {cfg.cta}
              </Button>
            )}
            {status === 'submitted' && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center gap-2 text-info">
                  <Clock size={18} />
                  <span className="font-medium">Waiting for admin approval</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/seller/kyc')}>View submitted documents</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}
