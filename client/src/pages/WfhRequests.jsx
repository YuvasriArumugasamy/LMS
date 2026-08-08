import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { StatusBadge } from '../components/Badge';
import { ApplyWfhModal } from '../components/ApplyWfhModal';
import { WfhDetailsModal } from '../components/WfhDetailsModal';
import { Home, Plus, Filter, ChevronRight, Calendar } from 'lucide-react';

export const WfhRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchRequests = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/wfh/requests', { params });
      setRequests(res.data.data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleOpenDetails = (req) => {
    setSelectedRequest(req);
    setIsDetailsModalOpen(true);
  };

  const handleApprove = async (id, comments) => {
    try {
      await api.patch(`/wfh/${id}/approve`, { comments });
      fetchRequests();
    } catch (err) {
      alert('Failed to approve WFH request.');
    }
  };

  const handleReject = async (id, comments) => {
    try {
      await api.patch(`/wfh/${id}/reject`, { comments });
      fetchRequests();
    } catch (err) {
      alert('Failed to reject WFH request.');
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.patch(`/wfh/${id}/cancel`);
      fetchRequests();
    } catch (err) {
      alert('Failed to cancel WFH request.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Work From Home (WFH)</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Remote duty applications, manager approvals, and WFH quotas</p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-enterprise shadow-lg shadow-primary/25 flex items-center gap-2 transition-all w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Apply WFH
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved WFH</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Responsive WFH Cards (0% Horizontal Scroll) */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass-card p-8 text-center text-slate-400 font-medium">Loading WFH requests...</div>
        ) : requests.length > 0 ? (
          requests.map((r) => (
            <div
              key={r._id}
              onClick={() => handleOpenDetails(r)}
              className="glass-card p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 items-center gap-3 md:gap-4 cursor-pointer hover:border-primary/50 transition-all group"
            >
              {/* Applicant Avatar & Name: 4 Columns */}
              <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar user={r.user} size="w-10 h-10 text-xs shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors text-xs sm:text-base truncate">
                      {r.user?.firstName} {r.user?.lastName}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono font-semibold">{r.user?.employeeId || 'EMP'}</p>
                  </div>
                </div>

                {/* Status Badge mobile right */}
                <div className="md:hidden shrink-0">
                  <StatusBadge status={r.status} />
                </div>
              </div>

              {/* Days & Reason Column: 4 Columns */}
              <div className="hidden md:flex md:col-span-4 items-center gap-2 min-w-0">
                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold shrink-0">
                  {r.daysCount} Day{r.daysCount > 1 ? 's' : ''} WFH
                </span>
                <span className="text-xs text-slate-500 truncate">{r.reason}</span>
              </div>

              {/* Date Period Column: 2 Columns */}
              <div className="hidden md:flex md:col-span-2 items-center text-xs font-mono font-semibold text-slate-500">
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
            No WFH requests found.
          </div>
        )}
      </div>

      {/* Apply WFH Modal */}
      <ApplyWfhModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={fetchRequests}
      />

      {/* WFH Details Interactive Modal */}
      <WfhDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        request={selectedRequest}
        currentUser={user}
        onApprove={handleApprove}
        onReject={handleReject}
        onCancel={handleCancel}
      />
    </div>
  );
};
