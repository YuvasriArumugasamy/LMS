import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LeaveApplyModal } from './LeaveApplyModal';
import api from '../services/api';
import {
  Plus,
  CalendarPlus,
  UserPlus,
  ArrowUp,
  FileText,
  Clock,
  Bell
} from 'lucide-react';

export const MobileBottomNav = ({ onToggleSidebar, sidebarOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balance, setBalance] = useState(null);

  const isEmployeePage = location.pathname === '/employees';

  const scrollToTop = () => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      try { mainElement.scrollTo({ top: 0, behavior: 'smooth' }); } catch (err) { mainElement.scrollTop = 0; }
    }
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { document.body.scrollTop = 0; }
  };

  const handleOpenApplyModal = async () => {
    scrollToTop();
    if (user?.role === 'CEO') return;
    try {
      const [leaveTypesRes, balanceRes] = await Promise.all([
        api.get('/leave-types'),
        api.get('/leaves/balance')
      ]);
      setLeaveTypes(leaveTypesRes.data.data.leaveTypes || []);
      setBalance(balanceRes.data.data.balance);
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplyModalOpen(true);
    }
  };

  const goTo = (path) => {
    setIsSpeedDialOpen(false);
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(path);
  };

  return (
    <>
      {/* Dim Backdrop Blur Overlay when Speed Dial is open */}
      {isSpeedDialOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30 transition-opacity duration-300"
          onClick={() => setIsSpeedDialOpen(false)}
        />
      )}

      {/* Floating Speed Dial Container */}
      <div
        className={`lg:hidden fixed bottom-6 right-6 z-40 flex flex-col items-end transition-all duration-300 ${
          sidebarOpen ? 'opacity-0 pointer-events-none scale-90 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        {/* Speed Dial Menu Items Stack (Aligned vertically above main FAB button) */}
        <div
          className={`flex flex-col items-end gap-3 mb-3.5 transition-all duration-300 transform origin-bottom-right ${
            isSpeedDialOpen
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
          }`}
        >
          {/* Scroll to Top */}
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-extrabold shadow-lg backdrop-blur-md border border-slate-700/60 shrink-0">
              Scroll to Top
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                scrollToTop();
                setIsSpeedDialOpen(false);
              }}
              className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 transition-transform active:scale-95 border-2 border-white/20 shrink-0"
              title="Scroll to Top"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Add Employee (CEO/HR/ADMIN) */}
          {!isEmployeePage && ['CEO', 'HR', 'ADMIN'].includes(user?.role) && (
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-extrabold shadow-lg backdrop-blur-md border border-slate-700/60 shrink-0">
                Employee Management
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo('/employees');
                }}
                className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-transform active:scale-95 border-2 border-white/20 shrink-0"
                title="Employee Management"
              >
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}

          {/* Notifications */}
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-extrabold shadow-lg backdrop-blur-md border border-slate-700/60 shrink-0">
              Notifications
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo('/notifications');
              }}
              className="w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 transition-transform active:scale-95 border-2 border-white/20 shrink-0"
              title="Notifications"
            >
              <Bell className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Daily Work Reports */}
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-extrabold shadow-lg backdrop-blur-md border border-slate-700/60 shrink-0">
              Daily Work Reports
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo('/daily-reports');
              }}
              className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-lg shadow-violet-600/30 transition-transform active:scale-95 border-2 border-white/20 shrink-0"
              title="Daily Work Reports"
            >
              <FileText className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Attendance & Punch (Non-CEO) */}
          {user?.role !== 'CEO' && (
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-extrabold shadow-lg backdrop-blur-md border border-slate-700/60 shrink-0">
                Attendance & Punch
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo('/attendance');
                }}
                className="w-10 h-10 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-lg shadow-teal-600/30 transition-transform active:scale-95 border-2 border-white/20 shrink-0"
                title="Attendance & Punch"
              >
                <Clock className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}

          {/* Apply Leave (Non-CEO) */}
          {user?.role !== 'CEO' && (
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-extrabold shadow-lg backdrop-blur-md border border-slate-700/60 shrink-0">
                Apply Leave
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenApplyModal();
                  setIsSpeedDialOpen(false);
                }}
                className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition-transform active:scale-95 border-2 border-white/20 shrink-0"
                title="Apply Leave"
              >
                <CalendarPlus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>

        {/* Main Floating Action Button (FAB) */}
        <button
          type="button"
          onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
          className={`w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center justify-center shadow-xl shadow-blue-600/35 border-2 border-white dark:border-slate-800 transition-all duration-300 active:scale-95 ${
            isSpeedDialOpen ? 'rotate-135 bg-slate-800 shadow-slate-900/50' : 'rotate-0'
          }`}
          title="Quick Actions Menu"
        >
          <Plus className="w-6 h-6 stroke-[2.8]" />
        </button>
      </div>

      {/* Leave Application Modal */}
      <LeaveApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => { setIsApplyModalOpen(false); navigate('/leaves'); }}
        leaveTypes={leaveTypes}
        balance={balance}
      />
    </>
  );
};
