import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { HolidayDetailsModal } from '../components/HolidayDetailsModal';
import { CalendarCheck, Plus, Calendar as CalendarIcon, Table as TableIcon, Trash2, ChevronRight, AlertTriangle, X } from 'lucide-react';

export const Holidays = () => {
  const { user } = useAuth();
  const [holidays, setHolidays] = useState([]);
  const [viewMode, setViewMode] = useState('card');
  const [loading, setLoading] = useState(true);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'NATIONAL',
    description: '',
    branch: 'All Branches'
  });

  const fetchHolidays = async () => {
    try {
      const res = await api.get('/holidays', { params: { year: yearFilter } });
      setHolidays(res.data.data.holidays || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [yearFilter]);

  const handleOpenDetails = (h) => {
    setSelectedHoliday(h);
    setIsDetailsModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/holidays', formData);
      setIsCreateModalOpen(false);
      fetchHolidays();
      setFormData({ name: '', date: '', type: 'NATIONAL', description: '', branch: 'All Branches' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add holiday');
    }
  };

  const handleDeleteClick = (id) => {
    setHolidayToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!holidayToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/holidays/${holidayToDelete}`);
      setIsDeleteConfirmOpen(false);
      setHolidayToDelete(null);
      fetchHolidays();
    } catch (err) {
      alert('Failed to delete holiday.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Keep old handleDelete for HolidayDetailsModal compatibility
  const handleDelete = handleDeleteClick;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Holiday Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Corporate holiday calendar and festive observances</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(Number(e.target.value))}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
          >
            {Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - 1 + i).map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>

          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'card' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'
              }`}
              title="Card View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'
              }`}
              title="Calendar Grid View"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>

          {['HR', 'ADMIN', 'CEO'].includes(user?.role) && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-enterprise shadow-lg shadow-primary/25 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Holiday
            </button>
          )}
        </div>
      </div>

      {/* View Mode 1: Responsive Cards View (Zero Horizontal Scrolling!) */}
      {viewMode === 'card' ? (
        <div className="space-y-3">
          {loading ? (
            <div className="glass-card p-8 text-center text-slate-400 font-medium">Loading holidays...</div>
          ) : holidays.length > 0 ? (
            holidays.map((h) => {
              const isPast = new Date(h.date) < new Date();
              return (
              <div
                key={h._id}
                onClick={() => handleOpenDetails(h)}
                className={`glass-card p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 items-center gap-3 md:gap-4 cursor-pointer hover:border-primary/50 transition-all group ${isPast ? 'opacity-60' : ''}`}
              >
                {/* Holiday Name & Icon: 5 Columns */}
                <div className="md:col-span-5 flex items-center justify-between md:justify-start gap-3.5 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:scale-105 transition-transform">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors text-xs sm:text-base truncate">
                        {h.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium truncate">{h.branch || 'All Branches'}</p>
                    </div>
                  </div>

                  {/* Type + Past badge on mobile */}
                  <div className="md:hidden shrink-0 flex flex-col items-end gap-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {h.type}
                    </span>
                    {isPast && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-500">Past</span>}
                  </div>
                </div>

                {/* Date Column: 4 Columns */}
                <div className="hidden md:flex md:col-span-4 items-center font-mono text-xs font-bold text-primary">
                  {new Date(h.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </div>

                {/* Type Badge & Action Arrow: 3 Columns */}
                <div className="flex items-center justify-between md:justify-end gap-2 md:col-span-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="hidden md:flex items-center gap-2">
                    {isPast && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-500">Past</span>}
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {h.type}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white text-slate-400 flex items-center justify-center transition-all shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
              );
            })
          ) : (
            <div className="glass-card p-12 text-center text-slate-400 font-medium">
              No corporate holidays configured.
            </div>
          )}
        </div>
      ) : (
        /* View Mode 2: Calendar Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {holidays.map((h) => (
            <div
              key={h._id}
              onClick={() => handleOpenDetails(h)}
              className="glass-card p-5 relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary px-2.5 py-1 rounded-md bg-primary/10">
                  {h.type}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {new Date(h.date).getFullYear()}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3 group-hover:text-primary transition-colors">{h.name}</h3>
              <p className="text-2xl font-extrabold text-primary mt-1">
                {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <p className="text-xs text-slate-500 mt-2 font-medium truncate">{h.description || 'Corporate Holiday'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Holiday Details Interactive Modal */}
      <HolidayDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        holiday={selectedHoliday}
        currentUser={user}
        onDelete={handleDelete}
      />

      {/* Add Holiday Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add Corporate Holiday">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Holiday Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Independence Day"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:border-primary"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:border-primary"
              >
                <option value="NATIONAL">National Holiday</option>
                <option value="COMPANY">Company Holiday</option>
                <option value="OPTIONAL">Optional / Restricted</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/25">Save</button>
          </div>
        </form>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteConfirmOpen} onClose={() => !deleteLoading && setIsDeleteConfirmOpen(false)} maxWidth="max-w-sm">
        <div className="space-y-4 text-center">
          <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-rose-500" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Delete Holiday?</h3>
            <p className="text-sm text-slate-500 mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={deleteLoading}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteLoading}
              onClick={handleConfirmDelete}
              className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
