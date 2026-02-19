/**
 * Log Capture Middleware
 * Intercepts console output and HTTP request logs,
 * stores them in-memory for the admin notification panel.
 */

const MAX_LOGS = 200;
const logs = [];

// Capture levels: info, warn, error, debug
function addLog(level, message, meta = {}) {
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    timestamp: new Date().toISOString(),
    level,
    message: typeof message === 'string' ? message : JSON.stringify(message),
    meta,
  };
  logs.unshift(entry); // newest first
  if (logs.length > MAX_LOGS) logs.length = MAX_LOGS;
}

// ---- Intercept native console methods ----
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;
const originalConsoleDebug = console.debug;

function formatArgs(args) {
  return args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
}

console.log = function (...args) {
  addLog('info', formatArgs(args));
  originalConsoleLog.apply(console, args);
};
console.error = function (...args) {
  addLog('error', formatArgs(args));
  originalConsoleError.apply(console, args);
};
console.warn = function (...args) {
  addLog('warn', formatArgs(args));
  originalConsoleWarn.apply(console, args);
};
console.info = function (...args) {
  addLog('info', formatArgs(args));
  originalConsoleInfo.apply(console, args);
};
console.debug = function (...args) {
  addLog('debug', formatArgs(args));
  originalConsoleDebug.apply(console, args);
};

// ---- Express middleware to log every HTTP request ----
function requestLogger(req, res, next) {
  const start = Date.now();

  // Capture when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    addLog(level, `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
    });
  });

  next();
}

// ---- Getter for logs ----
function getLogs({ level, limit = 50, since } = {}) {
  let filtered = logs;
  if (level) {
    filtered = filtered.filter(l => l.level === level);
  }
  if (since) {
    const sinceDate = new Date(since);
    filtered = filtered.filter(l => new Date(l.timestamp) > sinceDate);
  }
  return filtered.slice(0, Math.min(limit, MAX_LOGS));
}

function clearLogs() {
  logs.length = 0;
}

module.exports = { requestLogger, getLogs, clearLogs, addLog };
