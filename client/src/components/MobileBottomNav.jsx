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
