import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserAvatar } from '../components/UserAvatar';
import { AuditLogDetailsModal } from '../components/AuditLogDetailsModal';
import { ShieldAlert, Terminal, User, Clock, ChevronRight, Filter, Search } from 'lucide-react';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/audit');
        setLogs(res.data.data.logs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleOpenDetails = (log) => {
    setSelectedLog(log);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Security Audit Logs</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">Compliance logging of user access, leave actions, and system modifications</p>
      </div>

      {/* Responsive Compact Audit Log Cards (Zero Horizontal Scrolling!) */}
      {error && (
        <div className="glass-card p-8 text-center text-rose-500 font-semibold">
          {error}
        </div>
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
              {/* User Actor Info (Avatar & Name): 4 Columns */}
              <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar user={{ firstName: log.userName }} size="w-10 h-10 text-xs" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors text-xs sm:text-sm md:text-base truncate">
                      {log.userName || 'System Engine'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono font-semibold uppercase">{log.role || 'ACTOR'}</p>
                  </div>
                </div>

                {/* Module Badge right-aligned on mobile */}
                <div className="md:hidden shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary uppercase">
                    {log.module}
                  </span>
                </div>
              </div>

              {/* Action Column: 3 Columns */}
              <div className="hidden md:flex md:col-span-3 items-center">
                <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  {log.action}
                </span>
              </div>

              {/* Module Column: 2 Columns */}
              <div className="hidden md:flex md:col-span-2 items-center font-mono text-xs font-bold text-primary uppercase">
                {log.module}
              </div>

              {/* Timestamp & Action Chevron: 3 Columns */}
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
            No audit logs found.
          </div>
        )}
      </div>

      {/* Audit Log Interactive Details Modal */}
      <AuditLogDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        log={selectedLog}
      />
    </div>
  );
};
