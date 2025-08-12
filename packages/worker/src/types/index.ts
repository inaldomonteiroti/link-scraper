// Worker types
export interface WorkerConfig {
  concurrency: number;
  maxAttempts: number;
  backoffDelay: number;
}