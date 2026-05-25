export type QueryMode = 'answer' | 'summarize' | 'compare' | 'extract';

export interface QueryRequest {
  question: string;
  mode?: QueryMode;
}

export interface Citation {
  source_file: string;
  source_title: string;
  snippet: string;
}

export interface QueryResponse {
  answer: string;
  citations: Citation[];
  score: number;
  correlationId: string;
  metadata: {
    timings: {
      total_inference_ms: number;
      per_chunk: Array<{ label: string; ms: number }>;
    };
  };
}

export interface SystemStatus {
  model: string;
  ready: boolean;
  threads: number;
  cacheDir: string;
}

export interface SystemMetadata {
  modes: QueryMode[];
  downloaded_models: string[];
  available_models: string[];
  [key: string]: any;
}

export interface SystemConfig {
  server: {
    port: number;
    node_env: string;
  };
  models: {
    transformer_model: string;
    embedding_model: string;
    rerank_model: string;
    generative_model: string;
    summarization_model: string;
  };
  paths: {
    model_cache_dir: string;
    vector_store_path: string;
  };
  onnx_settings: {
    onnx_threads: number;
    embedding_quantized: boolean;
    rerank_quantized: boolean;
    generative_quantized: boolean;
    transformer_quantized: boolean;
  };
  inference_settings: {
    max_inference_chunks: number;
    model_init_timeout: number;
    qa_mode: 'extractive' | 'generative';
  };
  search_optimization: {
    bm25_threshold: number;
    bm25_weight: number;
    semantic_weight: number;
    rrf_k: number;
  };
  generative_qa_prompts: {
    generative_qa_prompt: string;
    generative_qa_fallback: string;
  };
  available_models: {
    registry: Array<{
      id: string;
      size: string;
      checksum: string;
      purpose: string;
    }>;
  };
  reranking: {
    rerank_top_n: number;
  };
  secrets: {
    hf_token_present: boolean;
  };
}

export type HealthStatus = 'UP' | 'DEGRADED' | 'DOWN';

export interface HealthCheck {
  status: HealthStatus;
  vector_store: string;
  transformers_loaded: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  metadata?: QueryResponse['metadata'];
  score?: number;
  timestamp: number;
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
}