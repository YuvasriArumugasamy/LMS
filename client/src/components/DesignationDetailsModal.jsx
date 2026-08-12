import React, { useState } from 'react';
import { Modal } from './Modal';
import { Award, Building2, ShieldCheck, Hash, Trash2, Layers } from 'lucide-react';

export const DesignationDetailsModal = ({ isOpen, onClose, designation, currentUser, onDelete }) => {
  const [loading, setLoading] = useState(false);

  if (!designation) return null;

  const isHR = ['HR', 'ADMIN', 'CEO', 'TEAM_LEAD'].includes(currentUser?.role);

  const handleDeleteClick = async () => {
    if (window.confirm(`Are you sure you want to delete ${designation.name}?`)) {
      setLoading(true);
      await onDelete(designation._id);
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Designation Mapping Details" maxWidth="max-w-xl">
      <div className="space-y-6 pr-2 sm:pr-4 pb-6">
        {/* Header Overview Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-sky-500/5 to-transparent border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-primary text-white shadow-md shadow-primary/20 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                {designation.name}
              </h3>
              <p className="text-xs text-primary font-bold font-mono mt-1">
                CODE: {designation.code || 'N/A'}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Grade {designation.grade || 'L2'}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-500" /> Assigned Department
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {designation.department?.name || 'Unassigned'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-500" /> Job Level & Grade
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono">
              Level {designation.grade || 'L2'}
            </p>
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
              <Trash2 className="w-4 h-4" /> Delete Designation
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
