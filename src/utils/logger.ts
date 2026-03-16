type LogType = 'info' | 'error' | 'warn';

interface LogEntry {
  type: LogType;
  message: string;
  timestamp: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private listeners: ((logs: LogEntry[]) => void)[] = [];
  private maxLogs = 200;

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      this.addLog('info', args.join(' '));
      originalLog(...args);
    };

    console.error = (...args) => {
      this.addLog('error', args.join(' '));
      originalError(...args);
    };

    console.warn = (...args) => {
      this.addLog('warn', args.join(' '));
      originalWarn(...args);
    };
  }

  private addLog(type: LogType, message: string) {
    const entry: LogEntry = {
      type,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(l => l([...this.logs]));
  }

  public subscribe(callback: (logs: LogEntry[]) => void) {
    this.listeners.push(callback);
    callback([...this.logs]);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  public getLogs() {
    return [...this.logs];
  }

  public clear() {
    this.logs = [];
    this.notify();
  }
}

export const logger = new Logger();
