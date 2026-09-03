import React from 'react';
import { motion } from 'framer-motion';

export const MetricCard = ({ title, value, icon: Icon, trend, color = 'primary', description, bgImage, onClick }) => {
  const colorMap = {
    primary: 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-800/80',
    secondary: 'text-purple-600 dark:text-purple-400 bg-purple-50/80 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800/80',
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/80',
    success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/80',
    danger: 'text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/60 border-rose-200/80 dark:border-rose-800/80',
  };

  const accentGlow = {
    primary: 'from-blue-500/15 via-blue-500/5 to-transparent',
    secondary: 'from-purple-500/15 via-purple-500/5 to-transparent',
    warning: 'from-amber-500/15 via-amber-500/5 to-transparent',
    success: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    danger: 'from-rose-500/15 via-rose-500/5 to-transparent',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -4, scale: 1.01 } : { y: -2 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={bgImage ? { '--bg-card-img': `url(${bgImage})` } : undefined}
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 min-h-[135px] sm:min-h-[145px] relative overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
        onClick ? 'cursor-pointer select-none hover:border-slate-300 dark:hover:border-slate-700' : ''
      } ${
        bgImage ? 'bg-[image:var(--bg-card-img)] dark:!bg-none bg-[length:100%_100%] bg-center bg-no-repeat' : ''
      }`}
    >
      {/* Dark mode bottom accent glow matching card theme color */}
      <div
        className={`absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t ${accentGlow[color] || accentGlow.primary} opacity-0 dark:opacity-100 pointer-events-none transition-opacity`}
      />

      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {title}
          </p>
          <h3 className="text-3xl sm:text-3xl lg:text-3xl font-black text-slate-900 dark:text-white mt-1 sm:mt-2 tracking-tight">
            {value}
          </h3>
          {description && <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{description}</p>}
        </div>

        {Icon && (
          <div className={`p-3 rounded-2xl border ${colorMap[color] || colorMap.primary} shadow-2xs shrink-0 flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-1 flex items-center justify-between text-[10px] font-extrabold relative z-10">
          <span className={typeof trend === 'string' && trend.includes('-') ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
            {typeof trend === 'string' ? (trend.startsWith('+') || trend.startsWith('-') ? trend : `↑ ${trend}`) : `${trend.isPositive ? '↑' : '↓'} ${trend.value}`}
          </span>
        </div>
      )}
    </motion.div>
  );
};
