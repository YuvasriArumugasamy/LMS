import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { UserAvatar } from './UserAvatar';
import { StatusBadge } from './Badge';
import api from '../services/api';
import { Mail, Phone, Building2, Award, Calendar, ShieldCheck, UserCheck, CheckCircle, XCircle, Edit3, Save, X, Trash2 } from 'lucide-react';

export const EmployeeDetailsModal = ({
  isOpen,
  onClose,
  employee,
  departments = [],
  designations = [],
  onToggleStatus,
  onUpdateSuccess
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    designation: '',
    role: 'EMPLOYEE',
    employmentType: 'Full Time'
  });

  const handlePhoneChange = (value) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setEditForm({ ...editForm, phone: digitsOnly });
  };

  useEffect(() => {
    if (employee) {
      setEditForm({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        phone: employee.phone || '',
        department: employee.department?._id || employee.department || '',
        designation: employee.designation?._id || employee.designation || '',
        role: employee.role || 'EMPLOYEE',
        employmentType: employee.employmentType || 'Full Time'
      });
      setIsEditing(false);
    }
  }, [employee, isOpen]);

  if (!employee) return null;

  const handleStatusClick = async () => {
    const nextStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmText = nextStatus === 'INACTIVE' ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${confirmText} ${employee.firstName}'s account?`)) {
      return;
    }
    setLoading(true);
    try {
      await api.patch(`/employees/${employee._id}/status`, { status: nextStatus });
      alert(`✅ Employee account ${nextStatus.toLowerCase()}d successfully!`);
      if (onUpdateSuccess) onUpdateSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update employee status.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!window.confirm(`⚠️ Warning: Are you sure you want to remove ${employee.firstName} ${employee.lastName}?`)) {
      return;
    }
    setLoading(true);
    try {
      await api.delete(`/employees/${employee._id}`);
      alert(`✅ Employee account removed successfully!`);
      if (onUpdateSuccess) onUpdateSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove employee account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...editForm };
      if (!payload.department) delete payload.department;
      if (!payload.designation) delete payload.designation;
      await api.put(`/employees/${employee._id}`, payload);
      alert('✅ Employee details updated successfully!');
      setIsEditing(false);
      if (onUpdateSuccess) onUpdateSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update employee details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Employee Profile' : 'Employee Account Profile'} maxWidth="max-w-2xl">
      <div className="space-y-5 pr-2 sm:pr-4 pb-6">
        {/* Header Overview Banner */}
        <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-sky-500/5 to-transparent border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <UserAvatar user={employee} size="w-12 h-12 text-xs" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                  {employee.firstName} {employee.lastName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/20 truncate">
                  {employee.role?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-1 flex items-center gap-1.5 truncate max-w-[18rem]">
                <Mail className="w-3 h-3 text-slate-400" />
                <span className="truncate">{employee.email}</span>
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3">
            <StatusBadge status={employee.status} />
          </div>
        </div>

        {/* Mode 1: View Details */}
        {!isEditing ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Employee ID</p>
                <p className="text-sm font-extrabold text-primary font-mono mt-1 truncate">{employee.employeeId || 'N/A'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Department</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5 truncate">
                  <Building2 className="w-4 h-4 text-blue-500" /> <span className="truncate">{employee.department?.name || 'Unassigned'}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Designation</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5 truncate">
                  <Award className="w-4 h-4 text-emerald-500" /> <span className="truncate">{employee.designation?.name || 'Unassigned'}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Contact Phone</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5 font-mono truncate">
                  <Phone className="w-4 h-4 text-amber-500" /> <span className="truncate">{employee.phone || 'Not provided'}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Employment Type</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                  {employee.employmentType || 'Full Time'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Date of Joining</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5 font-mono truncate">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span className="truncate">{employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}</span>
                </p>
              </div>
            </div>

            {/* Bottom Actions Row: Edit Button + Status Toggle + Delete */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2.5 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-400 text-xs font-black rounded-xl flex items-center gap-2 transition-all shadow-2xs"
              >
                <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Edit Employee Details
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleStatusClick}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black text-white shadow-md transition-all flex items-center gap-2 ${
                    employee.status === 'ACTIVE'
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {employee.status === 'ACTIVE' ? (
                    <>
                      <XCircle className="w-4 h-4" /> Deactivate Account
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> Activate Account
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleDeleteClick}
                  className="px-4 py-2.5 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all flex items-center gap-2"
                  title="Delete Account"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Mode 2: Edit Form */
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">First Name *</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone Number</label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                maxLength={10}
                placeholder="1234567890"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Department</label>
                <select
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-primary"
                >
                  <option value="">Select Dept</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Designation</label>
                <select
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-primary"
                >
                  <option value="">Select Designation</option>
                  {designations.map((des) => (
                    <option key={des._id} value={des._id}>{des.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-primary"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="HR">HR Manager</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Employment Type</label>
                <select
                  value={editForm.employmentType}
                  onChange={(e) => setEditForm({ ...editForm, employmentType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-primary"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-blue-700 rounded-xl shadow-lg shadow-primary/25 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
