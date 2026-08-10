import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { UiverseStarButton } from '../components/UiverseStarButton';
import { Modal } from '../components/Modal';
import { FaceCameraModal } from '../components/FaceCameraModal';
import blueBgCard from '../assets/ChatGPT Image Aug 4, 2026, 04_51_49 PM.png';
import greenBgCard from '../assets/ChatGPT Image Aug 4, 2026, 04_51_43 PM.png';
import purpleBgCard from '../assets/ChatGPT Image Aug 4, 2026, 04_51_54 PM.png';
import orangeBgCard from '../assets/ChatGPT Image Aug 4, 2026, 04_51_34 PM.png';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Home,
  Briefcase,
  Play,
  Square,
  TrendingUp,
  Filter,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  MoreVertical,
  CalendarCheck,
  UserCheck,
  Search,
  LogIn,
  LogOut,
  X
} from 'lucide-react';

const CARD_THEMES = [
  {
    cardBg: "from-[#eef4ff] via-[#f0f7ff] to-[#f8fafc] dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-blue-200/80 hover:border-blue-400",
    avatarBg: "!bg-gradient-to-tr !from-blue-600 !via-indigo-500 !to-cyan-400",
    pillBg: "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300",
    nameHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    btnBg: "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 shadow-blue-500/20 group-hover:shadow-blue-500/35"
  },
  {
    cardBg: "from-[#f0fdf4] via-[#ecfdf5] to-[#f8fafc] dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-emerald-200/80 hover:border-emerald-400",
    avatarBg: "!bg-gradient-to-tr !from-emerald-600 !via-teal-500 !to-green-400",
    pillBg: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
    nameHover: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
    btnBg: "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 shadow-emerald-500/20 group-hover:shadow-emerald-500/35"
  },
  {
    cardBg: "from-[#faf5ff] via-[#f5f3ff] to-[#f8fafc] dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-purple-200/80 hover:border-purple-400",
    avatarBg: "!bg-gradient-to-tr !from-purple-600 !via-violet-500 !to-indigo-400",
    pillBg: "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300",
    nameHover: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
    btnBg: "bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 shadow-purple-500/20 group-hover:shadow-purple-500/35"
  },
  {
    cardBg: "from-[#fff1f2] via-[#fff5f5] to-[#f8fafc] dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-rose-200/80 hover:border-rose-400",
    avatarBg: "!bg-gradient-to-tr !from-rose-600 !via-pink-500 !to-red-400",
    pillBg: "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300",
    nameHover: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
    btnBg: "bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 shadow-rose-500/20 group-hover:shadow-rose-500/35"
  },
  {
    cardBg: "from-[#fffbe6] via-[#fff7ed] to-[#f8fafc] dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-amber-200/80 hover:border-amber-400",
    avatarBg: "!bg-gradient-to-tr !from-amber-600 !via-orange-500 !to-yellow-400",
    pillBg: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300",
    nameHover: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
    btnBg: "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 shadow-amber-500/20 group-hover:shadow-amber-500/35"
  },
  {
    cardBg: "from-[#ecfeff] via-[#f0fdfa] to-[#f8fafc] dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-cyan-200/80 hover:border-cyan-400",
    avatarBg: "!bg-gradient-to-tr !from-cyan-600 !via-teal-500 !to-sky-400",
    pillBg: "bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300",
    nameHover: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
    btnBg: "bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 shadow-cyan-500/20 group-hover:shadow-cyan-500/35"
  }
];

