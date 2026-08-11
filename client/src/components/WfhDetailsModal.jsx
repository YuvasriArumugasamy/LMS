import React, { useState } from 'react';
import { Modal } from './Modal';
import { UserAvatar } from './UserAvatar';
import { StatusBadge } from './Badge';
import { Home, Calendar, FileText, Target, CheckCircle2, XCircle, Ban, MessageSquare } from 'lucide-react';

export const WfhDetailsModal = ({ isOpen, onClose, request, currentUser, onApprove, onReject, onCancel }) => {
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  if (!request) return null;

  const isManagerOrHR = ['MANAGER', 'HR', 'SUPER_ADMIN', 'CEO'].includes(currentUser?.role);
  const isPending = request.status === 'PENDING';
  const isOwner = request.user?._id === currentUser?._id;

  const handleApprove = async () => {
    setLoading(true);
    await onApprove(request._id, comments);
    setLoading(false);
    onClose();
  };

  const handleReject = async () => {
    setLoading(true);
    await onReject(request._id, comments);
    setLoading(false);
    onClose();
  };

  const handleCancel = async () => {
    setLoading(true);
    await onCancel(request._id);
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Work From Home (WFH) Details" maxWidth="max-w-xl">
      <div className="space-y-5 pr-1 sm:pr-3 pb-6">
        {/* User Banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <UserAvatar user={request.user} size="w-10 h-10 sm:w-12 sm:h-12 text-xs sm:text-sm shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                {request.user?.firstName} {request.user?.lastName}
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                {request.user?.employeeId || 'EMP'} • {request.user?.department?.name || 'Department'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60 dark:border-slate-700/60">
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" /> Date Period
            </p>
            <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">
              {new Date(request.fromDate).toLocaleDateString()} - {new Date(request.toDate).toLocaleDateString()}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Home className="w-3.5 h-3.5 text-indigo-500" /> Duration
            </p>
            <p className="text-xs font-bold text-primary mt-1">
              {request.daysCount} Day{request.daysCount > 1 ? 's' : ''} WFH
            </p>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Reason for WFH
          </label>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
            {request.reason || 'No reason specified.'}
          </div>
        </div>

        {/* Work Objectives */}
        {request.workObjectives && (
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Key Work Objectives
            </label>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200">
              {request.workObjectives}
            </div>
          </div>
        )}

        {/* Manager Review Action */}
        {isManagerOrHR && isPending && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Reviewer Comments
              </label>
              <input
                type="text"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Optional approval note or feedback..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={handleReject}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 w-full sm:w-auto"
              >
                <XCircle className="w-4 h-4" /> Reject WFH
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleApprove}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 w-full sm:w-auto"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve WFH
              </button>
            </div>
          </div>
        )}

        {/* Owner Cancel Action */}
        {isOwner && isPending && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <Ban className="w-4 h-4" /> Cancel Request
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
