import React, { useState } from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', type = 'danger' }) => {
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(comments);
      setComments('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const buttonColors = {
    danger: 'bg-danger hover:bg-red-600 text-white shadow-danger/25',
    success: 'bg-success hover:bg-emerald-600 text-white shadow-success/25',
    primary: 'bg-primary hover:bg-blue-700 text-white shadow-primary/25'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-amber-500">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{message}</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Comments / Notes (Required for rejection)
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add relevant comments or explanation..."
            rows={3}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className={`px-5 py-2 text-xs font-bold rounded-xl shadow-lg transition-all ${buttonColors[type]} disabled:opacity-50`}
          >
            {submitting ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
