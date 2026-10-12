import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Calendar, 
  ShieldAlert, 
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useOperationDetail, useUpdateOperation } from '../hooks/useOperationsQuery';
import { setSimulatorConfig } from '../api/mockApi';

export function OperationInspector({
  operationId,
  onClose,
  onRequestSwitchOperation,
  setHasUnsavedChanges
}) {
  const { t, isRTL } = useLanguage();
  const { data: operation, isLoading } = useOperationDetail(operationId);

  // Form local state
  const [formData, setFormData] = useState({
    name: '',
    assignedPerson: '',
    status: 'Pending',
    priority: 'Medium',
    notes: '',
  });

  const [isDirty, setIsDirty] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [simulateFailNext, setSimulateFailNext] = useState(false);

  // Keep track of the currently loaded operation ID to prevent auto-refresh from wiping unsaved changes
  const loadedOperationIdRef = useRef(null);

  // Sync form with loaded operation data safely
  useEffect(() => {
    if (operation && operation.id === operationId) {
      // If we switched to a different operation ID OR form hasn't been modified yet
      if (loadedOperationIdRef.current !== operationId || !isDirty) {
        setFormData({
          name: operation.name || '',
          assignedPerson: operation.assignedPerson || '',
          status: operation.status || 'Pending',
          priority: operation.priority || 'Medium',
          notes: operation.notes || '',
        });
        loadedOperationIdRef.current = operationId;
        setIsDirty(false);
        setHasUnsavedChanges(false);
      }
    }
  }, [operation, operationId, isDirty, setHasUnsavedChanges]);

  // Reset reference when drawer closes
  useEffect(() => {
    if (!operationId) {
      loadedOperationIdRef.current = null;
      setIsDirty(false);
      setHasUnsavedChanges(false);
    }
  }, [operationId, setHasUnsavedChanges]);

  // Track field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      const changed = 
        next.name !== (operation?.name || '') ||
        next.assignedPerson !== (operation?.assignedPerson || '') ||
        next.status !== (operation?.status || '') ||
        next.priority !== (operation?.priority || '') ||
        next.notes !== (operation?.notes || '');
      
      setIsDirty(changed);
      setHasUnsavedChanges(changed);
      return next;
    });
  };

  // TanStack Query Mutation with optimistic updates & rollback
  const updateMutation = useUpdateOperation({
    onSuccess: (savedRecord) => {
      setIsDirty(false);
      setHasUnsavedChanges(false);
      if (savedRecord) {
        setFormData({
          name: savedRecord.name || '',
          assignedPerson: savedRecord.assignedPerson || '',
          status: savedRecord.status || 'Pending',
          priority: savedRecord.priority || 'Medium',
          notes: savedRecord.notes || '',
        });
      }
      setToastMessage({
        type: 'success',
        text: t('app.inspector.successSaved'),
      });
      setTimeout(() => setToastMessage(null), 4000);
    },
    onError: (err) => {
      setToastMessage({
        type: 'error',
        text: t('app.inspector.optimisticRollback'),
      });
      setTimeout(() => setToastMessage(null), 6000);
    },
  });

  const handleSave = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!operationId) return;

    // Set simulator config if user wants to test rollback
    if (simulateFailNext) {
      setSimulatorConfig({ errorRate: 1.0 });
    } else {
      setSimulatorConfig({ errorRate: 0 });
    }

    updateMutation.mutate(
      {
        id: operationId,
        updates: formData,
      },
      {
        onSettled: () => {
          // Always reset simulated failure rate back to 0
          setSimulatorConfig({ errorRate: 0 });
          setSimulateFailNext(false);
        }
      }
    );
  };

  const handleDiscard = () => {
    if (operation) {
      setFormData({
        name: operation.name || '',
        assignedPerson: operation.assignedPerson || '',
        status: operation.status || 'Pending',
        priority: operation.priority || 'Medium',
        notes: operation.notes || '',
      });
      setIsDirty(false);
      setHasUnsavedChanges(false);
    }
  };

  const handleSafeClose = () => {
    if (isDirty) {
      onRequestSwitchOperation(null);
    } else {
      onClose();
    }
  };

  if (!operationId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleSafeClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        />

        {/* Slide-over Drawer */}
        <motion.div
          initial={{ x: isRTL ? -500 : 500, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: isRTL ? -500 : 500, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-l rtl:border-l-0 rtl:border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20">
                  {operationId}
                </span>
                {isDirty && (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {t('app.inspector.unsavedChanges')}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {t('app.inspector.title')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('app.inspector.detailsSub')}
              </p>
            </div>

            <button
              onClick={handleSafeClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={t('app.inspector.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toast Notification for optimistic updates / rollback */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`m-4 p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold shadow-lg ${
                  toastMessage.type === 'success'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
                }`}
              >
                {toastMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span>{toastMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drawer Body Form */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {isLoading && !operation ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-5">
                
                {/* Operation Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    {t('app.inspector.operationName')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-semibold"
                  />
                </div>

                {/* Assigned Person */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    {t('app.inspector.assignedPerson')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.assignedPerson}
                      onChange={(e) => handleFieldChange('assignedPerson', e.target.value)}
                      className="w-full pl-9 pr-3.5 rtl:pl-3.5 rtl:pr-9 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                    />
                  </div>
                </div>

                {/* Status Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    {t('app.inspector.status')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Pending', 'Running', 'Completed', 'Failed'].map((st) => {
                      const isSelected = formData.status === st;
                      const colors = {
                        Pending: 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10',
                        Running: 'border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10',
                        Completed: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
                        Failed: 'border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10',
                      }[st];

                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleFieldChange('status', st)}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                            isSelected
                              ? `${colors} ring-2 ring-current shadow-md`
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <span>{t(`app.status.${st}`)}</span>
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-current' : 'bg-slate-400'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    {t('app.inspector.priority')}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Low', 'Medium', 'High', 'Critical'].map((p) => {
                      const isSelected = formData.priority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleFieldChange('priority', p)}
                          className={`py-2 px-1 rounded-xl text-xs font-semibold border text-center transition-all ${
                            isSelected
                              ? 'bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-500/25'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {t(`app.inspector.priority${p}`)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes & Logs */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    {t('app.inspector.notes')}
                  </label>
                  <textarea
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    placeholder={t('app.inspector.notesPlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none"
                  />
                </div>

                {/* Rollback Testing Switch */}
                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {isRTL ? 'محاكاة خطأ الخادم (لاختبار Rollback)' : 'Simulate API Failure (Test Rollback)'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {isRTL ? 'يفشل الحفظ عمداً لإظهار التراجع التلقائي' : 'Forces error on save to verify optimistic rollback'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSimulateFailNext(prev => !prev)}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    {simulateFailNext ? (
                      <ToggleRight className="w-6 h-6 text-rose-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-400" />
                    )}
                  </button>
                </div>

                {/* Metadata Timestamps */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>{t('app.inspector.creationDate')}:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {new Date(operation?.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('app.inspector.lastUpdate')}:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {new Date(operation?.updatedAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                </div>

              </form>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-950/40">
            {isDirty && (
              <button
                type="button"
                onClick={handleDiscard}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('app.inspector.cancel')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>
                {updateMutation.isPending
                  ? t('app.inspector.saving')
                  : t('app.inspector.saveChanges')}
              </span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function UnsavedChangesDialog({ isOpen, onConfirmDiscard, onCancelKeepEditing }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
      />

      {/* Dialog box */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-10"
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {t('app.dialog.unsavedTitle')}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          {t('app.dialog.unsavedDesc')}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancelKeepEditing}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            {t('app.dialog.keepEditing')}
          </button>

          <button
            onClick={onConfirmDiscard}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
          >
            {t('app.dialog.discard')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
