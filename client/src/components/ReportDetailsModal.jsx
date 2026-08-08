import React from 'react';
import { Modal } from './Modal';
import { UserAvatar } from './UserAvatar';
import { StatusBadge } from './Badge';
import { Calendar, FileText, UserCheck, Clock, Hash } from 'lucide-react';

export const ReportDetailsModal = ({ isOpen, onClose, report }) => {
  if (!report) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leave Analytics Record Details" maxWidth="max-w-xl">
      <div className="space-y-6 pr-2 sm:pr-4 pb-6">
        {/* User Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <UserAvatar user={report.user} size="w-12 h-12 text-sm shrink-0" />
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                {report.user?.firstName} {report.user?.lastName}
              </h3>
              <p className="text-xs text-slate-500 font-semibold font-mono mt-0.5">
                ID: {report.user?.employeeId || 'N/A'} • {report.user?.department?.name || 'Department'}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <StatusBadge status={report.status} />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" /> Leave Duration
            </p>
            <p className="text-sm font-bold text-primary mt-1">
              {report.daysCount} Day{report.daysCount > 1 ? 's' : ''} ({report.leaveType?.name})
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" /> Date Period
            </p>
            <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">
              {new Date(report.fromDate).toLocaleDateString()} - {new Date(report.toDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Reason & Notes
          </label>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
            {report.reason || 'Leave request submitted for corporate record.'}
          </div>
        </div>
      </div>
    </Modal>
  );
};
