import { env } from "../../config/env";

interface PaystationResponse {
  status_code: number;
  status: string;
  payment_url?: string;
  invoice_number?: string;
  payment_amount?: number;
  message?: string;
}

export interface InitiatePaymentParams {
  invoiceNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  callbackUrl: string;
}

export async function initiatePaystationPayment(
  params: InitiatePaymentParams
): Promise<string> {
  const body = {
    merchantId: env.paystation.merchantId,
    password: env.paystation.password,
    invoice_number: params.invoiceNumber,
    payment_amount: params.amount,
    cust_name: params.customerName,
    cust_email: params.customerEmail,
    cust_phone: params.customerPhone || "01700000000",
    callback_url: params.callbackUrl,
    currency: "BDT",
  };

  const res = await fetch(env.paystation.apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Paystation API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as PaystationResponse;

  if (!data.payment_url) {
    throw new Error(data.message || "Paystation did not return a payment URL");
  }

  return data.payment_url;
}
