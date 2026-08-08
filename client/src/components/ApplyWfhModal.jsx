import React, { useState } from 'react';
import { Modal } from './Modal';
import api from '../services/api';
import { Home, Calendar, FileText, Send, Target } from 'lucide-react';

export const ApplyWfhModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: '',
    workObjectives: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fromDate || !formData.toDate || !formData.reason.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/wfh/apply', formData);
      setFormData({
        fromDate: '',
        toDate: '',
        reason: '',
        workObjectives: ''
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit WFH request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply Work From Home (WFH)" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4 pr-1 pb-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
          <Home className="w-5 h-5 text-blue-500 shrink-0" />
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Request remote duty approval. Upon manager approval, your status will automatically show as <span className="font-bold text-blue-500">WFH</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> From Date *
            </label>
            <input
              type="date"
              value={formData.fromDate}
              onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> To Date *
            </label>
            <input
              type="date"
              value={formData.toDate}
              onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-primary"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Reason for WFH *
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="e.g. Home maintenance, medical checkup nearby, or focused project delivery..."
            rows={2}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1 flex items-center gap-1">
            <Target className="w-3.5 h-3.5" /> Key Work Objectives / Deliverables
          </label>
          <input
            type="text"
            value={formData.workObjectives}
            onChange={(e) => setFormData({ ...formData, workObjectives: e.target.value })}
            placeholder="e.g. Complete Sprint tasks, review pull requests..."
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {loading ? 'Submitting...' : 'Submit WFH Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
