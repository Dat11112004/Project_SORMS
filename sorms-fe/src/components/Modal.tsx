import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: number;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 500 }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="animate-fade-in w-full rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth, maxHeight: 'min(90vh, 960px)', overflowX: 'hidden', overflowY: 'auto' }}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:px-6">
          <h3 className="pr-2 text-lg font-semibold leading-7 text-slate-900 break-words dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 break-words sm:p-6">{children}</div>
      </div>
    </div>
  );
}
