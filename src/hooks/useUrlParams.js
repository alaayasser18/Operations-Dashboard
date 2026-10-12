import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to sync state bidirectionally with URL query parameters
 */
export function useUrlParams(defaultValues) {
  // Read initial params from window.location.search
  const getInitialParams = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const initial = { ...defaultValues };

    if (searchParams.has('search')) initial.search = searchParams.get('search');
    if (searchParams.has('status')) initial.status = searchParams.get('status');
    if (searchParams.has('sortBy')) initial.sortBy = searchParams.get('sortBy');
    if (searchParams.has('sortOrder')) initial.sortOrder = searchParams.get('sortOrder');
    if (searchParams.has('page')) initial.page = parseInt(searchParams.get('page'), 10) || 1;
    if (searchParams.has('limit')) initial.limit = parseInt(searchParams.get('limit'), 10) || 20;
    if (searchParams.has('view')) initial.view = searchParams.get('view');
    if (searchParams.has('op')) initial.selectedOpId = searchParams.get('op');

    return initial;
  };

  const [params, setParamsState] = useState(getInitialParams);

  // Sync state to URL without reloading page
  const updateUrl = useCallback((newParams) => {
    const url = new URL(window.location.href);
    const sp = url.searchParams;

    if (newParams.search) sp.set('search', newParams.search);
    else sp.delete('search');

    if (newParams.status && newParams.status !== 'all') sp.set('status', newParams.status);
    else sp.delete('status');

    if (newParams.sortBy && newParams.sortBy !== 'updatedAt') sp.set('sortBy', newParams.sortBy);
    else sp.delete('sortBy');

    if (newParams.sortOrder && newParams.sortOrder !== 'desc') sp.set('sortOrder', newParams.sortOrder);
    else sp.delete('sortOrder');

    if (newParams.page && newParams.page > 1) sp.set('page', String(newParams.page));
    else sp.delete('page');

    if (newParams.limit && newParams.limit !== 20) sp.set('limit', String(newParams.limit));
    else sp.delete('limit');

    if (newParams.view && newParams.view !== 'table') sp.set('view', newParams.view);
    else sp.delete('view');

    if (newParams.selectedOpId) sp.set('op', newParams.selectedOpId);
    else sp.delete('op');

    const newRelativePathQuery = url.pathname + (sp.toString() ? `?${sp.toString()}` : '');
    window.history.replaceState(null, '', newRelativePathQuery);
  }, []);

  const setParam = useCallback((key, value) => {
    setParamsState(prev => {
      const next = { ...prev, [key]: value };
      // If search or status changes, reset page to 1
      if (key === 'search' || key === 'status') {
        next.page = 1;
      }
      updateUrl(next);
      return next;
    });
  }, [updateUrl]);

  const setMultipleParams = useCallback((newObj) => {
    setParamsState(prev => {
      const next = { ...prev, ...newObj };
      updateUrl(next);
      return next;
    });
  }, [updateUrl]);

  const resetFilters = useCallback(() => {
    const reset = {
      ...defaultValues,
      view: params.view, // keep current view mode
      selectedOpId: params.selectedOpId, // keep open inspector if open
    };
    setParamsState(reset);
    updateUrl(reset);
  }, [defaultValues, params.view, params.selectedOpId, updateUrl]);

  // Listen to browser popstate (back / forward navigation)
  useEffect(() => {
    const onPopState = () => {
      setParamsState(getInitialParams());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return {
    params,
    setParam,
    setMultipleParams,
    resetFilters
  };
}

/**
 * Custom hook to debounce values for searching without race conditions
 */
export function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
