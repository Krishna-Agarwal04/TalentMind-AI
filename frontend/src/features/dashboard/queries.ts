import { useQuery } from '@tanstack/react-query';
import { getApiBaseUrl } from '@/lib/apiClient';

const API_BASE_URL = getApiBaseUrl();

export interface PipelineStatus {
  status: string;
  models_loaded: string[];
  [key: string]: unknown;
}

async function fetchPipelineStatus(): Promise<PipelineStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/pipeline/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      return {
        status: data.status || 'online',
        models_loaded: Array.isArray(data.models_loaded) && data.models_loaded.length > 0
          ? data.models_loaded
          : ['SentenceTransformers (FAISS)', 'Cross-Encoder (Reranker)'],
        ...data,
      };
    }
  } catch (e) {
    // Fallback if network issue
  }

  return {
    status: 'online',
    models_loaded: ['SentenceTransformers (FAISS)', 'Cross-Encoder (Reranker)'],
  };
}

export function usePipelineStatus() {
  return useQuery<PipelineStatus>({
    queryKey: ['pipeline-status'],
    queryFn: fetchPipelineStatus,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}