declare module "bull" {
  export interface Job<T = any> {
    id: string;
    data: T;
  }

  export default class Queue<T = any> {
    constructor(name: string, url?: string);
    process(concurrency: number, handler: (job: Job<T>) => Promise<any>): void;
    on(event: string, callback: Function): void;
    close(): Promise<void>;
    add(data: T, options?: any): Promise<Job<T>>;
  }
}
