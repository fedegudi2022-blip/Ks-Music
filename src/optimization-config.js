/**
 * CONFIGURACIÓN DE OPTIMIZACIÓN DEL BOT
 * Parámetros críticos para rendimiento máximo
 */

module.exports = {
  // ── TIMEOUTS Y LÍMITES ──────────────────────────────────────
  SEARCH_TIMEOUT_MS: 8000,
  YTDLP_TIMEOUT_MS: 12000,
  PLAYLIST_FETCH_TIMEOUT_MS: 18000,
  STREAM_EXTRACT_TIMEOUT_MS: 10000,
  LOGIN_TIMEOUT_MS: 15000,
  
  // ── CACHE ───────────────────────────────────────────────────
  CACHE_MAX_SIZE: 5000,
  CACHE_TTL_MS: 7 * 24 * 60 * 60 * 1000, // 7 días
  STREAM_CACHE_TTL_MS: 4 * 60 * 60 * 1000, // 4 horas
  STREAM_CACHE_AGGRESSIVE_TTL_MS: 2 * 60 * 60 * 1000, // 2 horas
  
  // ── BÚSQUEDA ────────────────────────────────────────────────
  YT_API_MAX_RESULTS: 5, // Buscar 5 resultados para fallback
  YTDLP_MAX_RESULTS: 5,
  SPOTIFY_SEARCH_LIMIT: 3,
  FUZZY_MATCH_THRESHOLD: 0.65,
  
  // ── PLAYLIST ────────────────────────────────────────────────
  PLAYLIST_LIMIT: 30,
  PLAYLIST_BATCH_SIZE: 5,
  SPOTIFY_BATCH_SIZE: 4,
  PRE_EXTRACT_VIDEOS: 5, // Pre-extraer stream de primeros 5 videos
  
  // ── PRE-FETCH ───────────────────────────────────────────────
  PREFETCH_QUEUE_ENABLED: true,
  PREFETCH_AHEAD_COUNT: 2, // Pre-fetch siguiente + 1
  
  // ── ANTI-SPAM ───────────────────────────────────────────────
  COMMAND_COOLDOWN_MS: 100,
  MESSAGE_HANDLER_DEBOUNCE_MS: 50,
  
  // ── RECUPERACIÓN DE ERRORES ─────────────────────────────────
  RETRY_ON_ERROR: true,
  RETRY_ALTERNATIVES_COUNT: 5,
  AUTO_SKIP_ON_ERROR: true,
  ERROR_MESSAGE_DURATION_MS: 2500, // Auto-eliminar mensajes de error
  
  // ── AHORRO DE RECURSOS ──────────────────────────────────────
  LEAVE_ON_EMPTY: true,
  LEAVE_ON_FINISH: true,
  LEAVE_ON_STOP: true,
  
  // ── LOGGING ─────────────────────────────────────────────────
  VERBOSE_LOGGING: false, // Activar para debug
  LOG_CACHE_HITS: true,
};
