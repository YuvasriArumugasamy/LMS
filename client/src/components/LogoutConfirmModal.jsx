import React from 'react';
import { Modal } from './Modal';
import { ASSETS } from '../assets';
import { LogOut, XCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" overflowHidden={true}>
      <div className="space-y-2.5 sm:space-y-3 text-center p-0.5 sm:p-1">
        {/* Top Illustration Image matching Image 1 & Image 3 */}
        <div className="flex items-center justify-center">
          <img
            src={ASSETS.logoutIllustration}
            alt="Logout Illustration"
            className="w-32 sm:w-44 md:w-48 h-auto object-contain max-h-28 sm:max-h-36 drop-shadow-sm"
          />
        </div>

        {/* Title and Subtitle matching Image 1 */}
        <div className="space-y-0.5 sm:space-y-1">
          <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Confirm Logout
          </h3>
          <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400">
            You're about to sign out of <span className="text-rose-500 font-black">Life Changers LMS.</span>
          </p>
        </div>

        {/* Unsaved Changes Warning Alert Card */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-left flex items-center gap-2.5 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-rose-600 dark:text-rose-400" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-rose-700 dark:text-rose-300">
            Unsaved changes may not be saved.
          </span>
        </div>

        {/* Action Buttons: Cancel & Yes, Sign Out matching Image 1 */}
        <div className="flex items-center gap-2.5 sm:gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 sm:py-2.5 px-3 sm:px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-extrabold rounded-2xl transition-all shadow-2xs flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <XCircle className="w-4 h-4 text-slate-500" />
            <span>Cancel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirm();
            }}
            className="flex-1 py-2.5 sm:py-2.5 px-3 sm:px-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg shadow-rose-500/30 transition-all flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4 text-white" />
            <span>Yes, Sign Out</span>
          </button>
        </div>

        {/* Bottom Banner Badge: You can sign in again anytime. */}
        <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center gap-2 text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
          <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span>You can sign in again anytime.</span>
        </div>
      </div>
    </Modal>
  );
};
