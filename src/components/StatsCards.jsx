import React from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  ArrowUpRight 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function StatsCards({ stats, activeStatus, onSelectStatus, isLoading }) {
  const { t } = useLanguage();

  const cards = [
    {
      key: 'all',
      status: 'all',
      title: t('app.stats.total'),
      count: stats?.total ?? 5200,
      icon: Layers,
      color: 'cyan',
      borderClass: 'border-cyan-500/30 hover:border-cyan-500',
      activeClass: 'ring-2 ring-cyan-500 bg-cyan-500/10 dark:bg-cyan-950/30',
      textGradient: 'from-cyan-500 to-blue-500',
      glow: 'shadow-cyan-500/10',
      badge: '100%',
    },
    {
      key: 'Pending',
      status: 'Pending',
      title: t('app.stats.pending'),
      count: stats?.Pending ?? 0,
      icon: Clock,
      color: 'amber',
      borderClass: 'border-amber-500/30 hover:border-amber-500',
      activeClass: 'ring-2 ring-amber-500 bg-amber-500/10 dark:bg-amber-950/30',
      textGradient: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/10',
      badge: stats?.total ? `${Math.round((stats.Pending / stats.total) * 100)}%` : '--',
    },
    {
      key: 'Running',
      status: 'Running',
      title: t('app.stats.running'),
      count: stats?.Running ?? 0,
      icon: PlayCircle,
      color: 'blue',
      borderClass: 'border-blue-500/30 hover:border-blue-500',
      activeClass: 'ring-2 ring-blue-500 bg-blue-500/10 dark:bg-blue-950/30',
      textGradient: 'from-blue-500 to-indigo-500',
      glow: 'shadow-blue-500/10',
      badge: stats?.total ? `${Math.round((stats.Running / stats.total) * 100)}%` : '--',
    },
    {
      key: 'Completed',
      status: 'Completed',
      title: t('app.stats.completed'),
      count: stats?.Completed ?? 0,
      icon: CheckCircle2,
      color: 'emerald',
      borderClass: 'border-emerald-500/30 hover:border-emerald-500',
      activeClass: 'ring-2 ring-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/30',
      textGradient: 'from-emerald-500 to-teal-500',
      glow: 'shadow-emerald-500/10',
      badge: stats?.total ? `${Math.round((stats.Completed / stats.total) * 100)}%` : '--',
    },
    {
      key: 'Failed',
      status: 'Failed',
      title: t('app.stats.failed'),
      count: stats?.Failed ?? 0,
      icon: XCircle,
      color: 'rose',
      borderClass: 'border-rose-500/30 hover:border-rose-500',
      activeClass: 'ring-2 ring-rose-500 bg-rose-500/10 dark:bg-rose-950/30',
      textGradient: 'from-rose-500 to-red-500',
      glow: 'shadow-rose-500/10',
      badge: stats?.total ? `${Math.round((stats.Failed / stats.total) * 100)}%` : '--',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 my-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isSelected = activeStatus === card.status;

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.06 }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            onClick={() => onSelectStatus(card.status)}
            className={`cursor-pointer relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all duration-200 backdrop-blur-xl shadow-lg ${card.glow} ${
              isSelected 
                ? card.activeClass 
                : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:shadow-xl hover:bg-slate-50/80 dark:hover:bg-slate-850'
            }`}
          >
            {/* Ambient background glow orb */}
            <div 
              className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full opacity-10 blur-xl pointer-events-none bg-${card.color}-500`}
            />

            <div className="flex items-center justify-between gap-2 mb-3">
              <div className={`p-2.5 rounded-xl bg-${card.color}-500/10 text-${card.color}-600 dark:text-${card.color}-400 border border-${card.color}-500/20`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
                <span>{card.badge}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                {card.title}
              </p>
              
              <div className="flex items-baseline gap-2">
                {isLoading ? (
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
                ) : (
                  <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r ${card.textGradient} bg-clip-text text-transparent font-mono`}>
                    {card.count.toLocaleString()}
                  </h3>
                )}
              </div>
            </div>

            {/* Bottom active indicator line */}
            <div className={`mt-3 h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden`}>
              <div 
                className={`h-full bg-${card.color}-500 transition-all duration-500 rounded-full`}
                style={{ width: card.status === 'all' ? '100%' : card.badge }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
