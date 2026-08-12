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
      {/* Floating Speed Dial (hidden when sidebar open) */}
      <div
        className={`lg:hidden fixed bottom-6 right-6 z-30 transition-all duration-300 ${
          sidebarOpen ? 'opacity-0 pointer-events-none scale-90 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        <div className="speed-dial-wrapper">
          <input
            type="checkbox"
            className="hidden-trigger"
            id="mobile-speed-dial-toggle"
            checked={isSpeedDialOpen}
            onChange={(e) => setIsSpeedDialOpen(e.target.checked)}
          />
          <label className="circle" htmlFor="mobile-speed-dial-toggle" title="Quick Actions Menu">
            <Plus className="plus-icon" />
          </label>

          <div className="subs">
            {/* Apply Leave */}
            {user?.role !== 'CEO' && (
              <button
                type="button"
                className="sub-circle bg-blue-600 hover:bg-blue-700"
                title="Apply Leave"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenApplyModal();
                  setTimeout(() => setIsSpeedDialOpen(false), 50);
                }}
              >
                <CalendarPlus className="w-4 h-4 text-white" />
              </button>
            )}

            {/* Attendance & Punch */}
            {user?.role !== 'CEO' && (
              <button
                type="button"
                className="sub-circle bg-teal-600 hover:bg-teal-700"
                title="Attendance & Punch"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo('/attendance');
                }}
              >
                <Clock className="w-4 h-4 text-white" />
              </button>
            )}

            {/* Daily Work Reports */}
            <button
              type="button"
              className="sub-circle bg-violet-600 hover:bg-violet-700"
              title="Daily Work Reports"
              onClick={(e) => {
                e.stopPropagation();
                goTo('/daily-reports');
              }}
            >
              <FileText className="w-4 h-4 text-white" />
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="sub-circle bg-rose-500 hover:bg-rose-600"
              title="Notifications"
              onClick={(e) => {
                e.stopPropagation();
                goTo('/notifications');
              }}
            >
              <Bell className="w-4 h-4 text-white" />
            </button>

            {/* Add Employee (HR/Admin/CEO only) */}
            {!isEmployeePage && ['CEO', 'HR', 'ADMIN'].includes(user?.role) && (
              <button
                type="button"
                className="sub-circle bg-purple-600 hover:bg-purple-700"
                title="Employee Management"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo('/employees');
                }}
              >
                <UserPlus className="w-4 h-4 text-white" />
              </button>
            )}

            {/* Scroll to Top */}
            <button
              type="button"
              className="sub-circle bg-amber-500 hover:bg-amber-600"
              title="Scroll to Top"
              onClick={(e) => {
                e.stopPropagation();
                scrollToTop();
                setTimeout(() => setIsSpeedDialOpen(false), 50);
              }}
            >
              <ArrowUp className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
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
