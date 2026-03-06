import { useQuery } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ReactNode } from 'react';

interface KYCGateProps {
  children: ReactNode;
}

export function KYCGate({ children }: KYCGateProps) {
  const navigate = useNavigate();

  const { data: kyc, isLoading } = useQuery({
    queryKey: ['seller-kyc-status'],
    queryFn: () => sellerAPI.getKYCStatus(),
    staleTime: 30 * 1000,
  });

  const status = kyc?.kycStatus || 'pending';

  if (isLoading) return <SellerLayout><LoadingSpinner /></SellerLayout>;

  if (status === 'verified') return <>{children}</>;

  const configs: Record<string, { icon: any; title: string; desc: string; color: string; bg: string }> = {
    pending: {
      icon: AlertCircle,
      title: 'KYC Documents Required',
      desc: 'Please upload your KYC documents to start using the seller panel. You need to submit Aadhaar, PAN, FSSAI license and bank details.',
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    submitted: {
      icon: Clock,
      title: 'KYC Under Review',
      desc: 'Your documents are being reviewed by our team. This usually takes 24-48 hours. We\'ll notify you once verified.',
      color: 'text-info',
      bg: 'bg-info/10',
    },
    rejected: {
      icon: AlertCircle,
      title: 'KYC Rejected',
      desc: 'Your KYC documents were rejected. Please re-upload the correct documents and submit again.',
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
  };

  const cfg = configs[status] || configs.pending;
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
            {(status === 'pending' || status === 'rejected') && (
              <Button variant="gradient" size="lg" className="gap-2" onClick={() => navigate('/seller/kyc')}>
                <Shield size={20} />
                {status === 'rejected' ? 'Re-upload Documents' : 'Upload KYC Documents'}
              </Button>
            )}
            {status === 'submitted' && (
              <div className="flex items-center justify-center gap-2 text-info">
                <Clock size={18} />
                <span className="font-medium">Waiting for admin approval...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}