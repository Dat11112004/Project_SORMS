import { useState } from 'react';
import { paymentApi } from '../api/payment';
import type { CreatePaymentLinkResponse, InvoiceDto } from '../types';
import Modal from './Modal';
import PaymentQrPanel from './PaymentQrPanel';
import StatusBadge from './StatusBadge';
import { AlertCircle, Loader } from 'lucide-react';

interface CheckInPaymentModalProps {
  isOpen: boolean;
  invoice: InvoiceDto | null;
  onPaymentSuccess: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function CheckInPaymentModal({
  isOpen,
  invoice,
  onPaymentSuccess: _onPaymentSuccess,
  onCancel,
  loading = false
}: CheckInPaymentModalProps) {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSession, setPaymentSession] = useState<CreatePaymentLinkResponse | null>(null);

  if (!invoice) return null;

  const handlePayment = async () => {
    try {
      setPaying(true);
      setError(null);

      // Generate return and cancel URLs
      const currentUrl = window.location.origin;
      const returnUrl = `${currentUrl}/payment/success?invoice_id=${invoice.id}`;
      const cancelUrl = `${currentUrl}/payment/failure?invoice_id=${invoice.id}`;

      const res = await paymentApi.createPaymentLink(invoice.id, returnUrl, cancelUrl);

      if (res.success && res.checkoutUrl) {
        setPaymentSession(res);
      } else {
        setError(res.message || 'Failed to create payment link');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment initialization failed');
      console.error('Payment error:', err);
    } finally {
      setPaying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Room Check-In Payment"
    >
      <div className="space-y-4">
        {/* Invoice Info */}
        <div className="bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-indigo-50 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Invoice #{invoice.id}
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Description:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {invoice.description}
              </span>
            </div>

            {invoice.roomNumber && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Room:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {invoice.roomNumber}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-2 border-t border-blue-200 dark:border-blue-700">
              <span className="text-gray-600 dark:text-gray-300">Amount:</span>
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(invoice.amount)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Status:</span>
              <StatusBadge status={invoice.status} />
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
          </div>
        )}

        {/* Payment Info */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            ⚠️ You must complete the payment before check-in can be approved by staff.
          </p>
        </div>

        {paymentSession && (
          <PaymentQrPanel
            invoiceId={invoice.id}
            amount={invoice.amount}
            initialPayment={paymentSession}
            onPaymentVerified={_onPaymentSuccess}
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onCancel}
            disabled={paying || loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={paying || loading}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium text-white ${
              paying || loading
                ? 'bg-gray-400 cursor-wait'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {paying && <Loader className="w-4 h-4 animate-spin" />}
            {paying ? 'Processing...' : paymentSession ? 'Regenerate QR' : 'Pay Now'}
          </button>
        </div>

        {/* Security Note */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Secured payment powered by PayOS
        </p>
      </div>
    </Modal>
  );
}
