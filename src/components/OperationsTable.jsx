import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Calendar, 
  User 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function StatusBadge({ status }) {
  const { t } = useLanguage();

  const config = {
    Pending: {
      icon: Clock,
      style: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      dot: 'bg-amber-500',
    },
    Running: {
      icon: PlayCircle,
      style: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 shadow-sm shadow-blue-500/10',
      dot: 'bg-blue-500 animate-ping',
    },
    Completed: {
      icon: CheckCircle2,
      style: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-500',
    },
    Failed: {
      icon: XCircle,
      style: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      dot: 'bg-rose-500',
    },
  }[status] || {
    icon: Clock,
    style: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
    dot: 'bg-slate-500',
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{t(`app.status.${status}`) || status}</span>
    </span>
  );
}

export function OperationsTable({ 
  operations, 
  onSelectOperation, 
  selectedId, 
  isLoading 
}) {
  const { t, lang } = useLanguage();

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dateString;
    }
  };

  if (isLoading && (!operations || operations.length === 0)) {
    return (
      <div className="rounded-2xl p-8 backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!operations || operations.length === 0) {
    return (
      <div className="rounded-2xl p-12 text-center backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-lg">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <Sliders className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
          {t('app.table.noResults')}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('app.table.noResultsDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-900/5">
      <div className="overflow-x-auto">
        <table className="w-full text-left rtl:text-right border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-4 sm:px-6">{t('app.table.id')}</th>
              <th className="py-3.5 px-4 sm:px-6">{t('app.table.name')}</th>
              <th className="py-3.5 px-4 sm:px-6">{t('app.table.assignee')}</th>
              <th className="py-3.5 px-4 sm:px-6">{t('app.table.status')}</th>
              <th className="py-3.5 px-4 sm:px-6 hidden md:table-cell">{t('app.table.created')}</th>
              <th className="py-3.5 px-4 sm:px-6 hidden sm:table-cell">{t('app.table.updated')}</th>
              <th className="py-3.5 px-4 sm:px-6 text-right rtl:text-left">{t('app.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
            <AnimatePresence>
              {operations.map((op) => {
                const isSelected = selectedId === op.id;
                return (
                  <motion.tr
                    key={op.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => onSelectOperation(op.id)}
                    className={`cursor-pointer transition-colors duration-150 ${
                      isSelected
                        ? 'bg-cyan-500/10 dark:bg-cyan-950/30 font-medium'
                        : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {/* ID */}
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-xs text-cyan-600 dark:text-cyan-400">
                      {op.id}
                    </td>

                    {/* Name & Priority badge */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {op.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                          op.priority === 'Critical' ? 'bg-rose-500/20 text-rose-500' :
                          op.priority === 'High' ? 'bg-amber-500/20 text-amber-500' :
                          'bg-slate-500/15 text-slate-500'
                        }`}>
                          {op.priority}
                        </span>
                      </div>
                    </td>

                    {/* Assignee with avatar */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={op.assigneeAvatar} 
                          alt={op.assignedPerson} 
                          className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700" 
                        />
                        <div className="line-clamp-1">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {op.assignedPerson}
                          </p>
                          <p className="text-[11px] text-slate-400 hidden xl:block">
                            {op.assigneeRole}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <StatusBadge status={op.status} />
                    </td>

                    {/* Creation Date */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 hidden md:table-cell">
                      {formatDate(op.createdAt)}
                    </td>

                    {/* Last Update */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {formatDate(op.updatedAt)}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 sm:px-6 text-right rtl:text-left whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOperation(op.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-cyan-500 hover:text-white dark:bg-slate-800 dark:hover:bg-cyan-500 dark:hover:text-white text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <span>{t('app.table.inspect')}</span>
                        <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </button>
                    </td>

                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
