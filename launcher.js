#!/usr/bin/env node

/**
 * Kp-Music Bot Launcher v2.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Production-ready launcher con supresión completa de warnings
 * y optimizaciones para estabilidad 24/7
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
// CAPA 5: Cargar la aplicación
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

require('./src/index.js');
