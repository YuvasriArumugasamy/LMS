import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ASSETS } from '../assets';
import { KeyRound, Lock, Eye, EyeOff } from 'lucide-react';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenValue = searchParams.get('token') || '';
    const emailValue = searchParams.get('email') || '';
    setToken(tokenValue);
    setEmail(emailValue);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token || !email) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (!password) {
      setError('Please enter a new password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password, confirmPassword });
      setMessage('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
      >
        <source src={ASSETS.bgVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] pointer-events-none z-0" />

      {/* Sleek Reset Password Card matching Image 1 Design */}
      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-blue-200/60 dark:border-slate-800 rounded-3xl shadow-2xl p-7 relative z-10 text-center space-y-4">
        
        {/* Pure White Circular Key Container with Soft Radiant Blue Halo Aura */}
        <div className="relative group cursor-pointer inline-flex items-center justify-center mx-auto mb-1">
          <div className="absolute -inset-2.5 bg-gradient-to-tr from-blue-400 via-sky-300 to-indigo-400 rounded-full blur-lg opacity-60 group-hover:opacity-90 transition-opacity duration-500 animate-pulse" />
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white dark:bg-slate-900 shadow-[0_0_25px_rgba(59,130,246,0.4)] flex items-center justify-center p-3">
            <KeyRound className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Set New Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Enter a new password for <span className="font-bold text-blue-600">{email || 'your account'}</span>
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold text-left">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold text-left">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          {/* Input 1: New Password */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              New Password *
            </label>
            <div className="flex items-center border border-blue-200/90 dark:border-slate-700 rounded-xl overflow-hidden shadow-2xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 bg-slate-50/50 dark:bg-slate-800/60 transition-all">
              <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3 py-2.5 bg-transparent text-xs font-semibold text-slate-900 dark:text-white outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Input 2: Confirm Password */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Confirm New Password *
            </label>
            <div className="flex items-center border border-blue-200/90 dark:border-slate-700 rounded-xl overflow-hidden shadow-2xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 bg-slate-50/50 dark:bg-slate-800/60 transition-all">
              <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3 py-2.5 bg-transparent text-xs font-semibold text-slate-900 dark:text-white outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-blue-600/35 transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] mt-2"
          >
            {loading ? 'RESETTING PASSWORD...' : 'UPDATE PASSWORD NOW 🔑'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-2.5 px-4 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-center"
          >
            ← Back to Sign In
          </button>
        </form>
      </div>
    </div>
  );
};
