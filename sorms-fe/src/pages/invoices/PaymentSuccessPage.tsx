import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentApi } from '../../api/payment';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/LoadingSpinner';
import { AlertCircle, CheckCircle, Clock3, Home, Receipt } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<'paid' | 'pending' | 'cancelled' | 'failed'>('pending');

  const invoiceRoute = useMemo(() => {
    if (!user) return '/login';
    return user.userRole === 'Resident' ? '/resident/invoices' : '/invoices';
  }, [user]);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const id = searchParams.get('invoice_id');
        const orderCode = searchParams.get('orderCode');
        const status = (searchParams.get('status') || '').toUpperCase();
        const cancelled = searchParams.get('cancel') === 'true';

        if (!id) {
          setError('Invoice ID not found');
          setLoading(false);
          return;
        }

        setInvoiceId(parseInt(id));

        if (cancelled || status === 'CANCELLED') {
          setPaymentState('cancelled');
          setError('Giao dịch đã bị hủy trên PayOS.');
          return;
        }

        if (orderCode) {
          const res = await paymentApi.verifyPayment(parseInt(orderCode, 10));
          if (res.success || status === 'PAID') {
            setPaymentState('paid');
          } else if (status === 'PENDING' || status === 'PROCESSING') {
            setPaymentState('pending');
            setError('Giao dịch đang chờ PayOS xác nhận. Vui lòng quay lại trang hóa đơn sau ít phút.');
          } else {
            setPaymentState('failed');
            setError(res.message || 'Không thể xác nhận giao dịch với PayOS.');
          }
        } else if (status === 'PAID') {
          setPaymentState('paid');
        } else {
          setPaymentState('pending');
          setError('Chưa nhận được mã đơn hàng từ PayOS để xác minh thanh toán.');
        }
      } catch (err: unknown) {
        setPaymentState('failed');
        setError(err instanceof Error ? err.message : 'Payment verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) return <LoadingSpinner />;

  const viewConfig = paymentState === 'paid'
    ? {
        title: 'Payment Successful',
        description: 'PayOS đã xác nhận giao dịch thành công và hóa đơn của bạn đã được cập nhật.',
        icon: CheckCircle,
        iconClass: 'text-green-500 dark:text-green-400',
        bgClass: 'from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800',
        statusLabel: 'Paid',
        statusClass: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      }
    : paymentState === 'pending'
    ? {
        title: 'Payment Pending',
        description: 'Giao dịch đã được tạo nhưng PayOS vẫn đang chờ xác nhận từ ngân hàng.',
        icon: Clock3,
        iconClass: 'text-amber-500 dark:text-amber-400',
        bgClass: 'from-amber-50 to-blue-50 dark:from-gray-900 dark:to-gray-800',
        statusLabel: 'Pending',
        statusClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
      }
    : {
        title: 'Payment Not Completed',
        description: 'PayOS chưa ghi nhận giao dịch thành công cho hóa đơn này.',
        icon: AlertCircle,
        iconClass: 'text-red-500 dark:text-red-400',
        bgClass: 'from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800',
        statusLabel: paymentState === 'cancelled' ? 'Cancelled' : 'Failed',
        statusClass: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      };

  const StatusIcon = viewConfig.icon;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${viewConfig.bgClass} flex items-center justify-center px-4`}>
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-white/60 dark:bg-white/5 rounded-full animate-pulse" />
            <StatusIcon className={`w-24 h-24 relative z-10 ${viewConfig.iconClass}`} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {viewConfig.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {viewConfig.description}
          </p>
        </div>

        {invoiceId && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-green-100 dark:border-green-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Invoice ID:</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                #{invoiceId}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${viewConfig.statusClass}`}>
                <div className="w-2 h-2 rounded-full animate-pulse bg-current" />
                {viewConfig.statusLabel}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-amber-700 dark:text-amber-400">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 pt-6">
          <button
            onClick={() => navigate(invoiceRoute)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <Receipt className="w-5 h-5" />
            Back to Invoices
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-500">
          Nếu trạng thái chưa cập nhật ngay, PayOS có thể vẫn đang đồng bộ giao dịch với ngân hàng.
        </p>
      </div>
    </div>
  );
}
