export interface Settings {
  id: number;
  publisher_name: string;
  tagline?: string;
  about?: string;
  whatsapp_number: string;
  contact_email?: string;
  contact_address?: string;
  currency: string;
  upi_id?: string;
  payment_instructions?: string;
  // New payment fields
  account_holder_name?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  qr_code_url?: string;
}
