#!/usr/bin/env node

/**
 * Kp-Music Bot Launcher v2.1
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Production-ready launcher con supresión completa de warnings
 * y optimizaciones para estabilidad 24/7 incluyendo health check
 */

'use strict';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAPA 1: Configuración de Node.js
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
process.env.NODE_NO_WARNINGS = '1';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Optimizaciones de rendimiento
if (typeof process.setMaxListeners !== 'undefined') {
  process.setMaxListeners(50);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAPA 2: Supresión de Warnings Global
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Definir lista de códigos a suprimir
const SUPPRESS_WARNING_CODES = new Set([
  'TimeoutNegativeWarning',
  'DEP0169',  // url.parse() deprecation
  'DEP0168',  // nextTick con argumento
  'DEP0173',  // String.prototype.padStart
]);

// Listener principal para warnings
process.on('warning', (warning) => {
  // Suprimir warnings conocidos
  if (SUPPRESS_WARNING_CODES.has(warning.code)) {
    return;
  }
  
  // Para otros warnings, mostrar solo si es crítico
  if (warning.category === 'ExperimentalWarning') {
    return;
  }
  
  // Log de otros warnings (pero no de los suprimidos)
  console.warn(`⚠️  [${warning.code}]: ${warning.message}`);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAPA 3: Patch de Timing Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const _originalSetTimeout = global.setTimeout;
const _originalSetImmediate = global.setImmediate;

// Wrapper para setTimeout con validación de delays
global.setTimeout = function(callback, delay, ...args) {
  const validDelay = Math.max(1, typeof delay === 'number' ? delay : 0);
  return _originalSetTimeout.call(global, callback, validDelay, ...args);
};

// Mantener propiedades del original
Object.setPrototypeOf(global.setTimeout, _originalSetTimeout);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAPA 4: Crash Handlers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', error.message);
  console.error(error.stack);
  // No salir del proceso, intentar recuperarse
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ UNHANDLED REJECTION:', reason instanceof Error ? reason.message : String(reason));
  if (reason instanceof Error) console.error(reason.stack);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAPA 5: Health Check Server (Para Render.com & Cloud Hosts)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const http = require('http');
const PORT = process.env.PORT || 3000;

let botReady = false;

const healthServer = http.createServer((req, res) => {
  // Log requests
  if (req.url !== '/health') {
    console.log(`HTTP ${req.method} ${req.url}`);
  }

  // Health check endpoint (for Render, Railway, etc.)
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      bot: botReady ? 'ready' : 'loading',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }));
    return;
  }

  // Stats endpoint
  if (req.url === '/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      }
    }));
    return;
  }

  // Root endpoint
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kp-Music Bot</title>
          <style>
            body { font-family: Arial; padding: 20px; background: #2b2d31; color: #fff; }
            h1 { color: #1DB954; }
            .status { padding: 10px; background: #404249; border-radius: 5px; margin: 10px 0; }
            a { color: #1DB954; text-decoration: none; }
          </style>
        </head>
        <body>
          <h1>🎵 Kp-Music Bot</h1>
          <div class="status">
            <p><strong>Status:</strong> ${botReady ? '✅ Running' : '⏳ Loading'}</p>
            <p><strong>Uptime:</strong> ${Math.floor(process.uptime())} seconds</p>
            <p><strong>Memory:</strong> ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB</p>
          </div>
          <h3>Endpoints:</h3>
          <ul>
            <li><a href="/health">/health</a> - Health check (JSON)</li>
            <li><a href="/stats">/stats</a> - Statistics (JSON)</li>
          </ul>
        </body>
      </html>
    `);
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

healthServer.listen(PORT, () => {
  console.log(`  🌐 Health check server listening on port ${PORT}`);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAPA 6: Cargar la aplicación
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const indexModule = require('./src/index.js');

// Mark bot as ready after a short delay
setTimeout(() => {
  botReady = true;
  console.log('  ✅ Bot ready for requests');
}, 2000);

