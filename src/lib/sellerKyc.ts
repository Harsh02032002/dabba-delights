/** Shared by the seller KYC page and the KYC gate (same react-query cache) */
export const SELLER_KYC_QUERY_KEY = ['seller-kyc'];

export const KYC_DOC_LABELS: Record<string, { label: string; hint: string }> = {
  aadhaar: { label: 'Aadhaar Card', hint: 'Front side, all four corners visible' },
  pan: { label: 'PAN Card', hint: 'Business or owner PAN' },
  fssai: { label: 'FSSAI License', hint: 'Registration or license certificate' },
  gst: { label: 'GST Certificate', hint: 'Only if your kitchen is GST registered' },
  bankProof: { label: 'Bank Proof', hint: 'Cancelled cheque or bank statement for payouts' },
};
