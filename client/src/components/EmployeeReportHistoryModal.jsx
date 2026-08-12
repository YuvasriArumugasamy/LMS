import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import { UserAvatar } from './UserAvatar';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Award,
  ChevronRight,
  History,
  Eye,
  MessageSquare
} from 'lucide-react';

const formatEmpId = (empId, fallback = 'EMP001') => {
  if (!empId) return fallback;
  if (typeof empId === 'string' && empId.match(/^[0-9a-fA-F]{24}$/)) {
    return 'EMP' + empId.slice(-3).toUpperCase();
  }
  return empId;
};

const formatDepartmentName = (dept, fallback = 'Engineering') => {
  if (!dept) return fallback;
  if (typeof dept === 'object' && dept.name) return dept.name;
  if (typeof dept === 'string' && !dept.match(/^[0-9a-fA-F]{24}$/)) return dept;
  return fallback;
};

const formatDesignation = (desig) => {
  if (!desig) return '';
  if (typeof desig === 'object') return desig.title || desig.name || '';
  if (typeof desig === 'string' && desig.match(/^[0-9a-fA-F]{24}$/)) return '';
  return desig;
};

export const EmployeeReportHistoryModal = ({ isOpen, onClose, userId, onSelectReport }) => {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchEmployeeHistory();
    }
  }, [isOpen, userId]);

  const fetchEmployeeHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/daily-reports/history/${userId}`);
      setHistoryData(res.data.data);
    } catch (err) {
      console.error('[Employee History Error]', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const targetUser = historyData?.user;
  const reports = historyData?.reports || [];
  const stats = historyData?.stats || {};

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start sm:items-center justify-between bg-slate-50/50 dark:bg-slate-950/40 gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
              <History className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                Employee Report History
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                Complete log of daily work reports submitted by this employee.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-16 text-center text-slate-400 font-medium text-sm">
              Loading employee report history...
            </div>
          ) : !targetUser ? (
            <div className="py-12 text-center text-slate-400 font-medium text-sm">
              No employee history data found.
            </div>
          ) : (
            <>
              {/* Employee Summary Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-800/80 dark:to-slate-900 border border-blue-100 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-5">
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <UserAvatar
                    user={targetUser}
                    size="w-12 h-12 sm:w-14 sm:h-14 text-sm sm:text-base font-black"
                    className="ring-4 ring-white dark:ring-slate-800 shadow-md shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight break-words">
                      {targetUser.firstName} {targetUser.lastName}
                    </h3>
                    <p className="text-[11px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 flex flex-wrap items-center gap-1.5">
                      <span>{formatEmpId(targetUser.employeeId)}</span>
                      <span className="text-indigo-300 dark:text-indigo-600">•</span>
                      <span className="truncate">{formatDepartmentName(targetUser.department)}</span>
                      {formatDesignation(targetUser.designation) && (
                        <>
                          <span className="text-indigo-300 dark:text-indigo-600">•</span>
                          <span className="truncate">{formatDesignation(targetUser.designation)}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Stat Badges */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-none px-3 py-2 sm:px-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-center shadow-2xs">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Total Reports</span>
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">{stats.totalSubmitted || 0}</span>
                  </div>
                  <div className="flex-1 sm:flex-none px-3 py-2 sm:px-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-center shadow-2xs">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Hours Logged</span>
                    <span className="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400">{stats.totalHours || 0} hrs</span>
                  </div>
                </div>
              </div>

              {/* Reports Timeline List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                  Submitted Daily Reports ({reports.length})
                </h4>

                {reports.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs font-semibold">
                    No past daily reports found for this employee.
                  </div>
                ) : (
                  reports.map((r) => (
                    <div
                      key={r._id}
                      onClick={() => onSelectReport && onSelectReport(r)}
                      className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-blue-400/60 dark:hover:border-blue-500/50 transition-all cursor-pointer group space-y-3 shadow-2xs"
                    >
                      {/* Top Bar: Date, Logged Hours, Status Badge */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs font-extrabold text-slate-900 dark:text-white">
                          <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                            <Calendar className="w-4 h-4" />
                            {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            {r.hoursWorked || 8} hrs
                          </span>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                          r.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                          r.status === 'REVIEWED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' :
                          'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        }`}>
                          <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                          {r.status}
                        </span>
                      </div>

                      {/* Report Title & Content Snippet */}
                      <div className="space-y-1">
                        <h5 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {r.title}
                        </h5>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold line-clamp-2 leading-relaxed">
                          {r.tasksCompleted}
                        </p>
                      </div>

                      {/* Optional Blockers / Feedback */}
                      {(r.blockers || r.feedback) && (
                        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold">
                          {r.blockers && (
                            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              Blocker: {r.blockers}
                            </span>
                          )}
                          {r.feedback && (
                            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 font-bold">
                              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                              Feedback: "{r.feedback}"
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
