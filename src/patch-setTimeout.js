/**
 * Parche global para eliminar TimeoutNegativeWarning
 * Debe cargarse ANTES que cualquier otra dependencia
 */

// Guardar el setTimeout original
const _originalSetTimeout = global.setTimeout;

// Crear un wrapper que valide el delay
global.setTimeout = function(callback, delay, ...args) {
  // Asegurar que delay sea un número positivo
  let validDelay = delay;
  
  if (typeof validDelay !== 'number' || validDelay < 0) {
    validDelay = 1; // Mínimo 1ms para evitar warnings
  }
  
  // Llamar al setTimeout original con delay validado
  return _originalSetTimeout.call(global, callback, validDelay, ...args);
};

// Copiar propiedades para mantener compatibilidad
Object.setPrototypeOf(global.setTimeout, Object.getPrototypeOf(_originalSetTimeout));
global.setTimeout.toString = () => 'function setTimeout() { [native code] }';

// Suprimir todos los warnings de dependencias
process.on('warning', (warning) => {
  // Suprimir completamente todos los warnings
  // No mostrar nada en consola
  return;
});
