import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import api from '../services/api';
import { AlertCircle, Zap, Calendar, FileText, Phone, Paperclip } from 'lucide-react';

export const LeaveApplyModal = ({ isOpen, onClose, onSuccess, leaveTypes = [], balance }) => {
  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayType, setHalfDayType] = useState('FIRST_HALF');
  const [isEmergency, setIsEmergency] = useState(false);
  const [reason, setReason] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [daysCount, setDaysCount] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (leaveTypes.length > 0 && !leaveType) {
      setLeaveType(leaveTypes[0]._id);
    }
  }, [leaveTypes, leaveType]);

  // Auto-calculate leave duration
  useEffect(() => {
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      if (start <= end) {
        if (isHalfDay) {
          setDaysCount(0.5);
        } else {
          const diffTime = Math.abs(end - start);
          const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          setDaysCount(days);
        }
        setError('');
      } else {
        setDaysCount(0);
        setError('From Date cannot be later than To Date.');
      }
    }
  }, [fromDate, toDate, isHalfDay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason) {
      setError('Please fill in all required fields.');
      return;
    }
    if (daysCount <= 0) {
      setError('Invalid date selection.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const attachments = (attachmentName.trim() && attachmentUrl.trim()) ? [{
        fileName: attachmentName.trim(),
        fileUrl: attachmentUrl.trim(),
        fileType: 'application/pdf'
      }] : [];

      await api.post('/leaves', {
        leaveType,
        fromDate,
        toDate,
        isHalfDay,
        halfDayType: isHalfDay ? halfDayType : 'NONE',
        isEmergency,
        reason,
        contactNumber,
        attachments
      });

      onSuccess();
      onClose();
      // Reset Form
      setReason('');
      setContactNumber('');
      setAttachmentName('');
      setAttachmentUrl('');
      setIsEmergency(false);
      setIsHalfDay(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave application.');
    } finally {
      setSubmitting(false);
    }
  };

  // Remaining days for selected leave type
  const selectedAlloc = balance?.allocations?.find(
    (a) => a.leaveType?._id === leaveType || a.leaveType === leaveType
  );
  const remainingDays = selectedAlloc ? selectedAlloc.remaining : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply for Leave" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Leave Type Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Leave Type *
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
          >
            {leaveTypes.map((lt) => (
              <option key={lt._id} value={lt._id}>
                {lt.name} ({lt.code}) — Max {lt.maxDays} Days
              </option>
            ))}
          </select>
          <div className="mt-1 text-xs text-slate-400 flex items-center justify-between font-medium">
            <span>Available Balance: <strong className="text-primary">{remainingDays} Days</strong></span>
            {remainingDays < daysCount && (
              <span className="text-amber-500 font-bold">⚠️ Warning: Exceeds Balance</span>
            )}
          </div>
        </div>

        {/* Date Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              From Date *
            </label>
            <input
              type="date"
              value={fromDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              To Date *
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
              required
            />
          </div>
        </div>

        {/* Half Day & Duration */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isHalfDay}
              onChange={(e) => setIsHalfDay(e.target.checked)}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Apply as Half Day</span>
          </label>

          {isHalfDay && (
            <select
              value={halfDayType}
              onChange={(e) => setHalfDayType(e.target.value)}
              className="p-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-900 dark:text-white outline-none"
            >
              <option value="FIRST_HALF">First Half (Morning)</option>
              <option value="SECOND_HALF">Second Half (Afternoon)</option>
            </select>
          )}

          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Days: </span>
            <span className="text-sm font-extrabold text-primary">{daysCount}</span>
          </div>
        </div>

        {/* Emergency Leave Toggle */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Emergency Leave Request</p>
              <p className="text-[11px] text-slate-500">Auto-escalates to HR if Manager doesn't respond in 5 mins.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={isEmergency}
            onChange={(e) => setIsEmergency(e.target.checked)}
            className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500 cursor-pointer"
          />
        </div>

        {/* Reason Textarea */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Reason for Leave *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please detail the reason for your leave request..."
            rows={3}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
            required
          />
        </div>

        {/* Medical Certificate / Supporting Attachment Field (Optional) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-primary" /> Medical Certificate / Attachment
            </span>
            <span className="text-[10px] text-slate-400 font-semibold lowercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              (Optional)
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              placeholder="e.g. Medical_Report_Aug.pdf"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
            />
            <input
              type="text"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="Document Link / Drive URL (Optional)"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            Attach medical report or fitness certificate for medical leave (optional).
          </p>
        </div>

        {/* Emergency Contact */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Emergency Contact Number During Leave
          </label>
          <input
            type="text"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || daysCount <= 0}
            className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-blue-700 rounded-xl shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
