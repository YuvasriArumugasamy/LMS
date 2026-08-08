import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { UserAvatar } from './UserAvatar';
import { useAuth } from '../context/AuthContext';
import {
  FileEdit,
  Target,
  Clock,
  CheckCircle2,
  CalendarDays,
  CalendarClock,
  AlertTriangle,
  Info,
  X,
  Send,
  ChevronDown,
  AlertCircle,
  ClipboardCheck
} from 'lucide-react';
import api from '../services/api';

export const DailyReportSubmitModal = ({ isOpen, onClose, onSuccess, existingReport }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [pendingTasks, setPendingTasks] = useState('');
  const [blockers, setBlockers] = useState('');
  const [hoursWorked, setHoursWorked] = useState(8);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (existingReport) {
        setTitle(existingReport.title || '');
        setTasksCompleted(existingReport.tasksCompleted || '');
        setPendingTasks(existingReport.pendingTasks || '');
        setBlockers(existingReport.blockers || '');
        setHoursWorked(existingReport.hoursWorked || 8);
      } else {
        setTitle('');
        setTasksCompleted('');
        setPendingTasks('');
        setBlockers('');
        setHoursWorked(8);
      }
      setError('');
    }
  }, [isOpen, existingReport]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !tasksCompleted.trim()) {
      setError('Please provide a report title and tasks completed.');
      return;
    }

    const payload = {
      title: title.trim(),
      tasksCompleted: tasksCompleted.trim(),
      pendingTasks: pendingTasks.trim(),
      blockers: blockers.trim(),
      hoursWorked: Number(hoursWorked) || 8
    };

    try {
      setSubmitting(true);
      if (existingReport && existingReport._id) {
        await api.put(`/daily-reports/${existingReport._id}`, payload);
      } else {
        await api.post('/daily-reports', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save daily report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showHeader={false} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        {/* Custom Header Matching Image 1 */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
              <FileEdit className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {existingReport ? 'Edit Daily Work Report' : 'Submit Daily Work Report'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-400 font-medium">
                Update your daily progress and keep track of your tasks.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Employee & Date Profile Card Matching Image 1 */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-purple-50/60 dark:from-slate-800/80 dark:to-slate-800/40 border border-indigo-100/80 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <UserAvatar user={user} size="w-11 h-11 text-sm shrink-0" />
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {user?.firstName || 'Employee'} {user?.lastName || ''}
              </h3>
              <p className="text-xs text-indigo-600/90 dark:text-indigo-400 font-extrabold mt-0.5">
                {user?.employeeId || 'EMP-4889'} • {user?.department?.name || 'Engineering'}
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/90 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 flex items-center gap-2.5 shadow-2xs shrink-0">
            <div className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <CalendarDays className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block leading-none">Date</span>
              <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300 block mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Row 1: Report Title & Logged Hours (2 Cols) Matching Image 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <Target className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>Report Title / Primary Focus *</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frontend development & admin page updates"
              className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-all shadow-2xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>Logged Hours Worked</span>
            </label>
            <div className="flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
              <input
                type="number"
                min="1"
                max="24"
                step="0.5"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                className="w-full p-3 bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none"
              />
              <div className="px-3 py-3 bg-slate-50 dark:bg-slate-700/50 border-l border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-300 flex items-center gap-1 shrink-0">
                <span>Hours</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Tasks Completed Today * Matching Image 1 */}
        <div className="space-y-1.5">
          <label className="block text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span>Tasks Completed Today *</span>
          </label>
          <div className="relative">
            <textarea
              value={tasksCompleted}
              onChange={(e) => setTasksCompleted(e.target.value)}
              rows="3"
              maxLength="1000"
              placeholder="Describe tasks completed today..."
              className="w-full p-3.5 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all leading-relaxed shadow-2xs"
              required
            />
            <span className="absolute right-3 bottom-2.5 text-[10px] font-bold text-slate-400 pointer-events-none">
              {tasksCompleted.length}/1000
            </span>
          </div>
        </div>

        {/* Row 3: Pending Tasks & Blockers (2 Cols) Matching Image 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Pending Tasks */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <CalendarClock className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>Pending / Carried Over Tasks</span>
            </label>
            <div className="relative">
              <textarea
                value={pendingTasks}
                onChange={(e) => setPendingTasks(e.target.value)}
                rows="3"
                maxLength="1000"
                placeholder="Tasks carried over to tomorrow..."
                className="w-full p-3 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-all shadow-2xs"
              />
              <span className="absolute right-3 bottom-2.5 text-[10px] font-bold text-slate-400 pointer-events-none">
                {pendingTasks.length}/1000
              </span>
            </div>
          </div>

          {/* Blockers / Issues */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>Blockers / Challenges</span>
            </label>
            <div className="relative">
              <textarea
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                rows="3"
                maxLength="1000"
                placeholder="Any blockers or assistance needed..."
                className="w-full p-3 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-rose-500 transition-all shadow-2xs"
              />
              <span className="absolute right-3 bottom-2.5 text-[10px] font-bold text-slate-400 pointer-events-none">
                {blockers.length}/1000
              </span>
            </div>
          </div>
        </div>

        {/* Tip Banner Matching Image 1 */}
        <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between gap-3 relative overflow-hidden shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-blue-500/30">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 dark:text-slate-200 leading-none">
                Tip
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                Be specific and concise. This helps your team stay informed and aligned.
              </p>
            </div>
          </div>

          <ClipboardCheck className="absolute -right-3 -bottom-3 w-16 h-16 text-blue-200/50 dark:text-blue-900/30 pointer-events-none stroke-[1]" />
        </div>

        {/* Footer Actions Matching Image 1 */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
