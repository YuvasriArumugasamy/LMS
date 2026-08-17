import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { CalendarDays, Plus, CheckCircle, XCircle, Trash2, AlertTriangle, Edit3 } from 'lucide-react';

const LEAVE_CARD_MAP = {
  CL: '/leave-cards/CL.webp',
  EL: '/leave-cards/EL.webp',
  PL: '/leave-cards/EL.webp',
  EML: '/leave-cards/EML.webp',
  SL: '/leave-cards/SL.webp'
};

const DEFAULT_CARD_BG_LIST = [
  '/leave-cards/CL.webp',
  '/leave-cards/EL.webp',
  '/leave-cards/EML.webp',
  '/leave-cards/SL.webp'
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
  const canEdit = user?.role === 'CEO' || user?.role === 'ADMIN';

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
    <div className="space-y-6 pb-28 sm:pb-8">
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
            const displayCode = lt.code === 'EL' ? 'PL' : (lt.code || '');
            const displayName = lt.name?.toLowerCase().includes('earned') ? 'Paid Leave' : lt.name;
            const codeKey = displayCode.toUpperCase();
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
                          {displayCode}
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

                    <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight mb-1">{displayName}</h3>
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
      <Modal isOpen={isModalOpen} onClose={closeModal} hideCloseButton={true} maxWidth="max-w-xl">
        <div className="space-y-4">
          <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/40 shadow-xs">
                <CalendarDays className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {editingId ? "Edit Leave Policy" : "Create Leave Policy"}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Configure enterprise leave quotas and rules
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors shrink-0"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-4">
            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {modalError}
              </div>
            )}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-1.5">Leave Policy Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Paid Leave"
                className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-1.5">Code <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. EL"
                  className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-1.5">Max Days / Year <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxDays}
                  onChange={(e) => setFormData({ ...formData, maxDays: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-1.5">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional policy notes"
                  className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-1.5">Color Badge</label>
                <div className="relative">
                  <input
                    type="color"
                    value={formData.colorBadge}
                    onChange={(e) => setFormData({ ...formData, colorBadge: e.target.value })}
                    className="w-full h-[42px] p-1 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Premium Toggle Switches for Settings */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'paidLeave', label: 'Paid Leave', desc: 'Is this a paid leave?' },
                { id: 'documentRequired', label: 'Require Doc', desc: 'Medical cert needed?' },
                { id: 'carryForward', label: 'Carry Forward', desc: 'Transfer unused days?' },
                { id: 'allowHalfDay', label: 'Half Day', desc: 'Allow partial day request?' }
              ].map(setting => (
                <label key={setting.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                  <div className="pr-2">
                    <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{setting.label}</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 truncate">{setting.desc}</p>
                  </div>
                  <div className={`relative w-9 h-5 rounded-full transition-colors shrink-0 shadow-inner ${formData[setting.id] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                    <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${formData[setting.id] ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={formData[setting.id]}
                    onChange={(e) => setFormData({ ...formData, [setting.id]: e.target.checked })}
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Policy'}
              </button>
            </div>
          </form>
        </div>
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
