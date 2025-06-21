/*
    wwwroot/js/interactiveelement/core/logger.js
    Version: 1.0.0
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Logger Utility
    ==============
    A simple, centralized logger to handle application-wide logging with configurable levels.
*/

const LogLevel = {
    NONE: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,
};

class Logger {
    constructor() {
        // Set the default log level. Can be changed at runtime.
        // e.g., set to LogLevel.NONE for production.
        this.currentLevel = LogLevel.DEBUG;
    }

    setLevel(level) {
        this.currentLevel = level;
    }

    debug(...args) {
        if (this.currentLevel >= LogLevel.DEBUG) {
            console.debug('[DEBUG]', ...args);
        }
    }

    info(...args) {
        if (this.currentLevel >= LogLevel.INFO) {
            console.info('[INFO]', ...args);
        }
    }

    warn(...args) {
        if (this.currentLevel >= LogLevel.WARN) {
            console.warn('[WARN]', ...args);
        }
    }

    error(...args) {
        if (this.currentLevel >= LogLevel.ERROR) {
            console.error('[ERROR]', ...args);
        }
    }
}

// Export a single instance to be used as a singleton across the application.
export const logger = new Logger();
export { LogLevel };