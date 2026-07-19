import { DEFAULT_OFFLINE_QUEUE_KEY } from "../constants";

export interface QueuedAction {
  id: string;
  type: "add" | "update" | "remove" | "markRead" | "archive";
  payload: Record<string, unknown>;
  createdAt: number;
  retries: number;
}

export class QueueService {
  constructor(private readonly key = DEFAULT_OFFLINE_QUEUE_KEY) {}

  private read(): QueuedAction[] {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(this.key);
    if (!raw) return [];

    try {
      return JSON.parse(raw) as QueuedAction[];
    } catch {
      return [];
    }
  }

  private write(queue: QueuedAction[]): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(this.key, JSON.stringify(queue));
  }

  enqueue(action: QueuedAction): void {
    const queue = this.read();
    queue.push(action);
    this.write(queue);
  }

  flush(): QueuedAction[] {
    const queue = this.read();
    this.write([]);
    return queue;
  }

  size(): number {
    return this.read().length;
  }
}
