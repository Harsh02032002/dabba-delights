import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatusBadge } from '@/components/shared/Badge';
import { toast } from '@/hooks/use-toast';
import { FileCheck, Upload, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function SellerKYC() {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('aadhaar');

  const { data: kyc, isLoading } = useQuery({
    queryKey: ['seller-kyc'],
    queryFn: () => sellerAPI.getKYCStatus(),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => sellerAPI.uploadKYCDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-kyc'] });
      toast({ title: 'Document Uploaded', description: 'Your KYC document has been uploaded successfully.' });
      setSelectedFile(null);
    },
    onError: (err: Error) => toast({ title: 'Upload Failed', description: err.message, variant: 'destructive' }),
  });

  const submitMutation = useMutation({
    mutationFn: () => sellerAPI.submitKYC(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-kyc'] });
      toast({ title: 'KYC Submitted', description: 'Your KYC has been submitted for verification.' });
    },
  });

  const handleUpload = () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('type', docType);
    uploadMutation.mutate(formData);
  };

  const statusConfig: Record<string, { icon: any; color: string; text: string }> = {
    pending: { icon: AlertCircle, color: 'text-warning', text: 'Upload your documents and then submit for admin approval.' },
    submitted: { icon: FileCheck, color: 'text-info', text: 'All documents uploaded. Waiting for admin to verify your account.' },
    verified: { icon: CheckCircle2, color: 'text-success', text: 'Your KYC is verified. You can start selling!' },
    rejected: { icon: AlertCircle, color: 'text-destructive', text: 'KYC was rejected. Please re-upload documents.' },
  };

  const status = kyc?.kycStatus || 'pending';
  const documents = kyc?.documents || [];
  const config = statusConfig[status];
  const Icon = config?.icon || AlertCircle;

  return (
    <SellerLayout title="KYC Status" subtitle="Complete your verification to start selling">
      {isLoading ? <LoadingSpinner /> : (
        <>
          {/* Status Card */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${status === 'verified' ? 'bg-success/10' : status === 'rejected' ? 'bg-destructive/10' : 'bg-warning/10'}`}>
                  <Icon size={32} className={config?.color} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-display font-bold text-foreground">KYC Status</h2>
                    <StatusBadge status={status} />
                  </div>
                  <p className="text-muted-foreground">{config?.text}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Documents */}
          {(status === 'pending' || status === 'rejected') && (
            <Card className="mb-8">
              <CardHeader><CardTitle className="font-display text-lg">Upload Documents</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    >
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="fssai">FSSAI License</option>
                      <option value="gst">GST Certificate</option>
                      <option value="bank">Bank Statement</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Upload File</Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploadMutation.isPending}
                    variant="gradient"
                    className="gap-2"
                  >
                    <Upload size={18} />
                    {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Uploaded Documents — show from kycDocuments object too */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Uploaded Documents</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Show documents from array */}
                {documents.map((doc: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <FileCheck size={20} className="text-primary" />
                      <div>
                        <p className="font-medium text-foreground capitalize">{doc.type || 'Document'}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Just uploaded'}
                        </p>
                      </div>
                    </div>
                    {doc.url && <Button variant="ghost" size="sm" onClick={() => window.open(doc.url, '_blank')}>View</Button>}
                  </div>
                ))}
                {/* Show from kycDocuments object (aadhaar, pan, fssai, etc.) */}
                {kyc?.kycDocuments && Object.entries(kyc.kycDocuments).map(([key, val]: [string, any]) => {
                  if (!val?.url) return null;
                  const docNames: Record<string, string> = { aadhaar: 'Aadhaar Card', pan: 'PAN Card', fssai: 'FSSAI License', bankProof: 'Bank Proof', gst: 'GST Certificate' };
                  return (
                    <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <FileCheck size={20} className="text-primary" />
                        <div>
                          <p className="font-medium text-foreground">{docNames[key] || key}</p>
                          <p className="text-xs text-muted-foreground capitalize">Status: {val.status || 'uploaded'}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => window.open(val.url, '_blank')}>View</Button>
                    </div>
                  );
                })}
                {documents.length === 0 && !kyc?.kycDocuments && (
                  <p className="text-muted-foreground text-center py-4">No documents uploaded</p>
                )}
              </div>

              {status === 'pending' && documents.length > 0 && (
                <Button onClick={() => submitMutation.mutate()} variant="gradient" className="mt-6 w-full gap-2" disabled={submitMutation.isPending}>
                  <Shield size={18} />
                  {submitMutation.isPending ? 'Submitting...' : 'Submit for Verification'}
                </Button>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </SellerLayout>
  );
}
