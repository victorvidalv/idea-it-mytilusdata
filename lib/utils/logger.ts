/**
 * Logger estructurado para la aplicación
 * Compatible con Node.js y el navegador
 */

/**
 * Niveles de log
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Emojis para cada nivel de log
 */
const LOG_EMOJIS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: '🔍',
  [LogLevel.INFO]: 'ℹ️',
  [LogLevel.WARN]: '⚠️',
  [LogLevel.ERROR]: '❌',
};

/**
 * Colores para consola (solo en Node.js)
 */
const LOG_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: '\x1b[36m', // Cyan
  [LogLevel.INFO]: '\x1b[32m', // Green
  [LogLevel.WARN]: '\x1b[33m', // Yellow
  [LogLevel.ERROR]: '\x1b[31m', // Red
};

const RESET_COLOR = '\x1b[0m';

/**
 * Contexto del logger
 */
export interface LoggerContext {
  userId?: number;
  requestId?: string;
  [key: string]: unknown;
}

/**
 * Entrada de log estructurada
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LoggerContext;
  error?: Error;
}

/**
 * Configuración del logger
 */
export interface LoggerConfig {
  level: LogLevel;
  enableColors: boolean;
  enableTimestamp: boolean;
  enableRequestId: boolean;
}

/**
 * Clase Logger para logging estructurado
 */
export class Logger {
  private config: LoggerConfig;
  private currentRequestId?: string;
  private currentUserId?: number;
  private isBrowser: boolean;

  constructor(config?: Partial<LoggerConfig>) {
    this.isBrowser = typeof window !== 'undefined';
    
    this.config = {
      level: LogLevel.INFO,
      enableColors: !this.isBrowser, // Solo colores en Node.js
      enableTimestamp: true,
      enableRequestId: true,
      ...config,
    };

    // Generar requestId inicial si está habilitado
    if (this.config.enableRequestId) {
      this.currentRequestId = this.generateRequestId();
    }
  }

  /**
   * Genera un ID único para la solicitud
   */
  private generateRequestId(): string {
    if (this.isBrowser) {
      // En el navegador usar crypto.randomUUID si está disponible
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      // Fallback para navegadores antiguos
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // En Node.js
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Genera un nuevo requestId
   */
  public newRequestId(): string {
    this.currentRequestId = this.generateRequestId();
    return this.currentRequestId;
  }

  /**
   * Obtiene el requestId actual
   */
  public getRequestId(): string | undefined {
    return this.currentRequestId;
  }

  /**
   * Establece el requestId actual
   */
  public setRequestId(requestId: string): void {
    this.currentRequestId = requestId;
  }

  /**
   * Establece el userId actual
   */
  public setUserId(userId: number): void {
    this.currentUserId = userId;
  }

  /**
   * Obtiene el userId actual
   */
  public getUserId(): number | undefined {
    return this.currentUserId;
  }

  /**
   * Limpia el contexto actual
   */
  public clearContext(): void {
    this.currentRequestId = this.config.enableRequestId ? this.generateRequestId() : undefined;
    this.currentUserId = undefined;
  }

  /**
   * Formatea el timestamp
   */
  private formatTimestamp(): string {
    const now = new Date();
    return now.toISOString();
  }

  /**
   * Verifica si el nivel de log debe ser mostrado
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.config.level);
  }

  /**
   * Construye el contexto completo
   */
  private buildContext(context?: LoggerContext): LoggerContext {
    const fullContext: LoggerContext = {};
    
    if (this.currentUserId) {
      fullContext.userId = this.currentUserId;
    }
    
    if (this.currentRequestId) {
      fullContext.requestId = this.currentRequestId;
    }
    
    if (context) {
      Object.assign(fullContext, context);
    }
    
    return fullContext;
  }

  /**
   * Formatea el mensaje de log para consola
   */
  private formatLogMessage(entry: LogEntry): string {
    const emoji = LOG_EMOJIS[entry.level];
    const timestamp = this.config.enableTimestamp ? `[${entry.timestamp}] ` : '';
    const level = entry.level.toUpperCase().padEnd(5);
    
    // Construir el mensaje base
    let message = `${emoji} ${timestamp}${level}: ${entry.message}`;
    
    // Agregar contexto si existe
    if (entry.context && Object.keys(entry.context).length > 0) {
      const contextStr = JSON.stringify(entry.context, null, 2);
      message += `\n  Context: ${contextStr}`;
    }
    
    // Agregar error si existe
    if (entry.error) {
      message += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack) {
        message += `\n  Stack: ${entry.error.stack}`;
      }
    }
    
    return message;
  }

  /**
   * Escribe el log a la consola
   */
  private writeToConsole(entry: LogEntry): void {
    const message = this.formatLogMessage(entry);
    
    if (this.isBrowser) {
      // En el navegador
      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug(message);
          break;
        case LogLevel.INFO:
          console.info(message);
          break;
        case LogLevel.WARN:
          console.warn(message);
          break;
        case LogLevel.ERROR:
          console.error(message);
          break;
      }
    } else {
      // En Node.js con colores
      const color = this.config.enableColors ? LOG_COLORS[entry.level] : '';
      const reset = this.config.enableColors ? RESET_COLOR : '';
      const coloredMessage = `${color}${message}${reset}`;
      
      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug(coloredMessage);
          break;
        case LogLevel.INFO:
          console.info(coloredMessage);
          break;
        case LogLevel.WARN:
          console.warn(coloredMessage);
          break;
        case LogLevel.ERROR:
          console.error(coloredMessage);
          break;
      }
    }
  }

  /**
   * Crea una entrada de log
   */
  private createLogEntry(level: LogLevel, message: string, context?: LoggerContext, error?: Error): LogEntry {
    return {
      timestamp: this.formatTimestamp(),
      level,
      message,
      context: this.buildContext(context),
      error,
    };
  }

  /**
   * Registra un mensaje de nivel DEBUG
   */
  public debug(message: string, context?: LoggerContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.writeToConsole(entry);
  }

  /**
   * Registra un mensaje de nivel INFO
   */
  public info(message: string, context?: LoggerContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.writeToConsole(entry);
  }

  /**
   * Registra un mensaje de nivel WARN
   */
  public warn(message: string, context?: LoggerContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.writeToConsole(entry);
  }

  /**
   * Registra un mensaje de nivel ERROR
   */
  public error(message: string, error?: Error, context?: LoggerContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
    this.writeToConsole(entry);
  }

  /**
   * Crea un logger hijo con contexto adicional
   */
  public child(context: LoggerContext): Logger {
    const childLogger = new Logger(this.config);
    childLogger.currentRequestId = this.currentRequestId;
    childLogger.currentUserId = this.currentUserId;
    return childLogger;
  }

  /**
   * Actualiza la configuración del logger
   */
  public setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Obtiene la configuración actual
   */
  public getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

// ============================================================================
// INSTANCIA GLOBAL DEL LOGGER
// ============================================================================

/**
 * Instancia global del logger
 */
export const logger = new Logger({
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
});

/**
 * Crea un nuevo logger con configuración personalizada
 */
export function createLogger(config?: Partial<LoggerConfig>): Logger {
  return new Logger(config);
}
