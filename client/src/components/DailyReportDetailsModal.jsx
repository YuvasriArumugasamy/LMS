import React, { useState } from 'react';
import { Modal } from './Modal';
import { UserAvatar } from './UserAvatar';
import {
  ClipboardList,
  Target,
  Clock,
  CheckCircle2,
  Check,
  CalendarDays,
  CalendarClock,
  AlertTriangle,
  Star,
  Download,
  Edit3,
  Trash2,
  MessageSquare
} from 'lucide-react';
import api from '../services/api';

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

export const DailyReportDetailsModal = ({
  isOpen,
  onClose,
  report,
  currentUser,
  onUpdateSuccess,
  onEditReport
}) => {
  const [feedback, setFeedback] = useState(report?.feedback || '');
  const [reviewStatus, setReviewStatus] = useState(report?.status || 'REVIEWED');
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!report) return null;

  const isReviewer = ['ADMIN', 'CEO', 'HR', 'TEAM_LEAD'].includes(currentUser?.role);
  const reportUserId = report.user?._id ? report.user._id.toString() : report.user ? report.user.toString() : '';
  const currentUserId = currentUser?._id ? currentUser._id.toString() : '';
  const isOwner = reportUserId && currentUserId && reportUserId === currentUserId;
  const canModify = isOwner;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.patch(`/daily-reports/${report._id}`, {
        feedback: feedback.trim(),
        status: reviewStatus
      });
      onUpdateSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/daily-reports/${report._id}`);
      setShowDeleteConfirm(false);
      onUpdateSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete report');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadReport = () => {
    const empName = `${report.user?.firstName || 'Employee'} ${report.user?.lastName || ''}`.trim();
    const dateStr = new Date(report.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const content = `========================================================================
             LIFE CHANGERS IND - DAILY WORK REPORT (DWR)
========================================================================

EMPLOYEE INFORMATION:
------------------------------------------------------------------------
Name:        ${empName}
Employee ID: ${report.user?.employeeId || 'N/A'}
Department:  ${report.user?.department?.name || 'N/A'}
Report Date: ${dateStr}
Status:      ${report.status || 'SUBMITTED'}

REPORT SUMMARY:
------------------------------------------------------------------------
Title / Focus:   ${report.title}
Hours Logged:    ${report.hoursWorked || 8} Hours

TASKS COMPLETED TODAY:
------------------------------------------------------------------------
${report.tasksCompleted}

PENDING / CARRIED OVER TASKS:
------------------------------------------------------------------------
${report.pendingTasks || 'None specified'}

BLOCKERS / CHALLENGES:
------------------------------------------------------------------------
${report.blockers || 'None reported'}

REVIEWER FEEDBACK:
------------------------------------------------------------------------
${report.feedback ? `"${report.feedback}"` : 'No reviewer feedback yet.'}

