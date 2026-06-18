import { useQuery } from '@tanstack/react-query';
import { docsService } from '@/services/docs.service';
import { SystemInfo } from '@/types/api';

export type { SystemInfo };

/**
 * Centralized hook to monitor backend health and system specifications.
 */
export function useSystemStatus() {
  const { data: systemInfo, isLoading, isError, refetch } = useQuery<SystemInfo>({
    queryKey: ['system-info'],
    queryFn: () => docsService.getStatus(),
    refetchInterval: 5000,
    retry: false,
  });

  const isOnline = !isError && !!systemInfo;
  const engineStatus = systemInfo?.status || 'offline';

  return {
    isLoading,
    isError,
    isSuccess: isOnline,
    systemInfo: systemInfo || {
      status: 'offline',
      models: { embedding: 'N/A', generative: 'N/A' },
      onnx_threads: 0
    },
    isOnline,
    engineStatus,
    isDegraded: systemInfo?.status === 'degraded',
    refetch,
  };
}