export interface PaymentInfo {
  vodafone_cash_number: string;
  instapay_number: string;
}

export interface PaymentStatus {
  id: string;
  method: string;
  status: string;
  screenshot_url: string;
  admin_note: string | null;
  attempt_number: number;
  created_at: string;
}
