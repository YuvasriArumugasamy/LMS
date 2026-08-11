import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { CalendarDays, Plus, CheckCircle, XCircle, Trash2, AlertTriangle, Edit3 } from 'lucide-react';

const LEAVE_CARD_MAP = {
  CL: '/leave-cards/CL.png',
  EL: '/leave-cards/EL.png',
  EML: '/leave-cards/EML.png',
  SL: '/leave-cards/SL.png'
};

const DEFAULT_CARD_BG_LIST = [
  '/leave-cards/CL.png',
  '/leave-cards/EL.png',
  '/leave-cards/EML.png',
  '/leave-cards/SL.png'
];

const initialFormData = {
  name: '',
  code: '',
  maxDays: 12,
  colorBadge: '#2563EB',
  paidLeave: true,
  carryForward: false,
  documentRequired: false,
  allowHalfDay: true,
  description: ''
};

export const LeaveTypes = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'CEO' || user?.role === 'SUPER_ADMIN';

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  // Custom Delete Modal State
  const [ltToDelete, setLtToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchLeaveTypes = async () => {
    try {
      setError('');
      const res = await api.get('/leave-types');
      setLeaveTypes(res.data.data.leaveTypes || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to load leave policies right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
    setError('');
    setModalError('');
  };

  const handleOpenEdit = (lt) => {
    setEditingId(lt._id);
    setFormData({
      name: lt.name || '',
      code: lt.code || '',
      maxDays: lt.maxDays || 12,
      colorBadge: lt.colorBadge || '#2563EB',
      paidLeave: lt.paidLeave !== undefined ? lt.paidLeave : true,
      carryForward: !!lt.carryForward,
      documentRequired: !!lt.documentRequired,
      allowHalfDay: lt.allowHalfDay !== undefined ? lt.allowHalfDay : true,
      description: lt.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.name.trim() || !formData.code.trim()) {
      setModalError('Please provide a policy name and code.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await api.put(`/leave-types/${editingId}`, {
          ...formData,
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim()
        });
      } else {
        await api.post('/leave-types', {
          ...formData,
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim()
        });
      }
      closeModal();
      await fetchLeaveTypes();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save leave policy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (lt) => {
    setLtToDelete(lt);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!ltToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/leave-types/${ltToDelete._id}`);
      setIsDeleteModalOpen(false);
      setLtToDelete(null);
      await fetchLeaveTypes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete leave policy.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Leave Types & Policies</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Configure corporate leave entitlements, caps, and rules</p>
        </div>

        {canEdit && (
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-enterprise shadow-lg shadow-primary/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Leave Policy
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white/70 p-8 text-sm text-slate-500 shadow-sm">
          <CalendarDays className="mr-2 h-4 w-4" /> Loading leave policies...
        </div>
      ) : leaveTypes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
          <CheckCircle className="mx-auto mb-3 h-8 w-8 text-primary" />
          No leave policies have been created yet. Add your first policy to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaveTypes.map((lt, index) => {
            const codeKey = lt.code?.toUpperCase();
            const bgImage = LEAVE_CARD_MAP[codeKey] || DEFAULT_CARD_BG_LIST[index % DEFAULT_CARD_BG_LIST.length];

            return (
              <div
                key={lt._id || index}
                className="relative overflow-hidden rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/80 dark:border-slate-800 bg-[image:var(--bg-card-img)] dark:!bg-none bg-white dark:bg-slate-900 bg-[length:100%_100%] bg-center bg-no-repeat group min-h-[220px]"
                style={{
                  '--bg-card-img': `url(${bgImage})`,
                  minHeight: '220px'
                }}
              >
                <div className="relative z-10 p-6 flex flex-col justify-between h-full min-h-[220px]">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-white/90 text-slate-900 shadow-2xs backdrop-blur-sm">
                          {lt.code}
                        </span>

                        {canEdit && (
                          <>
                            {/* Blue Edit Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(lt);
                              }}
                              title="Edit Leave Policy"
                              className="p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/30 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 stroke-[2]" />
                            </button>

                            {/* Red Delete Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeleteModal(lt);
                              }}
                              title="Delete Leave Policy"
                              className="p-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/30 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                            </button>
                          </>
                        )}
                      </div>
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${lt.paidLeave ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300' : 'bg-slate-500/20 text-slate-800 dark:text-slate-200'}`}>
                        {lt.paidLeave ? 'Paid Leave' : 'Unpaid LOP'}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight mb-1">{lt.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-[240px]">{lt.description || 'Enterprise leave policy.'}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">{lt.maxDays}</span>
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-extrabold ml-1.5">Days / Year</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Leave Policy Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Leave Policy" : "Create Leave Policy"}>
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold">
              {modalError}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Leave Policy Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Paid Leave"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. EL"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Max Days / Year *</label>
              <input
                type="number"
                min="1"
                value={formData.maxDays}
                onChange={(e) => setFormData({ ...formData, maxDays: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="Optional policy notes"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Color Hex</label>
              <input
                type="color"
                value={formData.colorBadge}
                onChange={(e) => setFormData({ ...formData, colorBadge: e.target.value })}
                className="w-full h-10 p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none cursor-pointer"
              />
            </div>
            <div className="flex flex-col justify-center gap-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.paidLeave}
                  onChange={(e) => setFormData({ ...formData, paidLeave: e.target.checked })}
                  className="rounded text-primary"
                />
                Paid Leave
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.documentRequired}
                  onChange={(e) => setFormData({ ...formData, documentRequired: e.target.checked })}
                  className="rounded text-primary"
                />
                Document Required
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.carryForward}
                  onChange={(e) => setFormData({ ...formData, carryForward: e.target.checked })}
                  className="rounded text-primary"
                />
                Carry Forward
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.allowHalfDay}
                  onChange={(e) => setFormData({ ...formData, allowHalfDay: e.target.checked })}
                  className="rounded text-primary"
                />
                Allow Half Day
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Policy'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal matching Screenshot 1 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title=""
      >
        <div className="p-2">
          {/* Top Header Row with Red Illustration Badge & Side Title */}
          <div className="flex items-center gap-4 text-left mb-5">
            {/* Left 3D-Style Illustration Badge */}
            <div className="relative w-20 h-20 rounded-full bg-rose-100/70 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/60 flex items-center justify-center shrink-0 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/30">
                <Trash2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 flex items-center justify-center text-slate-950 shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            {/* Right Side Header Title */}
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Delete Leave Policy?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                You are about to remove <span className="text-rose-600 dark:text-rose-400 font-extrabold">{ltToDelete?.name}.</span>
              </p>
            </div>
          </div>

          {/* Yellow Warning Message Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-2.5 text-left mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
              Warning: Deleting the <span className="font-extrabold">{ltToDelete?.name}</span> ({ltToDelete?.code}) policy cannot be undone. Corporate leave balances may be affected.
            </p>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 stroke-[2.5]" />
              <span>{deleteLoading ? 'Deleting...' : 'Yes, Delete'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
