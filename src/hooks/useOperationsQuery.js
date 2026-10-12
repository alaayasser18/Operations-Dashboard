import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchOperations,
  fetchOperationStats,
  fetchOperationById,
  updateOperation,
} from '../api/mockApi';

/**
 * Hook to fetch paginated & filtered operations with TanStack Query
 */
export function useOperations(filterParams, { autoRefreshInterval = 0 } = {}) {
  return useQuery({
    queryKey: ['operations', filterParams],
    queryFn: ({ signal }) => fetchOperations({ ...filterParams, signal }),
    refetchInterval: autoRefreshInterval > 0 ? autoRefreshInterval * 1000 : false,
    staleTime: 5000,
  });
}

/**
 * Hook to fetch live operation stats (KPI counts)
 */
export function useOperationStats({ autoRefreshInterval = 0 } = {}) {
  return useQuery({
    queryKey: ['operationStats'],
    queryFn: ({ signal }) => fetchOperationStats({ signal }),
    refetchInterval: autoRefreshInterval > 0 ? autoRefreshInterval * 1000 : false,
    staleTime: 5000,
  });
}

/**
 * Hook to fetch a single operation by ID
 */
export function useOperationDetail(id) {
  return useQuery({
    queryKey: ['operation', id],
    queryFn: ({ signal }) => fetchOperationById(id, { signal }),
    enabled: Boolean(id),
  });
}

/**
 * Hook for updating an operation with Optimistic Updates & Rollback
 */
export function useUpdateOperation({ onSuccess, onError } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => updateOperation(id, updates),

    // When mutate is called:
    onMutate: async ({ id, updates }) => {
      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['operations'] });
      await queryClient.cancelQueries({ queryKey: ['operation', id] });
      await queryClient.cancelQueries({ queryKey: ['operationStats'] });

      // 2. Snapshot previous values for rollback
      const previousOperation = queryClient.getQueryData(['operation', id]);
      const previousOperationsList = queryClient.getQueriesData({ queryKey: ['operations'] });
      const previousStats = queryClient.getQueryData(['operationStats']);

      // 3. Optimistically update single operation cache
      if (previousOperation) {
        queryClient.setQueryData(['operation', id], {
          ...previousOperation,
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      }

      // 4. Optimistically update operations in list queries
      queryClient.setQueriesData({ queryKey: ['operations'] }, (oldData) => {
        if (!oldData || !oldData.operations) return oldData;
        return {
          ...oldData,
          operations: oldData.operations.map((op) =>
            op.id === id ? { ...op, ...updates, updatedAt: new Date().toISOString() } : op
          ),
        };
      });

      // 5. Optimistically update stats if status changed
      if (updates.status && previousOperation && previousOperation.status !== updates.status) {
        queryClient.setQueryData(['operationStats'], (oldStats) => {
          if (!oldStats) return oldStats;
          const oldStatus = previousOperation.status;
          const newStatus = updates.status;
          return {
            ...oldStats,
            [oldStatus]: Math.max(0, (oldStats[oldStatus] || 1) - 1),
            [newStatus]: (oldStats[newStatus] || 0) + 1,
          };
        });
      }

      // Return context with snapshots for rollback
      return { previousOperation, previousOperationsList, previousStats };
    },

    // If mutation fails, rollback using our snapshots
    onError: (err, variables, context) => {
      if (context?.previousOperation) {
        queryClient.setQueryData(['operation', variables.id], context.previousOperation);
      }
      if (context?.previousOperationsList) {
        context.previousOperationsList.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousStats) {
        queryClient.setQueryData(['operationStats'], context.previousStats);
      }

      if (onError) onError(err, variables, context);
    },

    // Always refetch after error or success to guarantee sync
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      queryClient.invalidateQueries({ queryKey: ['operation', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['operationStats'] });
    },

    onSuccess: (data, variables) => {
      if (onSuccess) onSuccess(data, variables);
    },
  });
}
