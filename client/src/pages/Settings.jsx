import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Zap, Building, Mail, Shield } from 'lucide-react';

export const Settings = () => {
  const [companyName, setCompanyName] = useState('Life Changers LMS');
  const [escalationMinutes, setEscalationMinutes] = useState(5);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">System & Company Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">Configure corporate policies, emergency escalation timers, and SMTP email rules</p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold text-center">
          ✅ Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Identity */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building className="w-5 h-5 text-primary" /> Corporate Identity
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>

        {/* Escalation Rules */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold border-b border-slate-100 dark:border-slate-800 pb-3">
            <Zap className="w-5 h-5 text-amber-500" /> Emergency Escalation Engine Rules
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Emergency Escalation Deadline (Minutes)
            </label>
            <input
              type="number"
              value={escalationMinutes}
              onChange={(e) => setEscalationMinutes(Number(e.target.value))}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none"
            />
            <p className="text-xs text-slate-400 font-medium mt-1">
              If a Manager does not act on an Emergency Leave request within this period, it automatically escalates to HR.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-primary hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/25 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
};
