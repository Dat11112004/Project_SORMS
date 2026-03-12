import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { paymentApi } from '../../api/payment';
import LoadingSpinner from '../../components/LoadingSpinner';
import { AlertTriangle, CreditCard, Home, Receipt } from 'lucide-react';

export default function PaymentFailurePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [reason, setReason] = useState<string>('Unknown error');
  const [statusText, setStatusText] = useState<string>('Cancelled');

  const invoiceRoute = useMemo(() => {
    if (!user) return '/login';
    return user.userRole === 'Resident' ? '/resident/invoices' : '/invoices';
  }, [user]);

  useEffect(() => {
    const loadFailureState = async () => {
      try {
        const id = searchParams.get('invoice_id');
        const orderCode = searchParams.get('orderCode');
        const cancel = searchParams.get('cancel') === 'true';
        const status = (searchParams.get('status') || '').toUpperCase();
        const code = searchParams.get('code');

        if (id) {
          setInvoiceId(parseInt(id, 10));
        }

        if (orderCode) {
          const verification = await paymentApi.verifyPayment(parseInt(orderCode, 10));
          if (verification.success) {
            navigate(`/payment/success?${searchParams.toString()}`, { replace: true });
            return;
          }
        }

        if (cancel || status === 'CANCELLED') {
          setStatusText('Cancelled');
          setReason('Bạn đã hủy giao dịch trên PayOS hoặc phiên thanh toán đã bị hủy.');
        } else if (status === 'PENDING' || status === 'PROCESSING') {
          setStatusText('Pending');
          setReason('Giao dịch chưa hoàn tất. Hãy kiểm tra lại trong ứng dụng ngân hàng hoặc thử xác nhận lại từ trang hóa đơn.');
        } else if (code && code !== '00') {
          setStatusText('Failed');
          setReason(`PayOS trả về mã lỗi ${code}. Giao dịch chưa được xác nhận.`);
        } else {
          setStatusText('Failed');
          setReason(searchParams.get('reason') || 'Thanh toán không thành công. Vui lòng thử lại.');
        }
      } catch (err) {
        console.error('Error parsing payment failure state:', err);
        setStatusText('Failed');
        setReason('Không thể đọc trạng thái trả về từ PayOS.');
      } finally {
        setLoading(false);
      }
    };

    void loadFailureState();
  }, [navigate, searchParams]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Failure Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full animate-pulse" />
            <AlertTriangle className="w-24 h-24 text-red-500 dark:text-red-400 relative z-10" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Payment Not Completed
          </h1>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            PayOS chưa xác nhận thanh toán thành công cho hóa đơn này.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-red-100 dark:border-red-900/30 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Status:</h3>
            <p className="text-red-600 dark:text-red-400 font-medium">{statusText}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Reason:</h3>
            <p className="text-red-600 dark:text-red-400 font-medium">{reason}</p>
          </div>

          {invoiceId && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Invoice ID:</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                #{invoiceId}
              </span>
            </div>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2 text-left">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
            What you can do:
          </h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
            <li>Kiểm tra xem giao dịch đã bị hủy trên ứng dụng ngân hàng hay chưa.</li>
            <li>Tạo lại mã QR mới nếu phiên trước đã hết hạn hoặc bị hủy.</li>
            <li>Đối chiếu đúng số tiền và nội dung chuyển khoản do PayOS hiển thị.</li>
            <li>Nếu đã trừ tiền nhưng chưa cập nhật, chờ vài phút rồi kiểm tra lại.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 pt-6">
          <button
            onClick={() => navigate(invoiceRoute)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <CreditCard className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={() => navigate(invoiceRoute)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
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
          Với môi trường local, webhook PayOS chỉ hoạt động khi backend có URL public HTTPS.
        </p>
      </div>
    </div>
  );
}
