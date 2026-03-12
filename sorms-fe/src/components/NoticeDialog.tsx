import { CheckCircle2, Info, TriangleAlert, XCircle } from 'lucide-react';
import Modal from './Modal';

interface NoticeDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  buttonText?: string;
  onClose: () => void;
}

const noticeStyles = {
  success: {
    shell: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    icon: CheckCircle2
  },
  error: {
    shell: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    icon: XCircle
  },
  warning: {
    shell: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    icon: TriangleAlert
  },
  info: {
    shell: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    icon: Info
  }
} as const;

export default function NoticeDialog({
  isOpen,
  title,
  message,
  variant = 'info',
  buttonText = 'OK',
  onClose
}: NoticeDialogProps) {
  const meta = noticeStyles[variant];
  const Icon = meta.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={500}>
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 rounded-xl p-2.5 ${meta.shell}`}>
            <Icon size={18} />
          </div>
          <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{message}</p>
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="btn btn-primary min-w-24">
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
}