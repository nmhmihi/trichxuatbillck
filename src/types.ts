export interface ExtractedBillData {
  isBankReceipt: boolean;
  recipientName: string;
  recipientAccountNumber: string;
  recipientBank: string;
  amount?: string;
  senderName?: string;
  senderAccountNumber?: string;
  transactionDate?: string;
  transactionCode?: string;
  transferContent?: string;
  notes?: string;
}

export interface ExtractionHistoryItem {
  id: string;
  timestamp: number;
  fileName: string;
  imagePreview: string;
  data: ExtractedBillData;
}

export interface SampleBill {
  id: string;
  title: string;
  bankName: string;
  amount: string;
  recipient: string;
  account: string;
  svgDataUrl: string;
}
