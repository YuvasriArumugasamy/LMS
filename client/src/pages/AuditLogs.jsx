import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { UserAvatar } from '../components/UserAvatar';
import { AuditLogDetailsModal } from '../components/AuditLogDetailsModal';
import { ShieldAlert, ChevronRight, Filter, Search, X, Calendar, ChevronLeft, ChevronRight as ChevronRightIcon, Trash2 } from 'lucide-react';

const MODULE_OPTIONS = ['', 'AUTHENTICATION', 'EMPLOYEE', 'LEAVE', 'ATTENDANCE', 'HOLIDAY', 'DEPARTMENT', 'DESIGNATION', 'LEAVE_TYPE', 'WFH', 'SYSTEM'];

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Filters
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionSearch, setActionSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit: LIMIT };
      if (moduleFilter) params.module = moduleFilter;
      if (actionSearch.trim()) params.action = actionSearch.trim();
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await api.get('/audit', { params });
      setLogs(res.data.data.logs || []);
      setTotal(res.data.data.pagination?.total || 0);
      setTotalPages(res.data.data.pagination?.pages || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [page, moduleFilter, actionSearch, fromDate, toDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [moduleFilter, actionSearch, fromDate, toDate]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const handleClearFilters = () => {
    setModuleFilter('');
    setActionSearch('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const hasActiveFilters = moduleFilter || actionSearch || fromDate || toDate;

  const handleOpenDetails = (log) => {
    setSelectedLog(log);
    setIsDetailsModalOpen(true);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
      try {
        await api.delete('/audit');
        fetchLogs();
      } catch (err) {
        console.error(err);
        setError('Failed to clear audit logs.');
      }
    }
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Security Audit Logs</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Compliance logging of user access, leave actions, and system modifications
            {total > 0 && <span className="ml-2 font-bold text-primary">({total} total records)</span>}
          </p>
        </div>
        {logs.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-sm font-bold flex items-center gap-1.5 transition-all hover:bg-rose-100 dark:hover:bg-rose-900/40 shrink-0 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear All</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-3.5 sm:p-4 space-y-3 max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
          {/* Action Search */}
          <div className="relative flex-1 min-w-0 sm:min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={actionSearch}
              onChange={(e) => setActionSearch(e.target.value)}
              placeholder="Search action..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            {/* Module Filter */}
            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial min-w-[120px]">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-primary"
              >
                <option value="">All Modules</option>
                {MODULE_OPTIONS.filter(Boolean).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Date Range - Mobile View (Calendar Icons Only) */}
            <div className="flex items-center gap-1.5 sm:hidden shrink-0">
              {/* From Date Icon Button */}
              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    fromDate
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                  title={fromDate ? `From: ${fromDate}` : 'Pick From Date'}
                >
                  <Calendar className="w-4 h-4" />
                  {fromDate && <span className="text-[10px] font-mono">{fromDate.slice(5)}</span>}
                </button>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
              </div>

              <span className="text-slate-400 text-xs font-bold">—</span>

              {/* To Date Icon Button */}
              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    toDate
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                  title={toDate ? `To: ${toDate}` : 'Pick To Date'}
                >
                  <Calendar className="w-4 h-4" />
                  {toDate && <span className="text-[10px] font-mono">{toDate.slice(5)}</span>}
                </button>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
              </div>
            </div>

            {/* Date Range - Desktop View */}
            <div className="hidden sm:flex items-center gap-1.5 flex-initial">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-primary"
                title="From date"
              />
              <span className="text-slate-400 text-xs font-bold">—</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-primary"
                title="To date"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-1.5 transition-all hover:bg-rose-100"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Logs List */}
      {error && (
        <div className="glass-card p-4 text-center text-rose-500 font-semibold text-sm">{error}</div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="glass-card p-8 text-center text-slate-400 font-medium">Loading audit logs...</div>
        ) : logs.length > 0 ? (
          logs.map((log) => (
            <div
              key={log._id}
              onClick={() => handleOpenDetails(log)}
              className="glass-card p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 items-center gap-3 md:gap-4 cursor-pointer hover:border-primary/50 transition-all group"
            >
              {/* User Actor: 4 cols */}
              <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar user={{ firstName: log.userName }} size="w-10 h-10 text-xs" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors text-xs sm:text-sm md:text-base truncate">
                      {log.userName || 'System Engine'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono font-semibold uppercase">
                      {log.userRole === 'TEAM_LEAD' ? 'Team Lead' : log.userRole === 'ADMIN' ? 'Admin' : log.userRole || 'SYSTEM'}
                    </p>
                  </div>
                </div>
                <div className="md:hidden shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary uppercase">
                    {log.module}
                  </span>
                </div>
              </div>

              {/* Action: 3 cols */}
              <div className="hidden md:flex md:col-span-3 items-center">
                <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 truncate max-w-full">
                  {log.action}
                </span>
              </div>

              {/* Module: 2 cols */}
              <div className="hidden md:flex md:col-span-2 items-center font-mono text-xs font-bold text-primary uppercase truncate">
                {log.module}
              </div>

              {/* Timestamp + chevron: 3 cols */}
              <div className="flex items-center justify-between md:justify-end gap-3 md:col-span-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 font-semibold">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white text-slate-400 flex items-center justify-center transition-all shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card p-12 text-center text-slate-400 font-medium">
            No audit logs found{hasActiveFilters ? ' for selected filters.' : '.'}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center disabled:opacity-40 hover:bg-primary hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-3">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center disabled:opacity-40 hover:bg-primary hover:text-white transition-all"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Details Modal */}
      <AuditLogDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        log={selectedLog}
      />
    </div>
  );
};
