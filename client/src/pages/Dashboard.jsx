import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ASSETS } from '../assets';
import { MetricCard } from '../components/Card';
import blueBgCard from '../assets/ChatGPT Image Aug 4, 2026, 04_51_49 PM.webp';
import greenBgCard from '../assets/ChatGPT Image Aug 4, 2026, 04_51_43 PM.webp';
import purpleBgCard from '../assets/ChatGPT Image Aug 4, 2026, 04_51_54 PM.webp';
import orangeBgCard from '../assets/ChatGPT Image Aug 4, 2026, 04_51_34 PM.webp';
import { StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LeaveApplyModal } from '../components/LeaveApplyModal';
import { FaceCameraModal } from '../components/FaceCameraModal';
import { UiverseStarButton } from '../components/UiverseStarButton';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  FileCheck2,
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
  Calendar as CalendarIcon,
  ChevronRight,
  MoreHorizontal,
  UserPlus,
  CalendarPlus,
  FileText,
  ArrowUpRight,
  ShieldAlert,
  PieChart as PieChartIcon,
  Search,
  SlidersHorizontal,
  Edit3
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const CircularProgress = ({ value, max, color }) => {
  const percentage = Math.round((value / max) * 100);
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 44 44" className="w-11 h-11 sm:w-12 sm:h-12 transform -rotate-90">
        <circle cx="22" cy="22" r={radius} stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-slate-800" fill="transparent" />
        <circle cx="22" cy="22" r={radius} stroke={color} strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" fill="transparent" className="transition-all duration-700 ease-out" />
      </svg>
      <span className="absolute text-[9px] sm:text-[10px] font-black tracking-tight text-slate-800 dark:text-white">{percentage}%</span>
    </div>
  );
};

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balance, setBalance] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedBalanceYear, setSelectedBalanceYear] = useState(new Date().getFullYear());

  // Face Camera Verification Modal State for Dashboard Check-In / Check-Out
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [pendingClockAction, setPendingClockAction] = useState(null); // 'clockIn' | 'clockOut'
  const [dashWorkLocation, setDashWorkLocation] = useState('WFH');

  // Leave Distribution Edit Modal State (CEO & SUPER_ADMIN Exclusive)
  const [isEditDistributionModalOpen, setIsEditDistributionModalOpen] = useState(false);
  const [editDistributionData, setEditDistributionData] = useState([]);
  const [savingDistribution, setSavingDistribution] = useState(false);

  const fetchDashboard = async (balanceYear) => {
    try {
      const year = balanceYear || selectedBalanceYear;
      const [statsRes, leaveTypesRes, balanceRes, attendanceRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/leave-types'),
        api.get('/leaves/balance', { params: { year } }),
        api.get('/attendance/today')
      ]);
      setStats(statsRes.data.data);
      setLeaveTypes(leaveTypesRes.data.data.leaveTypes || []);
      setBalance(balanceRes.data.data.balance);
      setTodayAttendance(attendanceRes.data.data.attendance);
    } catch (err) {
      console.error('[Dashboard Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Re-fetch balance when year changes
  const handleBalanceYearChange = async (year) => {
    setSelectedBalanceYear(year);
    try {
      const res = await api.get('/leaves/balance', { params: { year } });
      setBalance(res.data.data.balance);
    } catch (err) {
      console.error('[Balance Year Change Error]', err);
    }
  };

  const handleQuickClockIn = () => {
    setPendingClockAction('clockIn');
    setIsFaceModalOpen(true);
  };

  const handleQuickClockOut = () => {
    setPendingClockAction('clockOut');
    setIsFaceModalOpen(true);
  };

  const handleFaceVerificationSuccess = async (faceDescriptor) => {
    setActionLoading(true);
    try {
      if (pendingClockAction === 'clockIn') {
        await api.post('/attendance/clock-in', { workLocation: dashWorkLocation, faceDescriptor });
      } else if (pendingClockAction === 'clockOut') {
        await api.post('/attendance/clock-out', { faceDescriptor });
      }
      setIsFaceModalOpen(false);
      setPendingClockAction(null);
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${pendingClockAction === 'clockIn' ? 'check in' : 'check out'}.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEditDistribution = () => {
    if (leaveTypes && leaveTypes.length > 0) {
      setEditDistributionData(
        leaveTypes.map((lt) => ({
          id: lt._id,
          name: lt.name?.toLowerCase().includes('earned') ? 'Paid Leave' : lt.name,
          code: lt.code === 'EL' ? 'PL' : lt.code,
          maxDays: lt.maxDays || 0,
          colorBadge: lt.colorBadge || '#2563EB'
        }))
      );
    } else {
      setEditDistributionData([
        { id: 'cl', name: 'Casual Leave', code: 'CL', maxDays: 18, colorBadge: '#2563EB' },
        { id: 'sl', name: 'Sick Leave', code: 'SL', maxDays: 12, colorBadge: '#EF4444' },
        { id: 'pl', name: 'Paid Leave', code: 'PL', maxDays: 30, colorBadge: '#22C55E' },
        { id: 'eml', name: 'Emergency Leave', code: 'EML', maxDays: 10, colorBadge: '#F59E0B' }
      ]);
    }
    setIsEditDistributionModalOpen(true);
  };

  const handleSaveDistribution = async (e) => {
    e.preventDefault();
    setSavingDistribution(true);
    try {
      for (const item of editDistributionData) {
        if (item.id && !['cl', 'sl', 'pl', 'eml'].includes(item.id)) {
          await api.put(`/leave-types/${item.id}`, { maxDays: Number(item.maxDays) });
        }
      }
      setIsEditDistributionModalOpen(false);
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update leave distribution settings.');
    } finally {
      setSavingDistribution(false);
    }
  };

  const defaultTrend = [
    { month: 'Jan', leaves: 12 },
    { month: 'Feb', leaves: 18 },
    { month: 'Mar', leaves: 24 },
    { month: 'Apr', leaves: 15 },
    { month: 'May', leaves: 42 },
    { month: 'Jun', leaves: 32 },
    { month: 'Jul', leaves: 22 },
    { month: 'Aug', leaves: 19 },
    { month: 'Sep', leaves: 25 },
    { month: 'Oct', leaves: 30 },
    { month: 'Nov', leaves: 20 },
    { month: 'Dec', leaves: 15 }
  ];

  const rawTrend = stats?.monthlyTrend && stats.monthlyTrend.length > 0 ? stats.monthlyTrend : defaultTrend;

  const chartData = rawTrend.map((item) => ({
    month: item.month,
    leaves: item.leaves !== undefined ? item.leaves : (item.count !== undefined ? item.count : 10)
  }));

  const totalDaysAllTypes = leaveTypes.length > 0
    ? leaveTypes.reduce((sum, lt) => sum + (lt.maxDays || 0), 0)
    : 42;

  const pieData = leaveTypes.length > 0
    ? leaveTypes.map((lt) => {
        const cleanName = lt.name?.toLowerCase().includes('earned') ? 'Paid Leave' : lt.name;
        const cleanCode = lt.code === 'EL' ? 'PL' : lt.code;
        return {
          name: cleanName,
          code: cleanCode,
          value: totalDaysAllTypes > 0 ? Math.round(((lt.maxDays || 0) / totalDaysAllTypes) * 100) : 0,
          maxDays: lt.maxDays,
          color: lt.colorBadge || (cleanCode === 'CL' ? '#2563EB' : cleanCode === 'SL' ? '#EF4444' : (cleanCode === 'PL') ? '#22C55E' : '#F59E0B')
        };
      })
    : [
        { name: 'Casual Leave', value: 29, maxDays: 12, color: '#2563EB' },
        { name: 'Paid Leave', value: 36, maxDays: 15, color: '#22C55E' },
        { name: 'Emergency Leave', value: 12, maxDays: 5, color: '#F59E0B' },
        { name: 'Sick Leave', value: 24, maxDays: 10, color: '#EF4444' }
      ];

  const entitlements = balance?.allocations && balance.allocations.length > 0
    ? balance.allocations.map((alloc) => ({
        id: alloc._id,
        name: alloc.leaveTypeName?.toLowerCase().includes('earned') ? 'Paid Leave' : alloc.leaveTypeName,
        code: alloc.leaveTypeCode === 'EL' ? 'PL' : alloc.leaveTypeCode,
        remaining: alloc.remaining,
        total: alloc.total,
        color: alloc.colorBadge || (alloc.leaveTypeCode === 'CL' ? '#2563EB' : alloc.leaveTypeCode === 'SL' ? '#EF4444' : (alloc.leaveTypeCode === 'PL' || alloc.leaveTypeCode === 'EL') ? '#22C55E' : '#F59E0B')
      }))
    : [
        { id: '1', name: 'Casual Leave', code: 'CL', remaining: 12, total: 18, color: '#2563EB' },
        { id: '2', name: 'Sick Leave', code: 'SL', remaining: 10, total: 12, color: '#EF4444' },
        { id: '3', name: 'Paid Leave', code: 'PL', remaining: 15, total: 30, color: '#22C55E' },
        { id: '4', name: 'Emergency Leave', code: 'EML', remaining: 5, total: 10, color: '#F59E0B' }
      ];

  const getUserDisplayName = () => {
    if (user?.role === 'CEO') return 'CEO';
    let first = user?.firstName || '';
    let last = user?.lastName || '';
    let full = `${first} ${last}`.trim();
    if (!full && user?.email) {
      full = user.email.split('@')[0];
    }
    // Clean email digits/numbers if any (e.g. Yuvasrikutty2005 -> Yuvasri)
    let cleaned = full.replace(/\d+/g, '').replace(/([a-z])([A-Z])/g, '$1 $2').trim();
    if (cleaned.toLowerCase().includes('yuvasri')) {
      cleaned = 'Yuvasri';
    }
    return cleaned || user?.firstName || 'Employee';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile Top Search Bar Widget */}
      <div className="md:hidden w-full mb-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              navigate(`/employees?search=${encodeURIComponent(searchQuery)}`);
            }
          }}
          className="relative w-full"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees, leaves, departments..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 rounded-2xl outline-none shadow-2xs focus:border-blue-500 transition-all"
          />
        </form>
      </div>

      {/* ================= ROW 1: WELCOME BANNER + QUICK ACTIONS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Welcome Banner matching Original Design with Distinct Border (8 Cols) */}
        <div className="lg:col-span-8 relative rounded-3xl bg-[#EEF4FF] dark:bg-slate-900/90 border-2 border-blue-200 dark:border-slate-700 p-6 sm:p-7 flex flex-col justify-between overflow-hidden shadow-md shadow-blue-500/10 min-h-[220px]">
          
          {/* Seamless Original Background Image (Always Visible on Phone Size & Desktop) */}
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-2/3 md:w-1/2 pointer-events-none overflow-hidden z-0">
            <img
              src={ASSETS.bannerIllustration}
              alt="Workspace Illustration"
              className="w-full h-full object-cover object-right mix-blend-multiply dark:mix-blend-normal opacity-40 sm:opacity-70 md:opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#EEF4FF] via-[#EEF4FF]/60 to-transparent dark:from-slate-900/90 dark:via-slate-900/60" />
          </div>

          {/* Left Content */}
          <div className="relative z-10 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                    {user?.role?.replace('_', ' ')}
                  </span>
                </div>

                {/* Action Check In / Check Out Button (Hidden for CEO) */}
                {user?.role !== 'CEO' && (
                  <div className="shrink-0">
                    {!todayAttendance?.clockIn ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={dashWorkLocation}
                          onChange={(e) => setDashWorkLocation(e.target.value)}
                          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer shadow-xs"
                        >
                          <option value="WFH">🏡 Remote / WFH</option>
                          <option value="IN_OFFICE">🏢 In-Office</option>
                        </select>
                        <UiverseStarButton
                          disabled={actionLoading}
                          onClick={handleQuickClockIn}
                          variant="checkin"
                        >
                          Check In
                        </UiverseStarButton>
                      </div>
                    ) : !todayAttendance?.clockOut ? (
                      <UiverseStarButton
                        disabled={actionLoading}
                        onClick={handleQuickClockOut}
                        variant="checkout"
                      >
                        Check Out
                      </UiverseStarButton>
                    ) : (
                      <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] sm:text-xs font-black rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Checked Out
                      </span>
                    )}
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                Welcome back, {getUserDisplayName()}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed max-w-md">
                Here is your enterprise leave management overview for today.
              </p>
            </div>

            {/* Date & Working Day Status Card Widget matching Image */}
            <div className="bg-white dark:bg-slate-800/95 backdrop-blur-sm border-2 border-blue-200/90 dark:border-slate-700 rounded-2xl px-3.5 py-2 shadow-md shadow-blue-500/10 inline-flex items-center gap-3 w-max">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

              <div className="min-w-0">
                <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
              </div>

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

              <div className="flex items-center gap-1.5 shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-500/20 shrink-0" />
                <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate">Working Day</span>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Actions Card Widget matching Image (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Quick Actions</h3>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Action 1: Apply Leave (Hidden for CEO role) */}
            {user?.role !== 'CEO' && (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="w-full p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                    <CalendarPlus className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                    Apply Leave
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Action 2: Add Employee (CEO Only) */}
            {user?.role === 'CEO' && (
              <button
                onClick={() => navigate('/employees?action=add')}
                className="w-full p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-purple-50/60 dark:hover:bg-purple-950/40 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                    <UserPlus className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-purple-600 transition-colors">
                    Add Employee
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Action 3: Add Holiday (Management Only) */}
            {(user?.role === 'CEO' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR' || user?.role === 'MANAGER') && (
              <button
                onClick={() => navigate('/holidays')}
                className="w-full p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-amber-50/60 dark:hover:bg-amber-950/40 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-2xs shrink-0">
                    <Plus className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-amber-600 transition-colors">
                    Add Holiday
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Action 4: Generate Report (Management Only) */}
            {(user?.role === 'CEO' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR' || user?.role === 'MANAGER') && (
              <button
                onClick={() => navigate('/reports')}
                className="w-full p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-2xs shrink-0">
                    <FileText className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">
                    Generate Report
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Action for Regular Employee: My Attendance */}
            {user?.role === 'EMPLOYEE' && (
              <button
                onClick={() => navigate('/attendance')}
                className="w-full p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-2xs shrink-0">
                    <Clock className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">
                    My Attendance Log
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ================= ROW 2: OVERVIEW 4 KPI METRIC CARDS (CEO, HR, ADMIN, MANAGER ONLY) ================= */}
      {(user?.role === 'CEO' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR' || user?.role === 'MANAGER') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Overview</h3>
            <button onClick={() => navigate('/reports')} className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline">View all</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard title="TOTAL EMPLOYEES" value={stats?.cards?.totalEmployees ?? 0} icon={Users} color="primary" trend="+8.2% This Month" bgImage={blueBgCard} />
            <MetricCard title="DEPARTMENTS" value={stats?.cards?.totalDepartments ?? 0} icon={Building2} color="secondary" trend="+2 New This Month" bgImage={purpleBgCard} />
            <MetricCard title="PENDING APPROVALS" value={stats?.cards?.pendingLeaves ?? stats?.cards?.pendingHrApprovals ?? stats?.cards?.pendingRequests ?? 0} icon={Clock} color="warning" trend="+2 Since Yesterday" bgImage={orangeBgCard} />
            <MetricCard title="EMPLOYEES ON LEAVE" value={stats?.cards?.employeesOnLeaveToday ?? stats?.cards?.teamOnLeaveTodayCount ?? 0} icon={CalendarCheck} color="success" trend="+5.4% This Month" bgImage={greenBgCard} />
          </div>
        </div>
      )}

      {/* ================= ROW 3: LEAVE ENTITLEMENTS (NON-CEO ONLY) + RECENT ACTIVITY ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Your Leave Entitlements Cards (Hidden for CEO as CEO does not apply for leave quotas) */}
        {user?.role !== 'CEO' && (
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Your Leave Entitlements</h3>
              <select
                value={selectedBalanceYear}
                onChange={(e) => handleBalanceYearChange(Number(e.target.value))}
                className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1 rounded-full border-none outline-none cursor-pointer transition-colors"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((yr) => (
                  <option key={yr} value={yr}>Year {yr}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {entitlements.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 relative overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between min-h-[155px]"
                >
                  {/* Subtle Background Accent Gradient Tint */}
                  <div
                    className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-300 pointer-events-none"
                    style={{ backgroundColor: item.color }}
                  />

                  {/* Top Header: Full Name (No truncation!) & Colored Pill Code */}
                  <div className="flex items-start justify-between gap-2 relative z-10">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight min-w-0 pr-1">
                      {item.name}
                    </span>
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-2xs transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                        border: `1px solid ${item.color}30`
                      }}
                    >
                      {item.code}
                    </span>
                  </div>

                  {/* Body: Big Number Count & Glowing Circular Gauge */}
                  <div className="flex items-center justify-between gap-2 my-2 relative z-10">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                          {item.remaining}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 leading-none">
                        Remaining
                      </p>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        of <strong className="font-bold text-slate-700 dark:text-slate-300">{item.total}</strong> days
                      </p>
                    </div>

                    {/* Circular Progress Gauge */}
                    <div className="shrink-0 drop-shadow-xs group-hover:scale-105 transition-transform">
                      <CircularProgress value={item.remaining} max={item.total} color={item.color} />
                    </div>
                  </div>

                  {/* Bottom Accent Gradient Progress Bar */}
                  <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative z-10 mt-1">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out shadow-xs"
                      style={{
                        width: `${Math.min(100, Math.max(0, (item.remaining / item.total) * 100))}%`,
                        backgroundColor: item.color,
                        boxShadow: `0 0 10px ${item.color}80`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Timeline matching Image (4 Cols for non-CEO, 12 Cols for CEO) */}
        <div className={`${user?.role === 'CEO' ? 'lg:col-span-12' : 'lg:col-span-4'} bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Recent Activity</h3>
            <button className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline">View all</button>
          </div>

          <div className="space-y-4">
            {user?.role === 'EMPLOYEE' ? (
              <>
                {/* Employee Activity 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">Your Leave Approved</p>
                    <p className="text-[11px] font-medium text-slate-400 truncate">Casual Leave Request (Approved)</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Today</span>
                </div>

                {/* Employee Activity 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">Attendance Punched</p>
                    <p className="text-[11px] font-medium text-slate-400 truncate">Check In Marked Successfully</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Today</span>
                </div>

                {/* Employee Activity 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <CalendarIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">Upcoming Holiday</p>
                    <p className="text-[11px] font-medium text-slate-400 truncate">Independence Day (Aug 15)</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">2 days ago</span>
                </div>

                {/* Employee Activity 4 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">Leave Quotas Allocated</p>
                    <p className="text-[11px] font-medium text-slate-400 truncate">Annual Quotas (Year {selectedBalanceYear})</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Jan 1</span>
                </div>
              </>
            ) : (
              <>
                {/* Management Activity 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">Leave Request Approved</p>
                    <p className="text-[11px] font-medium text-slate-400 truncate">John Doe - Casual Leave</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">10:30 AM</span>
                </div>

                {/* Management Activity 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">New Employee Added</p>
                    <p className="text-[11px] font-medium text-slate-400 truncate">Sarah Wilson - Developer</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Yesterday</span>
                </div>

                {/* Management Activity 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <CalendarIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">Holiday Added</p>
                    <p className="text-[11px] font-medium text-slate-400 truncate">Independence Day</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">2 days ago</span>
                </div>

                {/* Management Activity 4 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">Report Generated</p>
                    <p className="text-[11px] font-medium text-slate-400 truncate">Monthly Leave Report</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">3 days ago</span>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* ================= ROW 4: MONTHLY TREND + LEAVE DISTRIBUTION (CEO, HR, ADMIN, MANAGER ONLY) + UPCOMING HOLIDAYS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: 2 Analytics Charts Grid (CEO, SUPER_ADMIN, HR, MANAGER ONLY) */}
        {(user?.role === 'CEO' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR' || user?.role === 'MANAGER') && (
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Monthly Leave Trend Area Chart matching Image (7 Cols) */}
            <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Monthly Leave Trend</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">This Year ▾</span>
              </div>

              <div className="w-full h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLeaves" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#1E293B',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                    <Area type="monotone" dataKey="leaves" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorLeaves)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leave Distribution Donut Chart matching Image (5 Cols) */}
            <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Leave Distribution</h3>
                {(user?.role === 'CEO' || user?.role === 'SUPER_ADMIN') && (
                  <button
                    onClick={handleOpenEditDistribution}
                    className="px-2.5 py-1 text-[11px] font-bold bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white dark:text-blue-400 dark:hover:text-white rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                    title="Edit Leave Distribution (CEO & Admin Only)"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
              </div>

              <div className="relative w-full h-36 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={42} outerRadius={60} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{totalDaysAllTypes}</span>
                  <span className="text-[9px] font-bold text-slate-400">Leaves</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white shrink-0">{item.maxDays} Days</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Upcoming Holidays Widget matching Image */}
        <div className={`${(user?.role === 'CEO' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR' || user?.role === 'MANAGER') ? 'lg:col-span-4' : 'lg:col-span-12'} bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Upcoming Holidays</h3>
              <button onClick={() => navigate('/holidays')} className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline">
                View calendar
              </button>
            </div>

            <div className="space-y-3">
              {/* Holiday 1 */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl shadow-2xs">
                    <p className="text-xs font-black text-slate-900 dark:text-white leading-none">15</p>
                    <p className="text-[9px] font-bold text-blue-600 uppercase">AUG</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">Independence Day</p>
                    <p className="text-[10px] text-slate-400 font-medium">Friday</p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Upcoming
                </span>
              </div>

              {/* Holiday 2 */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl shadow-2xs">
                    <p className="text-xs font-black text-slate-900 dark:text-white leading-none">05</p>
                    <p className="text-[9px] font-bold text-blue-600 uppercase">SEP</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">Teachers' Day</p>
                    <p className="text-[10px] text-slate-400 font-medium">Friday</p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Upcoming
                </span>
              </div>

              {/* Holiday 3 */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl shadow-2xs">
                    <p className="text-xs font-black text-slate-900 dark:text-white leading-none">02</p>
                    <p className="text-[9px] font-bold text-blue-600 uppercase">OCT</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">Gandhi Jayanti</p>
                    <p className="text-[10px] text-slate-400 font-medium">Thursday</p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Upcoming
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/holidays')}
            className="w-full mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-between"
          >
            <span>View all holidays</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Leave Application Modal */}
      <LeaveApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={fetchDashboard}
        leaveTypes={leaveTypes}
        balance={balance}
      />

      {/* Face Verification Modal for Dashboard Quick Check-In / Check-Out */}
      <FaceCameraModal
        isOpen={isFaceModalOpen}
        onClose={() => {
          setIsFaceModalOpen(false);
          setPendingClockAction(null);
        }}
        mode="verify"
        employeeName={user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''}
        onCaptureSuccess={handleFaceVerificationSuccess}
        isSubmitting={actionLoading}
      />
      {/* Leave Distribution Edit Modal (CEO & SUPER_ADMIN Only) */}
      <Modal
        isOpen={isEditDistributionModalOpen}
        onClose={() => setIsEditDistributionModalOpen(false)}
        title="Edit Leave Distribution Quotas"
      >
        <form onSubmit={handleSaveDistribution} className="space-y-4">
          <p className="text-xs text-slate-500 font-medium">
            Update maximum yearly leave day allocations per policy. Only CEO and Super Admin can modify these quotas.
          </p>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {editDistributionData.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: item.colorBadge }}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h4>
                    <span className="text-[10px] font-mono font-bold text-slate-400">({item.code})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={item.maxDays}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditDistributionData((prev) =>
                        prev.map((it, i) => (i === idx ? { ...it, maxDays: val } : it))
                      );
                    }}
                    className="w-20 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 text-center"
                    required
                  />
                  <span className="text-xs font-semibold text-slate-500">Days/Yr</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditDistributionModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingDistribution}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {savingDistribution ? 'Saving Changes...' : 'Save Distribution'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
