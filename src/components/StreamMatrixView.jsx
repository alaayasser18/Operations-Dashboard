import React from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { StatusBadge } from './OperationsTable';

export function StreamMatrixView({ operations, onSelectOperation, selectedId }) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {operations.map((op, idx) => {
        const isSelected = selectedId === op.id;

        return (
          <motion.div
            key={op.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: idx * 0.03 }}
            whileHover={{ y: -4, transition: { duration: 0.15 } }}
            onClick={() => onSelectOperation(op.id)}
            className={`cursor-pointer group relative p-4 rounded-2xl border transition-all duration-200 backdrop-blur-xl shadow-lg ${
              isSelected
                ? 'ring-2 ring-cyan-500 bg-cyan-500/10 dark:bg-cyan-950/40 border-cyan-500/50'
                : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/40 hover:shadow-xl'
            }`}
          >
            {/* Header: ID & Status */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                {op.id}
              </span>
              <StatusBadge status={op.status} />
            </div>

            {/* Title */}
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 min-h-[40px] mb-3 group-hover:text-cyan-500 transition-colors">
              {op.name}
            </h4>

            {/* Simulated Live telemetry sparkline/progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>PROGRESS</span>
                <span>{op.progress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    op.status === 'Completed' ? 'bg-emerald-500' :
                    op.status === 'Running' ? 'bg-blue-500 animate-pulse' :
                    op.status === 'Failed' ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${op.progress}%` }}
                />
              </div>
            </div>

            {/* Assignee & Footer */}
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img 
                  src={op.assigneeAvatar} 
                  alt={op.assignedPerson} 
                  className="w-6 h-6 rounded-full object-cover" 
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {op.assignedPerson}
                </span>
              </div>

              <div className="text-[11px] text-slate-400">
                {formatDate(op.updatedAt)}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function PipelineMatrixView({ operations, onSelectOperation, selectedId }) {
  const { t } = useLanguage();
  const statuses = ['Pending', 'Running', 'Completed', 'Failed'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {statuses.map(st => {
        const opsInStatus = operations.filter(op => op.status === st);
        const color = 
          st === 'Pending' ? 'amber' :
          st === 'Running' ? 'blue' :
          st === 'Completed' ? 'emerald' : 'rose';

        return (
          <div 
            key={st}
            className="flex flex-col rounded-2xl p-4 bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full bg-${color}-500`} />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {t(`app.status.${st}`)}
                </h3>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {opsInStatus.length}
              </span>
            </div>

            {/* List */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[620px] pr-1">
              {opsInStatus.map(op => {
                const isSelected = selectedId === op.id;
                return (
                  <motion.div
                    key={op.id}
                    layout
                    onClick={() => onSelectOperation(op.id)}
                    className={`cursor-pointer p-3 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'ring-2 ring-cyan-500 bg-cyan-500/10 dark:bg-cyan-950/40 border-cyan-500/50'
                        : 'bg-white/80 dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                        {op.id}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {op.priority}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 mb-2">
                      {op.name}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/50 text-[11px] text-slate-500">
                      <span>{op.assignedPerson}</span>
                      <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-400" />
                    </div>
                  </motion.div>
                );
              })}

              {opsInStatus.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No operations in this state
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
