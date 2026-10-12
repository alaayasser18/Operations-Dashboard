import React from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  X, 
  LayoutGrid, 
  Table as TableIcon, 
  GitCommit 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortBy,
  sortOrder,
  onSortChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
  hasActiveFilters
}) {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl p-4 backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-900/5 mb-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Left: Search input with Debounced value */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('app.controls.searchPlaceholder')}
            className="w-full pl-10 pr-9 rtl:pl-9 rtl:pr-10 py-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Filters, Sorting, and View Modes */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          
          {/* Status Dropdown */}
          <div className="relative flex items-center">
            <Filter className="absolute left-3 rtl:left-auto rtl:right-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="pl-8 pr-8 rtl:pl-8 rtl:pr-8 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer appearance-none"
            >
              <option value="all">{t('app.controls.allStatuses')}</option>
              <option value="Pending">{t('app.status.Pending')}</option>
              <option value="Running">{t('app.status.Running')}</option>
              <option value="Completed">{t('app.status.Completed')}</option>
              <option value="Failed">{t('app.status.Failed')}</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown className="absolute left-3 rtl:left-auto rtl:right-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('_');
                onSortChange(sb, so);
              }}
              className="pl-8 pr-8 rtl:pl-8 rtl:pr-8 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer appearance-none"
            >
              <option value="updatedAt_desc">{t('app.controls.sortUpdatedDesc')}</option>
              <option value="updatedAt_asc">{t('app.controls.sortUpdatedAsc')}</option>
              <option value="createdAt_desc">{t('app.controls.sortCreatedDesc')}</option>
              <option value="createdAt_asc">{t('app.controls.sortCreatedAsc')}</option>
              <option value="name_asc">{t('app.controls.sortNameAsc')}</option>
              <option value="name_desc">{t('app.controls.sortNameDesc')}</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-all flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('app.controls.resetFilters')}</span>
            </button>
          )}

          {/* Non-traditional View Mode Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => onViewModeChange('table')}
              title={t('app.views.table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'table'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{t('app.views.table')}</span>
            </button>
            <button
              onClick={() => onViewModeChange('stream')}
              title={t('app.views.stream')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'stream'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">{t('app.views.stream')}</span>
            </button>
            <button
              onClick={() => onViewModeChange('pipeline')}
              title={t('app.views.pipeline')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'pipeline'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GitCommit className="w-4 h-4" />
              <span className="hidden sm:inline">{t('app.views.pipeline')}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
