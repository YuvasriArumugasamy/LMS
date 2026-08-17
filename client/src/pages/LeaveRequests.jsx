import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/Badge';
import { UserAvatar } from '../components/UserAvatar';
import { LeaveApplyModal } from '../components/LeaveApplyModal';
import { LeaveDetailsModal } from '../components/LeaveDetailsModal';
import { Plus, Search, Filter, Calendar, ChevronRight, ChevronLeft, Zap, Eye, CheckCircle2, XCircle } from 'lucide-react';

const LIMIT = 10;

export const LeaveRequests = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;

      const [leavesRes, typesRes, balRes] = await Promise.all([
        api.get('/leaves', { params }),
        api.get('/leave-types').catch(() => ({ data: { data: { leaveTypes: [] } } })),
        api.get('/leaves/balance').catch(() => ({ data: { data: { balance: null } } }))
      ]);

      setLeaves(leavesRes.data.data.leaves || []);
      setTotal(leavesRes.data.data.pagination?.total || 0);
      setTotalPages(leavesRes.data.data.pagination?.pages || 1);
      setLeaveTypes(typesRes.data?.data?.leaveTypes || []);
      setBalance(balRes.data?.data?.balance || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const handleOpenDetails = (leave) => {
    setSelectedLeave(leave);
    setIsDetailsModalOpen(true);
  };

  const handleApprove = async (leave, comments) => {
    try {
      await api.post(`/leaves/${leave._id}/approve`, { comments });
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (leave, comments) => {
    try {
      await api.post(`/leaves/${leave._id}/reject`, { comments });
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  const handleCancel = async (leave) => {
    try {
      await api.post(`/leaves/${leave._id}/cancel`);
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Leave Requests</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Review and process leave applications across your organization</p>
        </div>

        {user?.role !== 'CEO' && (
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-enterprise shadow-lg shadow-primary/25 flex items-center gap-2 transition-all w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" /> Apply for Leave
          </button>
        )}
      </div>

      {/* Filter Dropdown */}
      <div className="glass-card p-3 sm:p-4 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 shrink-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Filter by Status:</span>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 sm:px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-primary cursor-pointer w-auto min-w-0"
        >
          <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">All Leaves</option>
          <option value="PENDING" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Pending</option>
          <option value="TEAM_LEAD_APPROVED" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">TL Approved</option>
          <option value="ESCALATED_TO_HR" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Escalated HR</option>
          <option value="APPROVED" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Approved</option>
          <option value="REJECTED" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Rejected</option>
        </select>
      </div>

      {/* 12-Column Responsive Grid Cards for Perfect Alignment on Tablet & Desktop */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass-card p-8 text-center text-slate-400 font-medium">Loading leave requests...</div>
        ) : leaves.length > 0 ? (
          leaves.map((leave) => (
            <div
              key={leave._id}
              onClick={() => handleOpenDetails(leave)}
              className="glass-card p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 items-center gap-3 md:gap-4 cursor-pointer hover:border-primary/50 transition-all group"
            >
              {/* Applicant Info (Avatar, Name, Dept): 4 Columns */}
              <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar user={leave.user} size="w-10 h-10 sm:w-11 sm:h-11 text-xs" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors text-xs sm:text-sm md:text-base truncate">
                      {leave.user?.firstName} {leave.user?.lastName}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold truncate">
                      {leave.user?.department?.name || 'Engineering'}
                    </p>
                  </div>
                </div>

                {/* Status Badge right-aligned on mobile only */}
                <div className="md:hidden shrink-0">
                  <StatusBadge status={leave.status} applicantRole={leave.user?.role} />
                </div>
              </div>

              {/* Status Badge Column: 3 Columns on Tablet & Desktop */}
              <div className="hidden md:flex md:col-span-3 items-center">
                <StatusBadge status={leave.status} applicantRole={leave.user?.role} />
              </div>

              {/* Leave Type Column: 3 Columns on Tablet & Desktop */}
              <div className="md:col-span-3 flex items-center gap-2 flex-wrap">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: leave.leaveType?.colorBadge || '#2563EB' }}
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{leave.leaveType?.name}</span>
                {leave.isEmergency && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                    ⚡ EMERGENCY
                  </span>
                )}
              </div>

              {/* Duration & Chevron Column: 2 Columns on Tablet & Desktop */}
              <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-left md:text-right">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {new Date(leave.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                    {new Date(leave.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-[10px] sm:text-[11px] font-extrabold text-primary md:text-right">
                    {leave.daysCount} Day{leave.daysCount > 1 ? 's' : ''}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white text-slate-400 flex items-center justify-center transition-all shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card p-12 text-center text-slate-400 font-medium">
            No leave requests found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center disabled:opacity-40 hover:bg-primary hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Page {page} of {totalPages} <span className="text-slate-400 font-medium">({total} total)</span>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center disabled:opacity-40 hover:bg-primary hover:text-white transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Leave Details Interactive Modal */}
      <LeaveDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        leave={selectedLeave}
        currentUser={user}
        onApprove={handleApprove}
        onReject={handleReject}
        onCancel={handleCancel}
      />

      {/* Apply Leave Modal */}
      <LeaveApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={fetchLeaves}
        leaveTypes={leaveTypes}
        balance={balance}
      />
    </div>
  );
};