========================================================================
Generated via Life Changers Ind LMS Portal on ${new Date().toLocaleString()}
========================================================================
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeEmpName = empName.replace(/[^a-zA-Z0-9]/g, '_');
    const safeDate = new Date(report.date).toISOString().split('T')[0];
    link.download = `Daily_Report_${safeEmpName}_${safeDate}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} showHeader={false} maxWidth="max-w-2xl">
        <div className="space-y-4 p-1">
          {/* Custom Header Matching Image 1 */}
          <div className="flex items-center justify-between pb-1 pr-8 sm:pr-10">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
                <ClipboardList className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                  Daily Work Report Details
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 font-medium truncate">
                  Overview of your daily progress and tasks
                </p>
              </div>
            </div>
          </div>

          {/* User Profile Card Matching Image 1 */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-indigo-50/60 dark:from-slate-800/90 dark:to-slate-800/40 border border-blue-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <UserAvatar user={report.user} size="w-12 h-12 text-sm shrink-0" />
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {report.user?.firstName || 'Employee'} {report.user?.lastName || ''}
                </h3>
                <p className="text-xs text-blue-600/90 dark:text-blue-400 font-extrabold mt-0.5">
                  {formatEmpId(report.user?.employeeId)} • {formatDepartmentName(report.user?.department)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-extrabold border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                {new Date(report.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>

              <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase flex items-center gap-1 shadow-2xs ${
                report.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                report.status === 'REVIEWED' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800' :
                'bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800'
              }`}>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                {report.status}
              </span>
            </div>
          </div>

          {/* Action Toolbar (Icon Only Edit & Delete Buttons) */}
          {canModify && (
            <div className="flex items-center justify-end gap-2 pt-0.5">
              <button
                onClick={() => {
                  onClose();
                  if (onEditReport) onEditReport(report);
                }}
                title="Edit Report"
                className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center transition-all cursor-pointer border border-blue-200 dark:border-blue-800 shadow-2xs hover:scale-105"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete Report"
                className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-all cursor-pointer border border-rose-200 dark:border-rose-900 shadow-2xs hover:scale-105"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Project Title, Module Name & Work Status Badge */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-black border border-indigo-200 dark:border-indigo-800">
                  📁 Project: {report.projectTitle || 'Attendance Project'}
                </span>
                <span className="px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-black border border-purple-200 dark:border-purple-800">
                  🧩 Module: {report.moduleName || 'Employee Management'}
                </span>
              </div>

              {/* Work Progress Status Badge */}
              <span className={`px-3.5 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-2xs ${
                report.workStatus === 'PENDING'
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse'
                  : report.workStatus === 'COMPLETED'
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  : 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
              }`}>
                {report.workStatus === 'PENDING' ? '🟡 Task Status: Pending (Interrupted / Paused)' : report.workStatus === 'COMPLETED' ? '🟢 Task Status: Completed' : '🔵 Task Status: On Progress'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-900/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Target className="w-4.5 h-4.5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                    Report Focus / Title
                  </span>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
                    {report.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pl-4 border-l border-slate-100 dark:border-slate-700">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Clock className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">
                    {report.hoursWorked || 8} Hours
                  </span>
                  <span className="text-[9px] font-medium text-slate-400 block">
                    Total spent
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Specific Task Description Card Matching Image 1 */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 relative overflow-hidden shadow-2xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300/80 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Specific Task Description
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line relative z-10 pl-11">
              {report.tasksCompleted}
            </p>

            {/* Background Watermark Icon */}
            <ClipboardList className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 text-emerald-500/30 dark:text-emerald-400/25 pointer-events-none stroke-[1.4]" />
          </div>

          {/* Pending & Blockers 2-Column Row Matching Image 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Pending Tasks Card */}
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 relative overflow-hidden shadow-2xs">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 border border-blue-300/80 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0">
                  <CalendarClock className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Pending / Next Day Tasks
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line relative z-10 pl-10 pr-10">
                {report.pendingTasks || 'None specified'}
              </p>

              {/* Watermark */}
              <CalendarClock className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 text-blue-500/30 dark:text-blue-400/25 pointer-events-none stroke-[1.4]" />
            </div>

            {/* Blockers / Issues Card */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 relative overflow-hidden shadow-2xs">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 border border-amber-300/80 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-300 shrink-0">
                  <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Blockers / Issues
                </span>
              </div>

              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 leading-relaxed whitespace-pre-line relative z-10 pl-10 pr-10">
                {report.blockers || 'None reported'}
              </p>

              {/* Watermark */}
              <AlertTriangle className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 text-amber-500/30 dark:text-amber-400/25 pointer-events-none stroke-[1.4]" />
            </div>
          </div>

          {/* Feedback Section */}
          {report.feedback && (
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/60 space-y-1">
              <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 text-xs font-black">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Reviewer Feedback
                </span>
                {report.reviewedBy && (
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-100/70 dark:bg-indigo-900/50 px-2.5 py-0.5 rounded-full">
                    By {report.reviewedBy.firstName || 'User'} {report.reviewedBy.lastName || ''} ({report.reviewedBy.role === 'CEO' ? 'CEO Executive' : report.reviewedBy.role === 'TEAM_LEAD' ? 'TEAM_LEAD' : report.reviewedBy.role === 'HR' ? 'HR Manager' : 'Admin'})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium italic mt-1">
                "{report.feedback}"
              </p>
            </div>
          )}

          {/* Review Form for Manager / HR / CEO */}
          {isReviewer && (
            <form onSubmit={handleReviewSubmit} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Add Manager Review / Feedback
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus('REVIEWED')}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer ${
                      reviewStatus === 'REVIEWED' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Reviewed
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus('APPROVED')}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer ${
                      reviewStatus === 'APPROVED' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Approved
                  </button>
                </div>
              </div>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows="2"
                placeholder="Good progress on daily tasks. Approved."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Saving...' : 'Save Review'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer Motivation Bar Matching Image 1 */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                <Star className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 leading-tight">
                  Great job staying consistent!
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                  Keep up the good work and achieve your goals.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadReport}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Done / Download Report</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal matching Screenshot 1 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-5 animate-in zoom-in-95 duration-200">
            {/* Trash Badge Icon */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-red-400 flex items-center justify-center shadow-lg shadow-rose-500/30 text-white">
                <Trash2 className="w-10 h-10 stroke-[2]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 flex items-center justify-center text-amber-950 shadow-md">
                <AlertTriangle className="w-4 h-4 fill-amber-950 stroke-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Delete Work Report?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-200">"{report.title}"</span>?
              </p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl flex items-center gap-2.5 text-left text-amber-800 dark:text-amber-300 text-[11px] font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>This action cannot be undone and will permanently remove this daily report.</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-black shadow-lg shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
