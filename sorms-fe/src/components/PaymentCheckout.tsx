import { useState } from 'react';
import { paymentApi } from '../api/payment';
import type { CreatePaymentLinkResponse, InvoiceDto } from '../types';
import StatusBadge from './StatusBadge';
import PaymentQrPanel from './PaymentQrPanel';
import { CreditCard, AlertCircle, Loader } from 'lucide-react';

interface PaymentCheckoutProps {
  invoice: InvoiceDto;
  onPaymentInitiated?: (checkoutUrl: string) => void;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

export default function PaymentCheckout({
  invoice,
  onPaymentInitiated,
  onPaymentSuccess,
  onPaymentError
}: PaymentCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSession, setPaymentSession] = useState<CreatePaymentLinkResponse | null>(null);

  const handlePayment = async () => {
    if (invoice.status === 'Paid') {
      setError('This invoice has already been paid');
      onPaymentError?.('This invoice has already been paid');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Generate return and cancel URLs
      const currentUrl = window.location.origin;
      const returnUrl = `${currentUrl}/payment/success?invoice_id=${invoice.id}`;
      const cancelUrl = `${currentUrl}/payment/failure?invoice_id=${invoice.id}`;

      const res = await paymentApi.createPaymentLink(invoice.id, returnUrl, cancelUrl);

      if (res.success && res.checkoutUrl) {
        setPaymentSession(res);
        onPaymentInitiated?.(res.checkoutUrl);
      } else {
        throw new Error(res.message || 'Failed to create payment link');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initiate payment';
      setError(errorMsg);
      onPaymentError?.(errorMsg);
      console.error('Payment error details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Invoice Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Invoice #{invoice.id}
          </h3>
          <StatusBadge status={invoice.status} />
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Description:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {invoice.description}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">Amount:</span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(invoice.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Date:</span>
            <span className="text-gray-900 dark:text-white">
              {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Payment Error
            </p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Payment Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Payment Information
            </h4>
            <p className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed">
              Click "Pay Now" to generate a QR code. You can scan it with your banking app or open the PayOS checkout page.
            </p>
          </div>
        </div>
      </div>

      {paymentSession && (
        <PaymentQrPanel
          invoiceId={invoice.id}
          amount={invoice.amount}
          initialPayment={paymentSession}
          onPaymentVerified={onPaymentSuccess}
        />
      )}

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading || invoice.status === 'Paid'}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
          invoice.status === 'Paid'
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : loading
            ? 'bg-indigo-600 text-white cursor-wait'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md'
        }`}
      >
        {loading && <Loader className="w-5 h-5 animate-spin" />}
        {invoice.status === 'Paid' ? 'Already Paid' : paymentSession ? 'Regenerate QR' : 'Pay Now'}
      </button>

      {/* Security Note */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Secured payment powered by PayOS
      </p>
    </div>
  );
}
