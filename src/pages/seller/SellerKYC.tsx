import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerAPI, getImageUrl } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatusBadge } from '@/components/shared/Badge';
import { toast } from '@/hooks/use-toast';
import { FileCheck, Upload, Shield, AlertCircle, CheckCircle2, Trash2, Eye, Clock, FileText, RefreshCw } from 'lucide-react';
import { useRef, useState } from 'react';
import { SELLER_KYC_QUERY_KEY, KYC_DOC_LABELS } from '@/lib/sellerKyc';

const DEFAULT_REQUIRED = ['aadhaar', 'pan', 'fssai'];
const DEFAULT_OPTIONAL = ['gst', 'bankProof'];

type KycDoc = { type: string; url: string; status?: string; uploadedAt?: string | null };

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

export default function SellerKYC() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingType, setPendingType] = useState<string | null>(null);
  // The file dialog can return before React re-renders, so read the chosen type from a ref
  const pendingTypeRef = useRef<string | null>(null);

  const { data: kyc, isLoading } = useQuery({
    queryKey: SELLER_KYC_QUERY_KEY,
    queryFn: () => sellerAPI.getKYCStatus(),
    // While under review, keep checking so approval shows up without a manual refresh
    refetchInterval: (query) => ((query.state.data as any)?.kycStatus === 'submitted' ? 20000 : false),
  });

  const applyResult = (data: any) => queryClient.setQueryData(SELLER_KYC_QUERY_KEY, data);

  const uploadMutation = useMutation({
    mutationFn: ({ type, file, replace }: { type: string; file: File; replace: boolean }) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', type);
      return replace ? sellerAPI.updateKYCDocument(type, formData) : sellerAPI.uploadKYCDocument(formData);
    },
    onSuccess: (data, vars) => {
      applyResult(data);
      toast({ title: `${KYC_DOC_LABELS[vars.type]?.label || 'Document'} uploaded` });
    },
    onError: (err: Error) => toast({ title: 'Upload failed', description: err.message, variant: 'destructive' }),
    onSettled: () => setPendingType(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (type: string) => sellerAPI.deleteKYCDocument(type),
    onSuccess: (data) => { applyResult(data); toast({ title: 'Document removed' }); },
    onError: (err: Error) => toast({ title: 'Could not remove document', description: err.message, variant: 'destructive' }),
  });

  const submitMutation = useMutation({
    mutationFn: () => sellerAPI.submitKYC(),
    onSuccess: (data) => {
      applyResult(data);
      toast({ title: 'Submitted for verification', description: 'Our team will review your documents within 24-48 hours.' });
    },
    onError: (err: Error) => toast({ title: 'Could not submit', description: err.message, variant: 'destructive' }),
  });

  const status: string = kyc?.kycStatus || 'pending';
  const documents: KycDoc[] = kyc?.documents || [];
  const byType = new Map(documents.map((d) => [d.type, d]));
  const required: string[] = kyc?.requiredDocuments || DEFAULT_REQUIRED;
  const optional: string[] = kyc?.optionalDocuments || DEFAULT_OPTIONAL;
  const missing: string[] = kyc?.missingDocuments || required.filter((t) => !byType.has(t));
  const editable = status === 'pending' || status === 'rejected';
  const uploadedRequired = required.length - missing.length;

  const pickFile = (type: string) => {
    pendingTypeRef.current = type;
    fileInputRef.current?.click();
  };

  const onFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const type = pendingTypeRef.current;
    e.target.value = '';
    pendingTypeRef.current = null;
    if (!file || !type) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload a file under 5 MB.', variant: 'destructive' });
      return;
    }
    setPendingType(type);
    uploadMutation.mutate({ type, file, replace: byType.has(type) });
  };

  const header = {
    pending: {
      icon: AlertCircle, tone: 'bg-warning/10 text-warning',
      title: missing.length ? 'Upload your documents' : 'Ready to submit',
      text: missing.length
        ? `${uploadedRequired} of ${required.length} required documents uploaded. Upload the rest, then submit for verification.`
        : 'All required documents are uploaded. Submit them so our team can verify your kitchen.',
    },
    submitted: {
      icon: Clock, tone: 'bg-info/10 text-info',
      title: 'Documents under review',
      text: `Submitted${formatDate(kyc?.kycSubmittedAt) ? ` on ${formatDate(kyc?.kycSubmittedAt)}` : ''}. Verification usually takes 24-48 hours. This page updates automatically once you are approved.`,
    },
    verified: {
      icon: CheckCircle2, tone: 'bg-success/10 text-success',
      title: 'KYC verified',
      text: 'Your kitchen is verified. You can manage your menu and take orders.',
    },
    rejected: {
      icon: AlertCircle, tone: 'bg-destructive/10 text-destructive',
      title: 'KYC needs changes',
      text: kyc?.kycRejectReason
        ? `Reason: ${kyc.kycRejectReason}. Replace the documents below and submit again.`
        : 'Your documents were not accepted. Replace the documents below and submit again.',
    },
  }[status] || null;

  const HeaderIcon = header?.icon || AlertCircle;

  const steps = [
    { label: 'Upload documents', done: missing.length === 0 || status !== 'pending' },
    { label: 'Submit for review', done: status === 'submitted' || status === 'verified' },
    { label: 'Verified', done: status === 'verified' },
  ];

  const renderRow = (type: string, isRequired: boolean) => {
    const doc = byType.get(type);
    const meta = KYC_DOC_LABELS[type] || { label: type, hint: '' };
    const busy = uploadMutation.isPending && pendingType === type;
    return (
      <div key={type} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${doc ? 'bg-success/10 text-success' : 'bg-secondary text-muted-foreground'}`}>
            {doc ? <FileCheck size={20} /> : <FileText size={20} />}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground">
              {meta.label}
              {isRequired ? <span className="ml-2 text-xs font-normal text-destructive">Required</span> : <span className="ml-2 text-xs font-normal text-muted-foreground">Optional</span>}
            </p>
            <p className="text-xs text-muted-foreground">
              {doc
                ? `Uploaded${formatDate(doc.uploadedAt) ? ` on ${formatDate(doc.uploadedAt)}` : ''}${status === 'submitted' ? ' · under review' : status === 'verified' ? ' · verified' : ''}`
                : meta.hint}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {doc && (
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => window.open(getImageUrl(doc.url), '_blank', 'noopener')}>
              <Eye size={16} /> View
            </Button>
          )}
          {editable && (
            <Button variant={doc ? 'outline' : 'gradient'} size="sm" className="gap-1" disabled={uploadMutation.isPending} onClick={() => pickFile(type)}>
              {doc ? <RefreshCw size={16} /> : <Upload size={16} />}
              {busy ? 'Uploading...' : doc ? 'Replace' : 'Upload'}
            </Button>
          )}
          {editable && doc && (
            <Button variant="ghost" size="sm" title="Remove" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(type)}>
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <SellerLayout title="KYC Verification" subtitle="Verify your kitchen to start selling">
      <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={onFileChosen} />
      {isLoading ? <LoadingSpinner /> : (
        <>
          <Card className="mb-6">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${header?.tone}`}>
                  <HeaderIcon size={28} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h2 className="text-xl font-display font-bold text-foreground">{header?.title}</h2>
                    <StatusBadge status={status} />
                  </div>
                  <p className="text-muted-foreground">{header?.text}</p>
                </div>
              </div>
              <ol className="mt-6 grid grid-cols-3 gap-2">
                {steps.map((s, i) => (
                  <li key={s.label} className="flex flex-col gap-2">
                    <div className={`h-1.5 rounded-full ${s.done ? 'bg-success' : 'bg-secondary'}`} />
                    <span className={`text-xs ${s.done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{i + 1}. {s.label}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Documents</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {required.map((t) => renderRow(t, true))}
                {optional.map((t) => renderRow(t, false))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">JPG, PNG or PDF, up to 5 MB each.</p>

              {editable && (
                <div className="mt-6">
                  <Button
                    onClick={() => submitMutation.mutate()}
                    variant="gradient"
                    className="w-full gap-2"
                    disabled={missing.length > 0 || submitMutation.isPending || uploadMutation.isPending}
                  >
                    <Shield size={18} />
                    {submitMutation.isPending ? 'Submitting...' : status === 'rejected' ? 'Resubmit for verification' : 'Submit for verification'}
                  </Button>
                  {missing.length > 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Upload {missing.map((t) => KYC_DOC_LABELS[t]?.label || t).join(', ')} to submit.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </SellerLayout>
  );
}
