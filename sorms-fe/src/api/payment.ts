import client from './client';
import type { InvoiceDto, ApiResponse } from '../types';

export const paymentApi = {
  getMyInvoices: async () => {
    const response = await client.get<ApiResponse<InvoiceDto[]>>('/api/Payment/my-invoices');
    return response.data;
  },

  createPaymentLink: async (invoiceId: number) => {
    const response = await client.post<{ checkoutUrl: string, orderCode: number, message: string }>(`/api/Payment/create-payment-link/${invoiceId}`);
    return response.data;
  }
};
