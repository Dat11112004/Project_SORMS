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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth, maxHeight: '90vh', overflow: 'auto',
          margin: '1rem',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)',
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  );
}
