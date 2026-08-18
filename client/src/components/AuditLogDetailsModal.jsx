import React from 'react';
import { Modal } from './Modal';
import { UserAvatar } from './UserAvatar';
import { ShieldAlert, Terminal, Clock, Globe, Cpu, Hash, FileText } from 'lucide-react';

export const AuditLogDetailsModal = ({ isOpen, onClose, log }) => {
  if (!log) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Security Audit Event Details" maxWidth="max-w-2xl">
      <div className="space-y-6 pr-2 sm:pr-4 pb-6">
        {/* Banner Overview */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight font-mono break-all sm:break-normal">
                {log.action}
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-0.5">
                Module: <span className="text-primary font-mono font-bold uppercase">{log.module}</span>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right pl-12 sm:pl-0 mt-1 sm:mt-0">
            <span className="text-[10px] font-mono text-slate-400 font-semibold block">
              {new Date(log.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* User Performer Info */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar user={{ firstName: log.userName }} size="w-10 h-10 text-xs" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{log.userName || 'System Engine'}</p>
              <p className="text-[10px] text-slate-400 font-mono">User / System Actor</p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-primary/10 text-primary uppercase font-mono">
            {log.role || 'USER'}
          </span>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-500" /> IP Address
            </p>
            <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">
              {log.ipAddress || '127.0.0.1 (Localhost)'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-purple-500" /> Audit Log ID
            </p>
            <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1 truncate">
              {log._id}
            </p>
          </div>
        </div>

        {/* Event Details Message */}
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Event Description & Payload
          </label>
          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono border border-slate-800 leading-relaxed whitespace-pre-wrap break-words">
            {log.details || 'No additional payload specified.'}
          </div>
        </div>
      </div>
    </Modal>
  );
};
