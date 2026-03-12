import { useCallback, useEffect, useRef, useState } from 'react';
import { paymentApi } from '../api/payment';
import type { CreatePaymentLinkResponse, PaymentStatusDto } from '../types';
import { CheckCircle2, Clock3, ExternalLink, QrCode, RefreshCw, XCircle } from 'lucide-react';

interface PaymentQrPanelProps {
  invoiceId: number;
  amount: number;
  initialPayment: CreatePaymentLinkResponse;
  onPaymentVerified?: () => void;
}

function getStatusMeta(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === 'paid') {
    return {
      label: 'Thanh toán thành công',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
      icon: CheckCircle2
    };
  }

  if (normalized === 'failed' || normalized === 'cancelled' || normalized === 'expired') {
    return {
      label: 'Thanh toán không thành công',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
      icon: XCircle
    };
  }

  if (normalized === 'processing') {
    return {
      label: 'Đang xử lý giao dịch',
      className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      icon: RefreshCw
    };
  }

  return {
    label: 'Đang chờ thanh toán',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: Clock3
  };
}

export default function PaymentQrPanel({
  invoiceId,
  amount,
  initialPayment,
  onPaymentVerified
}: PaymentQrPanelProps) {
  const [status, setStatus] = useState(initialPayment.status || 'Pending');
  const [statusData, setStatusData] = useState<PaymentStatusDto | null>(null);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string>('Quet ma QR hoac mo trang thanh toan de hoan tat giao dich.');
  const notifiedRef = useRef(false);

  const refreshStatus = useCallback(async (manualVerify: boolean = false) => {
    try {
      setChecking(true);

      if (manualVerify && initialPayment.orderCode) {
        await paymentApi.verifyPayment(initialPayment.orderCode);
      }

      const response = await paymentApi.getPaymentStatus(invoiceId);
      const nextStatus = response.data?.status || 'Pending';
      setStatusData(response.data || null);
      setStatus(nextStatus);

      if (nextStatus === 'Paid') {
        setMessage('He thong da ghi nhan thanh toan thanh cong.');
        if (!notifiedRef.current) {
          notifiedRef.current = true;
          onPaymentVerified?.();
        }
      } else if (nextStatus === 'Cancelled') {
        setMessage('Giao dich da bi huy hoac het han. Vui long tao lai ma QR neu ban muon thanh toan tiep.');
      } else if (nextStatus === 'Processing') {
        setMessage('PayOS dang xu ly giao dich. He thong se tu dong cap nhat khi co ket qua.');
      } else if (manualVerify) {
        setMessage('Chua ghi nhan thanh toan. Vui long hoan tat tren ung dung ngan hang roi thu lai.');
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
      if (manualVerify) {
        setMessage('Khong the kiem tra trang thai thanh toan luc nay.');
      }
    } finally {
      setChecking(false);
    }
  }, [initialPayment.orderCode, invoiceId, onPaymentVerified]);

  useEffect(() => {
    void refreshStatus(false);

    const intervalId = window.setInterval(() => {
      void refreshStatus(false);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [refreshStatus]);

  const qrCode = statusData?.qrCodeDataUrl || initialPayment.qrCodeDataUrl;
  const checkoutUrl = statusData?.checkoutUrl || initialPayment.checkoutUrl;
  const statusMeta = getStatusMeta(status);
  const StatusIcon = statusMeta.icon;

  return (
    <div className="space-y-4 rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-800 dark:bg-indigo-950/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900 dark:text-indigo-200">
            <QrCode className="h-4 w-4" />
            Thanh toan bang QR
          </div>
          <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
            Don hang #{initialPayment.orderCode ?? statusData?.payOSOrderId ?? invoiceId}
          </p>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
          <StatusIcon className="h-4 w-4" />
          {statusMeta.label}
        </div>
      </div>

      {qrCode ? (
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-900">
          <img src={qrCode} alt="Payment QR code" className="mx-auto h-56 w-56 rounded-lg object-contain" />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          Khong tao duoc ma QR. Ban van co the mo trang thanh toan truc tiep.
        </div>
      )}

      <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>

      <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 dark:text-gray-300 sm:grid-cols-2">
        <div className="rounded-lg bg-white/80 p-3 dark:bg-gray-900/70">
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Trang thai</div>
          <div className="mt-1 font-semibold">{status}</div>
        </div>
        <div className="rounded-lg bg-white/80 p-3 dark:bg-gray-900/70">
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">So tien</div>
          <div className="mt-1 font-semibold">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(statusData?.amount ?? amount)}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => void refreshStatus(true)}
          disabled={checking}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-wait disabled:bg-indigo-400"
        >
          <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
          Kiem tra thanh toan
        </button>
        <button
          type="button"
          onClick={() => checkoutUrl && window.open(checkoutUrl, '_blank', 'noopener,noreferrer')}
          disabled={!checkoutUrl}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <ExternalLink className="h-4 w-4" />
          Mo trang thanh toan
        </button>
      </div>
    </div>
  );
}
