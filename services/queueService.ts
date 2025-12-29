
import { IntakeAnalysisResult } from '../types';

export interface QueueItem {
  id: string;
  type: 'IMAGE_INFERENCE' | 'REPORT_GENERATION';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  title: string;
}

type QueueListener = (items: QueueItem[]) => void;

class QueueService {
  private queue: QueueItem[] = [];
  private listeners: Set<QueueListener> = new Set();
  private isProcessing = false;

  /**
   * Add a job to the queue
   */
  addJob(type: QueueItem['type'], title: string, task: () => Promise<any>) {
    const id = Date.now().toString();
    const item: QueueItem = {
      id,
      type,
      status: 'pending',
      progress: 0,
      title
    };
    
    this.queue = [item, ...this.queue]; // Add to top
    this.notify();
    this.processQueue(id, task);
    return id;
  }

  subscribe(listener: QueueListener) {
    this.listeners.add(listener);
    listener(this.queue); // Initial emit
    // Wrap listener deletion in a block to ensure it returns void for React cleanup compliance
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb([...this.queue]));
  }

  private async processQueue(id: string, task: () => Promise<any>) {
    // Update status to processing
    this.updateItem(id, { status: 'processing', progress: 10 });

    try {
      // Simulate progress steps for better UX
      const progressInterval = setInterval(() => {
        const current = this.queue.find(i => i.id === id);
        if (current && current.progress < 90) {
          this.updateItem(id, { progress: current.progress + 10 });
        }
      }, 500);

      // Execute actual task
      const result = await task();

      clearInterval(progressInterval);
      this.updateItem(id, { status: 'completed', progress: 100, result });
      
      // Auto-remove completed items after 10 seconds to keep list clean
      setTimeout(() => {
        this.queue = this.queue.filter(i => i.id !== id);
        this.notify();
      }, 10000);

    } catch (error) {
      this.updateItem(id, { status: 'failed', progress: 100 });
      console.error("Queue Task Failed", error);
    }
  }

  private updateItem(id: string, updates: Partial<QueueItem>) {
    this.queue = this.queue.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    this.notify();
  }
}

export const queueService = new QueueService();
