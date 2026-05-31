import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStatusColor, getSeverityColor, getTypeIcon, getTypeLabel } from '../../utils/helpers';

// ── LoadingSpinner ─────────────────────────────────────────────────────────────
export function LoadingSpinner({ size = 'md', color = 'blue', fullscreen = false }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-4', lg: 'w-12 h-12 border-4' };
  const colors = { blue: 'border-blue-600', red: 'border-red-600', white: 'border-white', orange: 'border-orange-500' };

  const spinner = (
    <div className={`${sizes[size]} ${colors[color]} border-t-transparent rounded-full animate-spin`} />
  );

  if (fullscreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {spinner}
          <p className="text-slate-400 text-sm mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
}

// ── Modal ──────────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} z-10`}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── StatusBadge ────────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusColor(status)}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

// ── SeverityBadge ──────────────────────────────────────────────────────────────
export function SeverityBadge({ severity }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getSeverityColor(severity)}`}>
      {severity}
    </span>
  );
}

// ── TypeBadge ──────────────────────────────────────────────────────────────────
export function TypeBadge({ type }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium">
      <span>{getTypeIcon(type)}</span>
      <span className="capitalize">{getTypeLabel(type)}</span>
    </span>
  );
}

// ── EmptyState ─────────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title = 'Nothing here', desc = '', action }) {
  return (
    <div className="text-center py-16">
      <p className="text-2xl mb-4">{icon}</p>
      <p className="font-semibold text-slate-800 text-lg">{title}</p>
      {desc && <p className="text-slate-500 text-sm mt-2">{desc}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ── ConfirmDialog ──────────────────────────────────────────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-slate-600 text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-outline text-sm py-2 px-4">Cancel</button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={`text-sm py-2 px-4 rounded-xl font-semibold text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
