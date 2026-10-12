import React, { useState } from 'react';
import { useUrlParams, useDebounce } from '../hooks/useUrlParams';
import { useOperations, useOperationStats } from '../hooks/useOperationsQuery';
import { setSimulatorConfig } from '../api/mockApi';
import { Header } from './Header';
import { StatsCards } from './StatsCards';
import { FilterBar } from './FilterBar';
import { OperationsTable } from './OperationsTable';
import { StreamMatrixView, PipelineMatrixView } from './StreamMatrixView';
import { Pagination } from './Pagination';
import { OperationInspector, UnsavedChangesDialog } from './OperationInspector';

export function Dashboard() {
  // Sync state with URL search params
  const { params, setParam, setMultipleParams, resetFilters } = useUrlParams({
    search: '',
    status: 'all',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
    view: 'table', // 'table' | 'stream' | 'pipeline'
    selectedOpId: null,
  });

  // Local state for instant search input responsiveness
  const [searchInput, setSearchInput] = useState(params.search || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Auto refresh interval state (seconds)
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(15);

  // Unsaved changes & confirmation modal state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNextOpId, setPendingNextOpId] = useState(undefined);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // Sync debounced search to URL params and reset page to 1
  React.useEffect(() => {
    if (debouncedSearch !== params.search) {
      setParam('search', debouncedSearch);
    }
  }, [debouncedSearch, params.search, setParam]);

  // Fetch operations query (preserves pagination, filters, and auto-refreshes)
  const {
    data: operationsData,
    isLoading: isOpsLoading,
    isFetching: isOpsFetching,
    refetch: refetchOperations,
  } = useOperations(
    {
      search: params.search,
      status: params.status,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      page: params.page,
      limit: params.limit,
    },
    { autoRefreshInterval }
  );

  // Fetch live stats counts
  const {
    data: statsData,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useOperationStats({ autoRefreshInterval });

  const handleManualRefresh = () => {
    refetchOperations();
    refetchStats();
  };

  // Safe operation select handler with unsaved changes detection
  const handleSelectOperation = (opId) => {
    if (params.selectedOpId === opId) return;

    if (hasUnsavedChanges) {
      setPendingNextOpId(opId);
      setShowDiscardDialog(true);
    } else {
      setParam('selectedOpId', opId);
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardDialog(false);
    setHasUnsavedChanges(false);
    setParam('selectedOpId', pendingNextOpId);
    setPendingNextOpId(undefined);
  };

  const handleCancelKeepEditing = () => {
    setShowDiscardDialog(false);
    setPendingNextOpId(undefined);
  };

  const handleCloseInspector = () => {
    if (hasUnsavedChanges) {
      setPendingNextOpId(null);
      setShowDiscardDialog(true);
    } else {
      setParam('selectedOpId', null);
    }
  };

  const hasActiveFilters = Boolean(
    (params.search && params.search.trim() !== '') ||
    (params.status && params.status !== 'all') ||
    params.sortBy !== 'updatedAt' ||
    params.sortOrder !== 'desc'
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-cyan-500 selection:text-white">
      
      {/* Top HUD Header */}
      <Header
        autoRefreshInterval={autoRefreshInterval}
        setAutoRefreshInterval={setAutoRefreshInterval}
        onManualRefresh={handleManualRefresh}
        isFetching={isOpsFetching}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* KPI Statistics Cards */}
        <StatsCards
          stats={statsData}
          activeStatus={params.status}
          onSelectStatus={(st) => setParam('status', st)}
          isLoading={isStatsLoading}
        />

        {/* Filter and View Controls Toolbar */}
        <FilterBar
          search={searchInput}
          onSearchChange={setSearchInput}
          status={params.status}
          onStatusChange={(st) => setParam('status', st)}
          sortBy={params.sortBy}
          sortOrder={params.sortOrder}
          onSortChange={(sb, so) => setMultipleParams({ sortBy: sb, sortOrder: so })}
          onResetFilters={() => {
            setSearchInput('');
            resetFilters();
          }}
          viewMode={params.view}
          onViewModeChange={(v) => setParam('view', v)}
          hasActiveFilters={hasActiveFilters}
        />

        {/* View Modes (Table / Stream / Pipeline) */}
        {params.view === 'table' && (
          <OperationsTable
            operations={operationsData?.operations}
            onSelectOperation={handleSelectOperation}
            selectedId={params.selectedOpId}
            isLoading={isOpsLoading}
          />
        )}

        {params.view === 'stream' && (
          <StreamMatrixView
            operations={operationsData?.operations || []}
            onSelectOperation={handleSelectOperation}
            selectedId={params.selectedOpId}
          />
        )}

        {params.view === 'pipeline' && (
          <PipelineMatrixView
            operations={operationsData?.operations || []}
            onSelectOperation={handleSelectOperation}
            selectedId={params.selectedOpId}
          />
        )}

        {/* Pagination (Preserved during background refresh) */}
        {operationsData && operationsData.total > 0 && (
          <Pagination
            currentPage={operationsData.currentPage}
            totalPages={operationsData.totalPages}
            totalItems={operationsData.total}
            limit={operationsData.limit}
            onPageChange={(p) => setParam('page', p)}
            onLimitChange={(l) => setMultipleParams({ limit: l, page: 1 })}
          />
        )}

      </main>

      {/* Operation Inspector Slide-Over Drawer */}
      <OperationInspector
        operationId={params.selectedOpId}
        onClose={handleCloseInspector}
        onRequestSwitchOperation={(nextId) => {
          setPendingNextOpId(nextId);
          setShowDiscardDialog(true);
        }}
        setHasUnsavedChanges={setHasUnsavedChanges}
      />

      {/* Unsaved Changes Confirmation Dialog */}
      <UnsavedChangesDialog
        isOpen={showDiscardDialog}
        onConfirmDiscard={handleConfirmDiscard}
        onCancelKeepEditing={handleCancelKeepEditing}
      />

    </div>
  );
}