export const Attendance = () => {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [logs, setLogs] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [workLocation, setWorkLocation] = useState('WFH');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Face Verification Camera Modal State
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [pendingClockAction, setPendingClockAction] = useState(null); // 'clockIn' | 'clockOut'

  // Modal State for Image 2 Design
  const [historyModalEmp, setHistoryModalEmp] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalStatusFilter, setModalStatusFilter] = useState('');
  const [modalDatePreset, setModalDatePreset] = useState('all');
  const [showCustomDateInputs, setShowCustomDateInputs] = useState(false);
  const [showModalSearchInput, setShowModalSearchInput] = useState(false);
  const [modalStartDate, setModalStartDate] = useState('');
  const [modalEndDate, setModalEndDate] = useState('');
  const [modalPage, setModalPage] = useState(1);
  const [selectedDetailLog, setSelectedDetailLog] = useState(null);

  const itemsPerPage = 7;
  const modalTopRef = useRef(null);

  const handleModalPageChange = (newPage) => {
    setModalPage(newPage);
    if (modalTopRef.current) {
      modalTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getVisiblePages = (current, total) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, 5];
    if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
    return [current - 2, current - 1, current, current + 1, current + 2];
  };

  const getEmpDisplayName = (u) => {
    if (!u || typeof u !== 'object') return 'Employee Member';
    if (u.role === 'CEO') return 'CEO Executive';

    const first = (u.firstName || '').trim();
    const last = (u.lastName || '').trim();
    let name = `${first} ${last}`.trim();

    if (first && first !== 'User' && first !== 'Employee') {
      return name;
    }

    if (u.email) {
      const emailName = u.email.split('@')[0];
      const parts = emailName.split(/[\._-]/);
      const formatted = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      if (formatted && formatted.toLowerCase() !== 'user' && formatted.toLowerCase() !== 'employee') {
        return formatted;
      }
    }

    if (u.role === 'MANAGER') return 'Team Lead (TL)';
    if (u.role === 'HR') return 'HR Manager';
    if (u.role === 'SUPER_ADMIN') return 'System Admin';

    return 'Employee Member';
  };

  const getEmpId = (u) => {
    if (u && typeof u === 'object' && u.employeeId) return u.employeeId;
    return 'EMP-1001';
  };

  const getEmpDept = (u) => {
    if (u && typeof u === 'object') {
      if (u.department?.name) return u.department.name;
      if (typeof u.department === 'string' && u.department) return u.department;
      if (u.role === 'SUPER_ADMIN') return 'Executive Board';
      if (u.role === 'HR') return 'Human Resources';
      if (u.role === 'MANAGER') return 'Operations & Tech';
    }
    return 'Engineering Department';
  };

  const formatWorkDuration = (log) => {
    if (!log || !log.clockIn) return '--';
    if (!log.clockOut) return 'In Progress ⏱️';

    const start = new Date(log.clockIn);
    const end = new Date(log.clockOut);
    const totalMins = Math.max(0, Math.round((end - start) / (1000 * 60)));

    if (totalMins < 1) return '00h 00m';
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
  };

  const formatClockTime = (timeStr) => {
    if (!timeStr) return '--';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Group attendance logs by Employee & include directory employees according to role permissions
  const groupedEmployeeMap = {};

  const currentUserId = user?._id || user?.id;
  const userRole = user?.role;

  // Role based employee filtering:
  // - EMPLOYEE: Only show self
  // - MANAGER: Only show self and direct reports
  // - HR / SUPER_ADMIN / ADMIN / CEO: Show all non-CEO employees
  let roleFilteredEmployees = allEmployees;

  if (userRole === 'EMPLOYEE') {
    roleFilteredEmployees = allEmployees.filter(
      (emp) => emp._id === currentUserId || emp.id === currentUserId
    );
    if (roleFilteredEmployees.length === 0 && user) {
      roleFilteredEmployees = [user];
    }
  } else if (userRole === 'MANAGER') {
    roleFilteredEmployees = allEmployees.filter((emp) => {
      const isSelf = emp._id === currentUserId || emp.id === currentUserId;
      const rMgr = emp.reportingManager?._id || emp.reportingManager;
      const isDirectReport = rMgr === currentUserId;
      return isSelf || isDirectReport;
    });
    if (roleFilteredEmployees.length === 0 && user) {
      roleFilteredEmployees = [user];
    }
  }

  // 1. Pre-fill allowed directory employees (excluding CEO)
  roleFilteredEmployees.forEach((emp) => {
    if (emp && emp.role !== 'CEO') {
      const empId = emp._id || emp.id;
      groupedEmployeeMap[empId] = {
        empId,
        user: emp,
        logs: [],
        totalDays: 0,
        presentCount: 0,
        wfhCount: 0,
        lateCount: 0,
        halfDayCount: 0,
        absentCount: 0
      };
    }
  });

  // 2. Attach actual attendance logs to employee cards
  logs.forEach((log) => {
    const empId = log.user?._id || log.user || 'unknown';
    if (!groupedEmployeeMap[empId]) {
      const logUserId = typeof log.user === 'object' ? log.user?._id : log.user;
      const isSelf = logUserId === currentUserId;

      let isAllowed = true;
      if (userRole === 'EMPLOYEE') {
        isAllowed = isSelf;
      }

      if (isAllowed && log.user && log.user.role !== 'CEO') {
        groupedEmployeeMap[empId] = {
          empId,
          user: log.user,
          logs: [],
          totalDays: 0,
          presentCount: 0,
          wfhCount: 0,
          lateCount: 0,
          halfDayCount: 0,
          absentCount: 0
        };
      }
    }

    if (groupedEmployeeMap[empId]) {
      groupedEmployeeMap[empId].logs.push(log);
      groupedEmployeeMap[empId].totalDays += 1;
      if (log.workLocation === 'WFH') groupedEmployeeMap[empId].wfhCount += 1;
      if (log.status === 'LATE') groupedEmployeeMap[empId].lateCount += 1;
      else if (log.status === 'HALF_DAY') groupedEmployeeMap[empId].halfDayCount += 1;
      else if (log.status === 'ABSENT') groupedEmployeeMap[empId].absentCount += 1;
      else groupedEmployeeMap[empId].presentCount += 1;
    }
  });

  const employeeGroupList = Object.values(groupedEmployeeMap);

  const filteredEmployeeGroupList = employeeGroupList.filter((empGroup) => {
    if (empGroup.user?.role === 'CEO' || getEmpDisplayName(empGroup.user) === 'CEO Executive') {
      return false;
    }

    if (searchQuery.trim()) {
      const name = getEmpDisplayName(empGroup.user).toLowerCase();
      const empId = getEmpId(empGroup.user).toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      if (!name.includes(query) && !empId.includes(query)) return false;
    }

    if (statusFilter) {
      if (statusFilter === 'PRESENT') return empGroup.presentCount > 0 || empGroup.logs.some((l) => l.status === 'PRESENT');
      if (statusFilter === 'LATE') return empGroup.lateCount > 0 || empGroup.logs.some((l) => l.status === 'LATE');
      if (statusFilter === 'HALF_DAY') return empGroup.halfDayCount > 0 || empGroup.logs.some((l) => l.status === 'HALF_DAY');
      if (statusFilter === 'WFH') return empGroup.wfhCount > 0 || empGroup.logs.some((l) => l.workLocation === 'WFH');
      if (statusFilter === 'ABSENT') return empGroup.absentCount > 0 || empGroup.logs.some((l) => l.status === 'ABSENT');
      if (statusFilter === 'OVER_DUTY') return empGroup.logs.some((l) => ['OVER_DUTY', 'OD'].includes(l.status));
    }

    return true;
  });

  const getLocalDateString = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Helper to generate history records (all days of current month + past 90 days)
  const getEmployeeFullHistory = (empGroup) => {
    if (!empGroup) return [];

    const existingMap = {};
    (empGroup.logs || []).forEach((log) => {
      if (log.date) {
        const dStr = getLocalDateString(log.date);
        existingMap[dStr] = log;
      }
    });

    const fullHistory = [];
    const today = new Date();
    const todayStr = getLocalDateString(today);

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const lastDayOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);

    // Timeline from last day of current month down to 90 days ago
    const currDate = new Date(lastDayOfCurrentMonth);
    const minPastDate = new Date(today);
    minPastDate.setDate(today.getDate() - 90);

    while (currDate >= minPastDate) {
      const dStr = getLocalDateString(currDate);

      if (existingMap[dStr]) {
        fullHistory.push(existingMap[dStr]);
      } else {
        const isPastDay = dStr < todayStr;
        const isToday = dStr === todayStr;
        const isSunday = currDate.getDay() === 0;

        if (isSunday) {
          fullHistory.push({
            _id: `weekoff-${empGroup.empId}-${dStr}`,
            date: new Date(currDate).toISOString(),
            user: empGroup.user,
            clockIn: null,
            clockOut: null,
            workLocation: 'IN_OFFICE',
            status: 'WEEK_OFF',
            isSyntheticAbsent: true
          });
        } else if (isPastDay || isToday) {
          fullHistory.push({
            _id: `absent-${empGroup.empId}-${dStr}`,
            date: new Date(currDate).toISOString(),
            user: empGroup.user,
            clockIn: null,
            clockOut: null,
            workLocation: 'IN_OFFICE',
            status: 'ABSENT',
            isSyntheticAbsent: true
          });
        } else if (currDate.getMonth() === currentMonth) {
          // Future days of the current month
          fullHistory.push({
            _id: `future-${empGroup.empId}-${dStr}`,
            date: new Date(currDate).toISOString(),
            user: empGroup.user,
            clockIn: null,
            clockOut: null,
            workLocation: 'IN_OFFICE',
            status: 'UPCOMING',
            isSyntheticAbsent: true
          });
        }
      }
      currDate.setDate(currDate.getDate() - 1);
    }
    return fullHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const handleOpenHistoryModal = (empGroup) => {
    setHistoryModalEmp(empGroup);
    setModalSearch('');
    setModalStatusFilter('');
    setModalDatePreset('this_month');
    setShowCustomDateInputs(false);
    setModalStartDate('');
    setModalEndDate('');
    setModalPage(1);
    setIsHistoryModalOpen(true);
  };

  const getComputedDateRange = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    if (modalDatePreset === 'this_month') {
      const start = getLocalDateString(new Date(year, month, 1, 12, 0, 0));
      const end = getLocalDateString(new Date(year, month + 1, 0, 12, 0, 0));
      return { start, end };
    }

    if (modalDatePreset === 'last_month') {
      const prevYear = month === 0 ? year - 1 : year;
      const prevMonth = month === 0 ? 11 : month - 1;
      const start = getLocalDateString(new Date(prevYear, prevMonth, 1, 12, 0, 0));
      const end = getLocalDateString(new Date(prevYear, prevMonth + 1, 0, 12, 0, 0));
      return { start, end };
    }

    if (modalDatePreset === 'last_30_days') {
      const d = new Date(year, month, today.getDate() - 30, 12, 0, 0);
      return {
        start: getLocalDateString(d),
        end: getLocalDateString(today)
      };
    }

    if (modalDatePreset === 'all') {
      return { start: '', end: '' };
    }

    return { start: modalStartDate, end: modalEndDate };
  };

  const currentEmpFullHistory = getEmployeeFullHistory(historyModalEmp);

  const modalFilteredLogs = currentEmpFullHistory.filter((log) => {
    const logDate = new Date(log.date);
    const logDateStr = getLocalDateString(log.date);
    const computedRange = getComputedDateRange();

    if (computedRange.start && logDateStr < computedRange.start) return false;
    if (computedRange.end && logDateStr > computedRange.end) return false;

    if (modalStatusFilter) {
      if (log.status !== modalStatusFilter) return false;
    }

    if (modalSearch.trim()) {
      const q = modalSearch.toLowerCase().trim();
      const dateFormatted = logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toLowerCase();
      const dayFormatted = logDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
      const statusStr = (log.status || '').toLowerCase();
      if (!dateFormatted.includes(q) && !dayFormatted.includes(q) && !statusStr.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const totalModalPages = Math.ceil(modalFilteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = modalFilteredLogs.slice((modalPage - 1) * itemsPerPage, modalPage * itemsPerPage);

  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/attendance/today');
      setTodayAttendance(res.data.data.attendance);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLocationChange = async (logId, newLocation) => {
    try {
      await api.patch(`/attendance/${logId}`, { workLocation: newLocation });
      fetchAttendanceLogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update work location');
    }
  };

  const fetchAttendanceLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const [logsRes, empRes] = await Promise.all([
        api.get('/attendance/logs', { params }),
        api.get('/employees')
      ]);

      setLogs(logsRes.data.data.logs || []);
      setSummary(logsRes.data.data.summary);
      setAllEmployees(empRes.data.data.employees || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
    fetchAttendanceLogs();
  }, [statusFilter]);

  const handleInitiateClockIn = () => {
    setPendingClockAction('clockIn');
    setIsFaceModalOpen(true);
  };

  const handleInitiateClockOut = () => {
    setPendingClockAction('clockOut');
    setIsFaceModalOpen(true);
  };

  const handleFaceVerificationSuccess = async (faceDescriptor) => {
    setActionLoading(true);
    try {
      if (pendingClockAction === 'clockIn') {
        await api.post('/attendance/clock-in', { workLocation, faceDescriptor });
      } else if (pendingClockAction === 'clockOut') {
        await api.post('/attendance/clock-out', { faceDescriptor });
      }
      setIsFaceModalOpen(false);
      setPendingClockAction(null);
      await fetchTodayStatus();
      await fetchAttendanceLogs();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${pendingClockAction === 'clockIn' ? 'check in' : 'check out'}.`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Compact Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 p-3.5 sm:p-4 shadow-2xs">
        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Attendance & Daily Punch
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time attendance tracking and employee workforce logs
          </p>
        </div>
      </div>

      {/* Daily Punch Widget Banner (Only for regular employees & managers, hidden for CEO) */}
      {user?.role !== 'CEO' && (
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-blue-600/10 via-sky-500/5 to-transparent flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary text-white shadow-md shadow-primary/20 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400">TODAY</span>
                <span className="text-[10px] font-black text-primary uppercase">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                {todayAttendance?.clockIn
                  ? `Checked In at ${new Date(todayAttendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Not Checked In Yet'}
              </h3>

              {todayAttendance?.clockOut && (
                <p className="text-[11px] font-semibold text-emerald-500">
                  Checked Out at {new Date(todayAttendance.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({formatWorkDuration(todayAttendance)} worked)
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {!todayAttendance?.clockIn ? (
              <>
                <select
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                >
                  <option value="WFH">🏡 Remote / WFH</option>
                  <option value="IN_OFFICE">🏢 In-Office</option>
                </select>

                <UiverseStarButton
                  disabled={actionLoading}
                  onClick={handleInitiateClockIn}
                  variant="emerald"
                  icon={Play}
                >
                  Check In
                </UiverseStarButton>
              </>
            ) : !todayAttendance?.clockOut ? (
              <UiverseStarButton
                disabled={actionLoading}
                onClick={handleInitiateClockOut}
                variant="checkout"
                icon={Square}
              >
                Check Out
              </UiverseStarButton>
            ) : (
              <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Attendance Completed
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Logged Days */}
        <div
          className="relative overflow-hidden p-6 sm:p-7 min-h-[135px] sm:min-h-[145px] rounded-3xl border border-blue-200/80 dark:border-blue-800/40 shadow-xs hover:shadow-md transition-all bg-[length:100%_100%] bg-center bg-no-repeat bg-white dark:bg-slate-900 flex flex-col justify-center"
          style={{ backgroundImage: `url(${blueBgCard})` }}
        >
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Logged Days
              </p>
              <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {summary?.totalDays || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Present Days */}
        <div
          className="relative overflow-hidden p-6 sm:p-7 min-h-[135px] sm:min-h-[145px] rounded-3xl border border-emerald-200/80 dark:border-emerald-800/40 shadow-xs hover:shadow-md transition-all bg-[length:100%_100%] bg-center bg-no-repeat bg-white dark:bg-slate-900 flex flex-col justify-center"
          style={{ backgroundImage: `url(${greenBgCard})` }}
        >
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Present Days
              </p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {summary?.presentCount || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: WFH Days */}
        <div
          className="relative overflow-hidden p-6 sm:p-7 min-h-[135px] sm:min-h-[145px] rounded-3xl border border-purple-200/80 dark:border-purple-800/40 shadow-xs hover:shadow-md transition-all bg-[length:100%_100%] bg-center bg-no-repeat bg-white dark:bg-slate-900 flex flex-col justify-center"
          style={{ backgroundImage: `url(${purpleBgCard})` }}
        >
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 shrink-0 shadow-2xs">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                WFH Days
              </p>
              <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {summary?.wfhCount || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Late Check-ins */}
        <div
          className="relative overflow-hidden p-6 sm:p-7 min-h-[135px] sm:min-h-[145px] rounded-3xl border border-amber-200/80 dark:border-amber-800/40 shadow-xs hover:shadow-md transition-all bg-[length:100%_100%] bg-center bg-no-repeat bg-white dark:bg-slate-900 flex flex-col justify-center"
          style={{ backgroundImage: `url(${orangeBgCard})` }}
        >
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Late Check-ins
              </p>
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {summary?.lateCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="relative w-full max-w-[260px] sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee name or ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-primary cursor-pointer w-full sm:w-auto max-w-[220px]"
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">Present Only</option>
              <option value="LATE">Late Only</option>
              <option value="HALF_DAY">Half Day Only</option>
              <option value="WFH">WFH / Remote</option>
              <option value="ABSENT">Absent Only</option>
              <option value="OVER_DUTY">⚡ Over Duty (OD)</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-extrabold text-slate-400 shrink-0 self-start sm:self-auto pt-0.5 sm:pt-0">
          Showing {filteredEmployeeGroupList.length} Employee Card{filteredEmployeeGroupList.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Grouped Employee Attendance Cards (Every Directory Employee Has A Card) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full glass-card p-8 text-center text-slate-400 font-medium rounded-2xl">Loading attendance logs...</div>
        ) : filteredEmployeeGroupList.length > 0 ? (
          filteredEmployeeGroupList.map((empGroup, index) => {
            const theme = CARD_THEMES[index % CARD_THEMES.length];
            return (
              <div
                key={empGroup.empId}
                onClick={() => handleOpenHistoryModal(empGroup)}
                className={`relative overflow-hidden rounded-[26px] border bg-gradient-to-b ${theme.cardBg} p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-sm hover:shadow-xl transition-all cursor-pointer group`}
              >
                {/* Top Section: Avatar, Info & Options icon */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      user={empGroup.user}
                      size="w-12 h-12 text-sm"
                      className={`${theme.avatarBg} shadow-md ring-2 ring-white/80 shrink-0`}
                    />
                    <div className="min-w-0">
                      <h3 className={`font-extrabold text-slate-900 dark:text-white text-base truncate capitalize tracking-tight ${theme.nameHover} transition-colors`}>
                        {getEmpDisplayName(empGroup.user)}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
                        {getEmpId(empGroup.user)} • {getEmpDept(empGroup.user)}
                      </p>
                    </div>
                  </div>
                  <button type="button" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors shrink-0">
                    <MoreVertical className="w-4.5 h-4.5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Pill Tag: This Month */}
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-extrabold ${theme.pillBg}`}>
                    This Month
                  </span>
                </div>

                {/* 3 Stat Mini Cards Grid (Present, Late, On Leave/Absent) */}
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Present Stat */}
                  <div className="bg-[#ecfdf5] dark:bg-emerald-950/30 p-2.5 sm:p-3 rounded-xl flex flex-col justify-between space-y-2">
                    <CalendarCheck className="w-5 h-5 text-[#059669] dark:text-emerald-400 stroke-[2.2]" />
                    <div>
                      <span className="text-xl sm:text-2xl font-black text-[#059669] dark:text-emerald-400 block leading-none">
                        {empGroup.presentCount}
                      </span>
                      <span className="text-[11px] font-bold text-[#059669] dark:text-emerald-400/90 block mt-1">
                        Present
                      </span>
                    </div>
                  </div>

                  {/* Late Stat */}
                  <div className="bg-[#fff7ed] dark:bg-amber-950/30 p-2.5 sm:p-3 rounded-xl flex flex-col justify-between space-y-2">
                    <Clock className="w-5 h-5 text-[#ea580c] dark:text-amber-400 stroke-[2.2]" />
                    <div>
                      <span className="text-xl sm:text-2xl font-black text-[#ea580c] dark:text-amber-400 block leading-none">
                        {empGroup.lateCount}
                      </span>
                      <span className="text-[11px] font-bold text-[#ea580c] dark:text-amber-400/90 block mt-1">
                        Late
                      </span>
                    </div>
                  </div>

                  {/* On Leave / Absent Stat */}
                  <div className="bg-[#eff6ff] dark:bg-blue-950/30 p-2.5 sm:p-3 rounded-xl flex flex-col justify-between space-y-2">
                    <UserCheck className="w-5 h-5 text-[#2563eb] dark:text-blue-400 stroke-[2.2]" />
                    <div>
                      <span className="text-xl sm:text-2xl font-black text-[#2563eb] dark:text-blue-400 block leading-none">
                        {empGroup.wfhCount || 0}
                      </span>
                      <span className="text-[11px] font-bold text-[#2563eb] dark:text-blue-400/90 block mt-1">
                        On Leave
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Full-width View Details Gradient Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenHistoryModal(empGroup);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl ${theme.btnBg} hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all group-hover:shadow-lg`}
                >
                  <Eye className="w-4.5 h-4.5 stroke-[2.2]" />
                  <span>View Details</span>
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full glass-card p-12 text-center text-slate-400 font-medium rounded-2xl">
            No attendance records found.
          </div>
        )}
      </div>

      {/* Full Attendance History Popup Modal (Matching Image 1 Phone Design) */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title=""
        maxWidth="max-w-4xl"
        hideCloseButton={true}
      >
        {historyModalEmp && (
          <div className="space-y-3.5 sm:space-y-4">
            {/* Sticky Top Header & Filter Controls Container */}
            <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 -mt-3 sm:-mt-4 pt-3 sm:pt-4 pb-3 space-y-3 border-b border-slate-100 dark:border-slate-800 -mx-3.5 sm:-mx-6 px-3.5 sm:px-6 shadow-2xs">
              {/* Navigation & Header Title Bar */}
              <div ref={modalTopRef} className="flex items-center justify-between min-h-[48px]">
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                  title="Back"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>

                <div className="flex flex-col items-center justify-center text-center flex-1 mx-2 min-w-0">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight text-center">
                    Attendance History
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap leading-tight mt-0.5 text-center">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{getEmpDisplayName(historyModalEmp.user)}</span>
                    <span className="inline-flex items-center gap-1 sm:gap-1.5">
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="font-mono text-slate-400">{getEmpId(historyModalEmp.user)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 sm:gap-1.5">
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span>{getEmpDept(historyModalEmp.user)}</span>
                    </span>
                  </p>
                </div>

                {/* Both Search & X Close buttons in the same flex row for 100% perfect vertical alignment */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowModalSearchInput(!showModalSearchInput)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all shrink-0 shadow-2xs hover:scale-105 ${
                      showModalSearchInput || modalSearch
                        ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-400 ring-2 ring-blue-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                    title="Search History"
                  >
                    <Search className="w-4 h-4 stroke-[2.2]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsHistoryModalOpen(false)}
                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all shrink-0 hover:scale-105 shadow-2xs"
                    title="Close Modal"
                  >
                    <X className="w-4.5 h-4.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Toggleable Search Bar Input */}
              {showModalSearchInput && (
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by date, day, status..."
                    value={modalSearch}
                    onChange={(e) => {
                      setModalSearch(e.target.value);
                      setModalPage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {modalSearch && (
                    <button
                      type="button"
                      onClick={() => setModalSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Top Filter Controls Bar */}
              <div className="flex items-center justify-between gap-2 flex-nowrap">
                {/* Date Range Selector Dropdown */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-2xs flex-1 min-w-0 max-w-xs">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <select
                    value={modalDatePreset}
                    onChange={(e) => {
                      const val = e.target.value;
                      setModalDatePreset(val);
                      setModalPage(1);
                      if (val === 'custom') {
                        setShowCustomDateInputs(true);
                      } else {
                        setShowCustomDateInputs(false);
                      }
                    }}
                    className="bg-transparent text-[11px] sm:text-xs font-extrabold text-slate-800 dark:text-slate-200 outline-none cursor-pointer w-full pr-1 truncate"
                  >
                    <option value="this_month">This Month</option>
                    <option value="all">All History (Last 90 Days)</option>
                    <option value="last_30_days">Last 30 Days</option>
                    <option value="last_month">Last Month</option>
                    <option value="custom">Custom Date Range...</option>
                  </select>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-2xs shrink-0">
                  <select
                    value={modalStatusFilter}
                    onChange={(e) => {
                      setModalStatusFilter(e.target.value);
                      setModalPage(1);
                    }}
                    className="bg-transparent text-[11px] sm:text-xs font-extrabold text-slate-800 dark:text-slate-200 outline-none cursor-pointer pr-1"
                  >
                    <option value="">All Status</option>
                    <option value="PRESENT">Present</option>
                    <option value="LATE">Late</option>
                    <option value="ABSENT">Absent</option>
                    <option value="WEEK_OFF">Week Off</option>
                    <option value="HALF_DAY">Half Day</option>
                  </select>
                </div>
              </div>

              {showCustomDateInputs && (
                <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 sm:px-3 sm:py-1.5 rounded-xl shadow-2xs text-xs font-bold text-slate-700 dark:text-slate-200 w-full max-w-full">
                  <div className="flex items-center gap-1.5 flex-1 min-w-[130px]">
                    <span className="text-[11px] sm:text-xs shrink-0 text-slate-500">From:</span>
                    <input
                      type="date"
                      value={modalStartDate}
                      onChange={(e) => {
                        setModalStartDate(e.target.value);
                        setModalPage(1);
                      }}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none text-[11px] sm:text-xs w-full min-w-0"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 min-w-[130px]">
                    <span className="text-[11px] sm:text-xs shrink-0 text-slate-500">To:</span>
                    <input
                      type="date"
                      value={modalEndDate}
                      onChange={(e) => {
                        setModalEndDate(e.target.value);
                        setModalPage(1);
                      }}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none text-[11px] sm:text-xs w-full min-w-0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Container with outer soft background card container (Matching Image 1) */}
            <div className="overflow-x-auto pb-1.5 [&::-webkit-scrollbar]:hidden">
              <div className="w-full sm:min-w-[450px] bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl sm:rounded-3xl p-1.5 sm:p-3.5 border border-slate-200/60 dark:border-slate-800 shadow-2xs space-y-2">
                {/* Header Column Labels Bar */}
                <div className="grid grid-cols-[1.1fr_1fr_1fr_0.9fr] sm:grid-cols-[1.6fr_1fr_0.8fr_1fr_1fr] gap-1 sm:gap-2 px-2 sm:px-3.5 py-1 text-[10px] sm:text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <div className="text-left">
                    DATE<br />
                    <span className="text-[9px] text-slate-400 font-bold">DAY</span>
                  </div>
                  <div className="text-left">
                    CHECK-IN<br />
                    <span className="text-[9px] text-slate-400 font-bold">CHECK-OUT</span>
                  </div>
                  <div className="text-center hidden sm:block">DURATION</div>
                  <div className="text-center">STATUS</div>
                  <div className="text-center">ACTION</div>
                </div>

                {/* Attendance Logs Cards Stack (Each Row as a distinct Card Box) */}
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log) => {
                    const dateObj = new Date(log.date);
                    const isPresent = log.status === 'PRESENT';
                    const isLate = log.status === 'LATE';
                    const isAbsent = log.status === 'ABSENT';

                    return (
                      <div
                        key={log._id}
                        className="bg-white dark:bg-slate-800/90 rounded-2xl px-2 py-2.5 sm:p-3.5 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs hover:shadow-md transition-all grid grid-cols-[1.1fr_1fr_1fr_0.9fr] sm:grid-cols-[1.6fr_1fr_0.8fr_1fr_1fr] gap-1 sm:gap-2 items-center"
                      >
                        {/* DATE / DAY Column */}
                        <div className="flex items-center gap-2.5">
                          <div className="hidden sm:block p-2 rounded-xl shrink-0 bg-amber-100/80 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                            <Calendar className="w-4 h-4 stroke-[2.2]" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-tight whitespace-nowrap">
                              <span className="hidden sm:inline">
                                {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="sm:hidden">
                                {`${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear().toString().slice(-2)}`}
                              </span>
                            </span>
                            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 dark:text-slate-400 leading-tight mt-0.5 whitespace-nowrap">
                              {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                          </div>
                        </div>

                        {/* CHECK-IN / CHECK-OUT Column */}
                        <div className="flex flex-col font-extrabold text-left">
                          <span className={`text-xs sm:text-sm ${isPresent ? 'text-emerald-600 dark:text-emerald-400' : isLate ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 font-normal'}`}>
                            {isPresent || isLate ? formatClockTime(log.clockIn) : '--'}
                          </span>
                          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                            {log.clockOut ? formatClockTime(log.clockOut) : '--'}
                          </span>
                        </div>

                        {/* DURATION Column */}
                        <div className="font-extrabold text-slate-700 dark:text-slate-300 text-xs sm:text-sm whitespace-nowrap text-center hidden sm:block">
                          {log.clockIn && log.clockOut ? formatWorkDuration(log) : <span className="text-slate-400 font-normal">--</span>}
                        </div>

                        {/* STATUS Column */}
                        <div className="text-center whitespace-nowrap">
                          {['OVER_DUTY', 'OD'].includes(log.status) ? (
                            <span className="px-1.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 font-extrabold text-[9.5px] sm:text-xs inline-block shadow-2xs border border-purple-200/80">
                              ⚡ Over Duty
                            </span>
                          ) : log.status === 'WEEK_OFF' ? (
                            <span className="px-1.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-purple-50 text-[#7c3aed] dark:bg-purple-950/60 dark:text-purple-300 font-extrabold text-[9.5px] sm:text-xs inline-block shadow-2xs border border-purple-100 dark:border-purple-900/40">
                              Week Off
                            </span>
                          ) : isPresent ? (
                            <span className="px-1.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-[#dcfce7] text-[#166534] dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold text-[9.5px] sm:text-xs inline-block shadow-2xs">
                              Present
                            </span>
                          ) : isLate ? (
                            <span className="px-1.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-[#ffedd5] text-[#9a3412] dark:bg-amber-950/60 dark:text-amber-300 font-extrabold text-[9.5px] sm:text-xs inline-block shadow-2xs">
                              Late
                            </span>
                          ) : isAbsent ? (
                            <span className="px-1.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-[#ffe4e6] text-[#9f1239] dark:bg-rose-950/60 dark:text-rose-300 font-extrabold text-[9.5px] sm:text-xs inline-block shadow-2xs">
                              Absent
                            </span>
                          ) : log.status === 'UPCOMING' ? (
                            <span className="px-1.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-extrabold text-[9.5px] sm:text-xs inline-block shadow-2xs">
                              Upcoming
                            </span>
                          ) : (
                            <span className="px-1.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-extrabold text-[9.5px] sm:text-xs inline-block shadow-2xs">
                              {log.status || 'Half Day'}
                            </span>
                          )}
                        </div>

                        {/* ACTION Column */}
                        <div className="text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailLog(log)}
                            className="px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 text-blue-600 dark:text-blue-300 font-bold text-[10px] sm:text-xs inline-flex items-center gap-0.5 sm:gap-1.5 transition-all shadow-2xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                            <span>View</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 font-semibold bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                    No attendance history records match the selected filter criteria.
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Pagination Footer Bar (Matching Image 1) */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap">
              <div className="text-xs font-semibold text-slate-500">
                Showing {modalFilteredLogs.length > 0 ? (modalPage - 1) * itemsPerPage + 1 : 0} to {Math.min(modalPage * itemsPerPage, modalFilteredLogs.length)} of {modalFilteredLogs.length} entries
              </div>

              <div className="flex items-center gap-1.5 max-w-full overflow-x-auto [&::-webkit-scrollbar]:hidden py-0.5">
                <button
                  type="button"
                  disabled={modalPage <= 1}
                  onClick={() => handleModalPageChange(Math.max(1, modalPage - 1))}
                  className="w-9 h-9 rounded-full border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-slate-700 transition-all text-xs cursor-pointer shadow-2xs shrink-0"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {getVisiblePages(modalPage, totalModalPages).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => handleModalPageChange(pg)}
                    className={`w-9 h-9 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                      modalPage === pg
                        ? 'bg-blue-600 text-white shadow-md border-2 border-slate-900 dark:border-white ring-2 ring-blue-500/20'
                        : 'border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={modalPage >= totalModalPages}
                  onClick={() => handleModalPageChange(Math.min(totalModalPages, modalPage + 1))}
                  className="w-9 h-9 rounded-full border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-slate-700 transition-all text-xs cursor-pointer shadow-2xs shrink-0"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Row Action View Detail Modal (Matching Image 1 Design) */}
      <Modal
        isOpen={Boolean(selectedDetailLog)}
        onClose={() => setSelectedDetailLog(null)}
        title=""
        maxWidth="max-w-lg"
      >
        {selectedDetailLog && (
          <div className="space-y-2.5 sm:space-y-3.5 font-sans text-slate-800 dark:text-slate-100">
            {/* Header Title with Subtext */}
            <div className="flex items-start justify-between pr-8">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-[#7c3aed] dark:text-purple-300">
                    <Calendar className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span>Attendance Record Detail</span>
                </h3>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-400 mt-0.5">
                  Detailed attendance information for the selected date
                </p>
              </div>
            </div>

            {/* Top Date & Status Banner Card */}
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[#f5f3ff] dark:bg-indigo-950/40 border border-purple-100/80 dark:border-purple-900/40 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#ede9fe] dark:bg-purple-900/60 text-[#7c3aed] dark:text-purple-300 shrink-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Date
                  </span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate block">
                    {new Date(selectedDetailLog.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {['OVER_DUTY', 'OD'].includes(selectedDetailLog.status) && (
                  <span className="px-2.5 sm:px-3.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 font-black text-[11px] sm:text-xs inline-flex items-center gap-1.5 border border-purple-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                    <span>⚡ OVER DUTY (OD)</span>
                  </span>
                )}
                {selectedDetailLog.status === 'WEEK_OFF' && (
                  <span className="px-2.5 sm:px-3.5 py-1 rounded-full bg-[#f5f3ff] text-[#7c3aed] dark:bg-purple-950/70 dark:text-purple-300 font-black text-[11px] sm:text-xs inline-flex items-center gap-1.5 border border-purple-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]"></span>
                    <span>WEEK OFF</span>
                  </span>
                )}
                {selectedDetailLog.status === 'PRESENT' && (
                  <span className="px-2.5 sm:px-3.5 py-1 rounded-full bg-[#dcfce7] text-[#15803d] dark:bg-emerald-950/70 dark:text-emerald-300 font-black text-[11px] sm:text-xs inline-flex items-center gap-1.5 border border-emerald-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>PRESENT</span>
                  </span>
                )}
                {selectedDetailLog.status === 'LATE' && (
                  <span className="px-2.5 sm:px-3.5 py-1 rounded-full bg-[#ffedd5] text-[#c2410c] dark:bg-amber-950/70 dark:text-amber-300 font-black text-[11px] sm:text-xs inline-flex items-center gap-1.5 border border-amber-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>LATE</span>
                  </span>
                )}
                {selectedDetailLog.status === 'ABSENT' && (
                  <span className="px-2.5 sm:px-3.5 py-1 rounded-full bg-[#ffe4e6] text-[#e11d48] dark:bg-rose-950/70 dark:text-rose-300 font-black text-[11px] sm:text-xs inline-flex items-center gap-1.5 border border-rose-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>ABSENT</span>
                  </span>
                )}
                {selectedDetailLog.status === 'UPCOMING' && (
                  <span className="px-2.5 sm:px-3.5 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-black text-[11px] sm:text-xs inline-flex items-center gap-1.5 border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span>UPCOMING</span>
                  </span>
                )}
                {!['PRESENT', 'LATE', 'ABSENT', 'UPCOMING', 'WEEK_OFF'].includes(selectedDetailLog.status) && (
                  <span className="px-2.5 sm:px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-black text-[11px] sm:text-xs border border-slate-200">
                    {selectedDetailLog.status || 'Half Day'}
                  </span>
                )}
              </div>
            </div>

            {/* Attendance Details Card */}
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2 sm:space-y-2.5 shadow-2xs">
              {/* Check In */}
              <div className="flex items-center justify-between pb-2 sm:pb-2.5 border-b border-dashed border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-[#7c3aed] dark:text-purple-400">
                    <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Check In
                  </span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                  {selectedDetailLog.clockIn ? formatClockTime(selectedDetailLog.clockIn) : '--'}
                </span>
              </div>

              {/* Check Out */}
              <div className="flex items-center justify-between pb-2 sm:pb-2.5 border-b border-dashed border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Check Out
                  </span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                  {selectedDetailLog.clockOut ? formatClockTime(selectedDetailLog.clockOut) : '--'}
                </span>
              </div>

              {/* Work Duration */}
              <div className="flex items-center justify-between pb-2 sm:pb-2.5 border-b border-dashed border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Work Duration
                  </span>
                </div>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">
                  {selectedDetailLog.clockIn && selectedDetailLog.clockOut
                    ? formatWorkDuration(selectedDetailLog)
                    : '--'}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Location
                  </span>
                </div>
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-[11px] inline-flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700/60">
                  {selectedDetailLog.workLocation === 'WFH' ? '🏡 Home / WFH' : '🏢 In-Office'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Face Verification Modal for Check-In & Check-Out */}
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
    </div>
  );
};
