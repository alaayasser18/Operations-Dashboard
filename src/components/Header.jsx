import React from 'react';
import { 
  Activity, 
  Clock, 
  RotateCw, 
  Sun, 
  Moon, 
  Languages, 
  Wifi, 
  ShieldAlert, 
  SlidersHorizontal 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export function Header({ 
  autoRefreshInterval, 
  setAutoRefreshInterval, 
  onManualRefresh, 
  isFetching,
}) {
  const { lang, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl border-b transition-colors bg-white/80 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity & Telemetry Wave */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 shadow-lg shadow-cyan-500/20 text-white">
            <Activity className="w-6 h-6 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-cyan-400 bg-clip-text text-transparent">
                {t('app.title')}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                {t('app.liveIndicator')}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 hidden md:block">
              {t('app.subtitle')}
            </p>
          </div>
        </div>

        {/* Center: Live Soundwave / Activity indicator */}
        <div className="hidden lg:flex items-center gap-1 h-6 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mr-2 flex items-center gap-1">
            <Wifi className="w-3 h-3 text-cyan-500" /> SYNC
          </span>
          <div className="w-1 h-3 bg-cyan-500 rounded-full telemetry-bar-1" />
          <div className="w-1 h-5 bg-indigo-500 rounded-full telemetry-bar-2" />
          <div className="w-1 h-2 bg-purple-500 rounded-full telemetry-bar-3" />
          <div className="w-1 h-4 bg-emerald-500 rounded-full telemetry-bar-4" />
          <div className="w-1 h-3 bg-cyan-400 rounded-full telemetry-bar-5" />
        </div>

        {/* Right: Controls & Toggles */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Auto Refresh dropdown & manual button */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1">
            <button
              onClick={onManualRefresh}
              disabled={isFetching}
              title={t('app.refreshNow')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-cyan-500' : ''}`} />
            </button>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="text-xs bg-transparent border-none text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer px-1.5 py-0.5"
            >
              <option value={0} className="bg-white dark:bg-slate-900">{t('app.off')}</option>
              <option value={5} className="bg-white dark:bg-slate-900">5{t('app.seconds')}</option>
              <option value={15} className="bg-white dark:bg-slate-900">15{t('app.seconds')}</option>
              <option value={30} className="bg-white dark:bg-slate-900">30{t('app.seconds')}</option>
              <option value={60} className="bg-white dark:bg-slate-900">60{t('app.seconds')}</option>
            </select>
          </div>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-500" />
            <span>{t('app.lang.toggle')}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={t('app.theme.toggle')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

        </div>

      </div>
    </header>
  );
}
