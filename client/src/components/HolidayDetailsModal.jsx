import React, { useState } from 'react';
import { Modal } from './Modal';
import { CalendarCheck, Calendar as CalendarIcon, MapPin, FileText, Trash2 } from 'lucide-react';

export const HolidayDetailsModal = ({ isOpen, onClose, holiday, currentUser, onDelete }) => {
  const [loading, setLoading] = useState(false);

  if (!holiday) return null;

  const isHR = ['HR', 'SUPER_ADMIN', 'CEO'].includes(currentUser?.role);

  const handleDeleteClick = async () => {
    if (window.confirm(`Are you sure you want to remove ${holiday.name}?`)) {
      setLoading(true);
      await onDelete(holiday._id);
      setLoading(false);
      onClose();
    }
  };

  const formattedDate = new Date(holiday.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Corporate Holiday Details" maxWidth="max-w-xl">
      <div className="space-y-6 pr-2 sm:pr-4 pb-6">
        {/* Banner Overview */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-sky-500/5 to-transparent border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-primary text-white shadow-md shadow-primary/20 shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                {holiday.name}
              </h3>
              <p className="text-xs text-primary font-bold font-mono mt-1">
                {formattedDate}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {holiday.type}
            </span>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-500" /> Holiday Date
            </p>
            <p className="text-xs font-bold font-mono text-slate-900 dark:text-white mt-1">
              {new Date(holiday.date).toLocaleDateString()}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Applicable Branch
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
              {holiday.branch || 'All Branches'}
            </p>
          </div>
        </div>

        {/* Description Text */}
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Holiday Description & Details
          </label>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
            {holiday.description || 'Corporate Holiday observed across company branches.'}
          </div>
        </div>

        {/* HR Delete Action Button */}
        {isHR && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={handleDeleteClick}
              className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> Remove Holiday Entry
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
