import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserAvatar } from '../components/UserAvatar';
import { StatusBadge } from '../components/Badge';
import { ReportDetailsModal } from '../components/ReportDetailsModal';
import { BarChart3, Download, FileSpreadsheet, FileText, Filter, Calendar, ChevronRight } from 'lucide-react';

export const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [status, setStatus] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCustomDate, setSelectedCustomDate] = useState('');
  const dateInputRef = React.useRef(null);

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.click();
      }
    }
  };

  const handleCustomDateChange = (e) => {
    const val = e.target.value;
    if (val) {
      setSelectedCustomDate(val);
      const pickedYear = new Date(val).getFullYear();
      setYear(pickedYear);
    }
  };

  const fetchReports = async () => {
    try {
      const params = { year };
      if (status) params.status = status;
      const res = await api.get('/reports', { params });
      setReports(res.data.data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [year, status]);

  const handleOpenDetails = (r) => {
    setSelectedReport(r);
    setIsDetailsModalOpen(true);
  };

  const handleExport = async (format) => {
    try {
      const res = await api.get('/reports/export', { params: { format } });
      const data = res.data.data;
      
      if (!data || data.length === 0) {
        alert('No data available to export.');
        return;
      }

      // Client-side CSV download trigger
      const keys = Object.keys(data[0] || {});
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [keys.join(','), ...data.map((row) => keys.map((k) => `"${row[k]}"`).join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Enterprise_Leave_Report_${year}.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to generate export file.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Enterprise Leave Reports</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Generate, analyze, and export comprehensive leave analytics</p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => handleExport('csv')}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel/CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Interactive Calendar Button with Overlay Date Input so picker opens right at the button */}
          <div className="relative inline-flex items-center">
            <button
              type="button"
              className="p-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-slate-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shrink-0 shadow-2xs"
              title="Click to pick date from calendar"
            >
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>

            {/* Invisible Native Date Input Overlay positioned directly on top of the button */}
            <input
              type="date"
              value={selectedCustomDate}
              onChange={handleCustomDateChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
          </div>

          <select
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value));
              setSelectedCustomDate('');
            }}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 shadow-2xs"
          >
            <option value={2026}>Year 2026</option>
            <option value={2025}>Year 2025</option>
            <option value={2024}>Year 2024</option>
          </select>

          {selectedCustomDate && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-black shadow-2xs">
              <span>{selectedCustomDate}</span>
              <button
                type="button"
                onClick={() => setSelectedCustomDate('')}
                className="hover:opacity-75 ml-1 text-xs font-bold"
                title="Clear date filter"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="HR_APPROVED">Approved Only</option>
            <option value="HR_REJECTED">Rejected Only</option>
            <option value="PENDING">Pending Only</option>
          </select>
        </div>
      </div>

      {/* Responsive Compact Leave Report Cards (Zero Horizontal Scrolling!) */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass-card p-8 text-center text-slate-400 font-medium">Loading leave reports...</div>
        ) : reports.length > 0 ? (
          reports.map((r) => (
            <div
              key={r._id}
              onClick={() => handleOpenDetails(r)}
              className="glass-card p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 items-center gap-3 md:gap-4 cursor-pointer hover:border-primary/50 transition-all group"
            >
              {/* Employee Avatar & Info: 4 Columns */}
              <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar user={r.user} size="w-10 h-10 text-xs shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors text-xs sm:text-base truncate">
                      {r.user?.firstName} {r.user?.lastName}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono font-semibold">{r.user?.employeeId || 'N/A'}</p>
                  </div>
                </div>

                {/* Status Badge right-aligned on mobile */}
                <div className="md:hidden shrink-0">
                  <StatusBadge status={r.status} />
                </div>
              </div>

              {/* Leave Type & Days Column: 3 Columns */}
              <div className="hidden md:flex md:col-span-3 items-center gap-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white">{r.leaveType?.name}</span>
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-extrabold">
                  {r.daysCount} Day{r.daysCount > 1 ? 's' : ''}
                </span>
              </div>

              {/* Date Period Column: 3 Columns */}
              <div className="hidden md:flex md:col-span-3 items-center text-xs font-mono font-semibold text-slate-500">
                {new Date(r.fromDate).toLocaleDateString()} - {new Date(r.toDate).toLocaleDateString()}
              </div>

              {/* Status & Action Arrow: 2 Columns */}
              <div className="flex items-center justify-between md:justify-end gap-3 md:col-span-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="hidden md:block">
                  <StatusBadge status={r.status} />
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white text-slate-400 flex items-center justify-center transition-all shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card p-12 text-center text-slate-400 font-medium">
            No leave records found for selected filters.
          </div>
        )}
      </div>

      {/* Leave Report Record Interactive Modal */}
      <ReportDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        report={selectedReport}
      />
    </div>
  );
};
