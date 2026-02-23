/**
 * resolver.js v11 — Production-ready search engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Optimized for speed, reliability, and 24/7 operation
 * - Cache LRU + TTL + Fuzzy matching
 * - Parallel searches (YouTube API + yt-dlp + Spotify)
 * - Auto-retry on unavailable videos
 * - Memory management & GC
 */

'use strict';

const { execFile } = require("child_process");
const { promisify } = require("util");
const fs   = require("fs");
const path = require("path");

const execFileAsync = promisify(execFile);
const YTDLP = process.env.YTDLP_PATH
  || (fs.existsSync(path.join(process.cwd(), "yt-dlp.exe")) ? path.join(process.cwd(), "yt-dlp.exe") : "yt-dlp");

const CACHE_FILE     = path.join(process.cwd(), ".music-cache.json");
const CACHE_MAX      = 5000;
const CACHE_TTL      = 7 * 24 * 60 * 60 * 1000;
const STREAM_TTL     = 4 * 60 * 60 * 1000;
const PLAYLIST_LIMIT = parseInt(process.env.PLAYLIST_LIMIT) || 30;
const YT_API_KEY     = process.env.YOUTUBE_API_KEY || null;
const SEARCH_TIMEOUT = 8000;
const YTDLP_TIMEOUT  = 12000;

// ─── MEMORY MANAGEMENT ───────────────────────────
setInterval(() => {
  if (global.gc) {
    try { global.gc(); } catch { }
  }
}, 5 * 60 * 1000);

// ─── LRU CACHE ───────────────────────────────────
class LRUCache {
  constructor(max) { 
    this.max = max; 
    this.data = new Map(); 
    this.frecuencia = new Map();
  }
  
  get(key) {
    if (!this.data.has(key)) return null;
    const e = this.data.get(key);
    if (Date.now() - e.ts > CACHE_TTL) { 
      this.data.delete(key); 
      this.frecuencia.delete(key);
      return null; 
    }
    this.data.delete(key); 
    this.data.set(key, e);
    this.frecuencia.set(key, (this.frecuencia.get(key) || 0) + 1);
    return e;
  }
  
  set(key, entry) {
    if (this.data.has(key)) this.data.delete(key);
    if (this.data.size >= this.max) {
      let minKey = null, minFreq = Infinity;
      for (const [k, freq] of this.frecuencia) {
        if (freq < minFreq && this.data.has(k)) {
          minFreq = freq;
          minKey = k;
        }
      }
      if (minKey) { 
        this.data.delete(minKey); 
        this.frecuencia.delete(minKey); 
      }
      else { 
        const first = this.data.keys().next().value;
        if (first) {
          this.data.delete(first);
          this.frecuencia.delete(first);
        }
      }
    }
    this.data.set(key, { ...entry, ts: Date.now() });
    this.frecuencia.set(key, this.frecuencia.get(key) || 1);
  }
  
  searchFuzzy(query, threshold = 0.6) {
    const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const q = norm(query);
    const results = [];
    
    for (const [key, val] of this.data) {
      const k = norm(key);
      const similarity = this.levenshteinSimilarity(q, k);
      if (similarity >= threshold) {
        const freshness = 1 - Math.min(1, (Date.now() - val.ts) / CACHE_TTL);
        const score = similarity * 0.7 + freshness * 0.3;
        results.push({ key, entry: val, score });
      }
    }
    
    return results.sort((a, b) => b.score - a.score).slice(0, 3);
  }
  
  levenshteinSimilarity(a, b) {
    const m = a.length, n = b.length;
    const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
    
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        dp[i][j] = Math.min(
          dp[i-1][j] + 1,
          dp[i][j-1] + 1,
          dp[i-1][j-1] + (a[i-1] !== b[j-1] ? 1 : 0)
        );
    
    const distance = dp[m][n];
    const maxLen = Math.max(m, n);
    return maxLen === 0 ? 1 : 1 - (distance / maxLen);
  }
  
  delete(key) { 
    this.data.delete(key); 
    this.frecuencia.delete(key);
  }
  
  toJSON() { 
    const o = {}; 
    for (const [k, v] of this.data) o[k] = v; 
    return o; 
  }
  
  fromJSON(obj) {
    const now = Date.now();
    for (const [k, v] of Object.entries(obj))
      if (v?.url && now - (v.ts ?? 0) < CACHE_TTL) this.data.set(k, v);
  }
  
  get size() { return this.data.size; }
}

const cache = new LRUCache(CACHE_MAX);
const streamCache = new Map();
const deadUrls = new Set();

try {
  if (fs.existsSync(CACHE_FILE)) cache.fromJSON(JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")));
  console.log(`  ⚡ Cache: ${cache.size} entradas`);
} catch { console.log("  ⚠  Cache vacío"); }

let _saveTimer = null;
const saveCache = () => {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    try { fs.writeFileSync(CACHE_FILE, JSON.stringify(cache.toJSON()), { encoding: 'utf8' }); } catch { }
  }, 5000);
};

// Cleanup every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of cache.data) {
    if (now - val.ts > CACHE_TTL) cache.delete(key);
  }
  for (const [key, val] of streamCache) {
    if (now - val.ts > STREAM_TTL) streamCache.delete(key);
  }
  if (cache.size !== 0) saveCache();
}, 60 * 60 * 1000);

// ─── SPOTIFY ─────────────────────────────────────
let _spToken = null, _spExpiry = 0, _spRetry = 0;
async function getSpotifyToken() {
  if (_spToken && Date.now() < _spExpiry) return _spToken;
  if (Date.now() < _spRetry) return null;
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) { _spRetry = Date.now() + 60_000; return null; }
    const d = await res.json();
    _spToken = d.access_token;
    _spExpiry = Date.now() + (d.expires_in - 60) * 1000;
    return _spToken;
  } catch { _spRetry = Date.now() + 30_000; return null; }
}
getSpotifyToken().then(t => t && console.log("  ✓ Spotify listo")).catch(() => {});

// ─── HELPERS ──────────────────────────────────────
function detectType(s) {
  if (/open\.spotify\.com\/(playlist|album)/.test(s) || /spotify:(playlist|album):/.test(s)) return "spotify-playlist";
  if (/open\.spotify\.com\/(?:intl-[a-z-]+\/)?track/.test(s) || /spotify:track:/.test(s)) return "spotify-track";
  if (/[?&]list=/.test(s) && /youtube\.com|youtu\.be|music\.youtube/.test(s)) return "yt-playlist";
  if (/youtube\.com\/playlist/.test(s)) return "yt-playlist";
  if (/youtu\.be\/[A-Za-z0-9_-]{11}/.test(s)) return "yt-video";
  if (/youtube\.com\/(watch|shorts|embed|v)/.test(s) || /music\.youtube\.com\/watch/.test(s)) return "yt-video";
  if (/^https?:\/\//.test(s)) return "url";
  return "text";
}

function extractSpotifyPlaylistId(url) {
  const m = url.match(/open\.spotify\.com\/(playlist|album)\/([A-Za-z0-9]+)/);
  return m ? { kind: m[1], id: m[2] } : null;
}

// ─── YOUTUBE API ──────────────────────────────────
async function ytApiSearch(query, maxResults = 5) {
  if (!YT_API_KEY) return null;
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(query)}&key=${YT_API_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return null;
    const data = await res.json();
    const items = data?.items ?? [];
    if (!items.length) return null;
    
    const results = items
      .map(item => {
        const id = item.id?.videoId;
        return id ? {
          url: `https://www.youtube.com/watch?v=${id}`,
          name: item.snippet?.title ?? query,
          thumbnail: item.snippet?.thumbnails?.high?.url ?? null,
        } : null;
      })
      .filter(r => r && !deadUrls.has(r.url));
    
    return results.length ? (maxResults === 1 ? results[0] : results) : null;
  } catch { return null; }
}

// ─── SPOTIFY SEARCH ───────────────────────────────
async function searchSpotify(query) {
  try {
    const token = await getSpotifyToken();
    if (!token) return null;
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=3`,
      { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(2000) }
    );
    if (!res.ok) return null;
    const tracks = (await res.json())?.tracks?.items ?? [];
    return tracks.length ? tracks.map(t => ({
      name: `${t.artists.map(a => a.name).join(", ")} - ${t.name}`,
      thumbnail: t.album?.images?.[0]?.url ?? null,
    })) : null;
  } catch { return null; }
}

async function getSpotifyTrack(id) {
  try {
    const token = await getSpotifyToken();
    if (!token) return null;
    const res = await fetch(
      `https://api.spotify.com/v1/tracks/${id}`,
      { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(2000) }
    );
    if (!res.ok) return null;
    const t = await res.json();
    return {
      name: `${t.artists?.map(a => a.name).join(", ")} - ${t.name}`,
      thumbnail: t.album?.images?.[0]?.url ?? null,
    };
  } catch { return null; }
}

async function spotifyPlaylistFull(id, kind, limit) {
  try {
    const token = await getSpotifyToken();
    if (!token) return null;
    const headers = { Authorization: `Bearer ${token}` };
    const [metaRes, tracksRes] = await Promise.all([
      fetch(
        `https://api.spotify.com/v1/${kind === "album" ? "albums" : "playlists"}/${id}?fields=name,images`,
        { headers, signal: AbortSignal.timeout(2500) }
      ),
      fetch(
        kind === "album"
          ? `https://api.spotify.com/v1/albums/${id}/tracks?limit=${limit}`
          : `https://api.spotify.com/v1/playlists/${id}/tracks?limit=${limit}&fields=items(track(name,artists))`,
        { headers, signal: AbortSignal.timeout(3500) }
      ),
    ]);
    const meta = metaRes.ok ? await metaRes.json() : {};
    if (!tracksRes.ok) return null;
    const tracks = ((await tracksRes.json()).items ?? [])
      .map(item => {
        const t = kind === "album" ? item : item?.track;
        return t?.name ? `${t.artists?.map(a => a.name).join(", ")} - ${t.name}` : null;
      })
      .filter(Boolean);
    return { name: meta.name ?? "Playlist", thumbnail: meta.images?.[0]?.url ?? null, tracks };
  } catch { return null; }
}

// ─── YT-DLP SEARCH ───────────────────────────────
async function ytdlpSearch(query, count = 5) {
  try {
    const args = [
      `ytsearch${count}:${query}`,
      "--print", "%(id)s\t%(title)s\t%(thumbnail)s",
      "--no-playlist", "--no-warnings", "--quiet",
    ];
    const cookieFile = path.join(process.cwd(), "cookies.txt");
    if (fs.existsSync(cookieFile)) args.push("--cookies", cookieFile);
    const { stdout } = await execFileAsync(YTDLP, args, { timeout: YTDLP_TIMEOUT });
    const lines = stdout.trim().split("\n").filter(Boolean);
    if (!lines.length) return count === 1 ? null : [];
    const results = lines.map(line => {
      const parts = line.split("\t");
      const id = parts[0]?.trim();
      if (!id || id.length < 5) return null;
      return {
        url: `https://www.youtube.com/watch?v=${id}`,
        name: parts[1]?.trim() ?? query,
        thumbnail: parts[2]?.trim() ?? null,
      };
    }).filter(r => r && !deadUrls.has(r.url));
    return count === 1 ? (results[0] ?? null) : results;
  } catch { return count === 1 ? null : []; }
}

// ─── YT-DLP PLAYLIST ───────────────────────────────
async function ytPlaylistFull(url, limit) {
  try {
    const args = [
      url, "--flat-playlist", "--playlist-end", String(limit),
      "--print", "%(playlist_title)s\t%(id)s",
      "--no-warnings", "--quiet",
    ];
    const cookieFile = path.join(process.cwd(), "cookies.txt");
    if (fs.existsSync(cookieFile)) args.push("--cookies", cookieFile);
    const { stdout } = await execFileAsync(YTDLP, args, { timeout: 18_000 });
    const lines = stdout.trim().split("\n").map(l => l.trim()).filter(Boolean);
    if (!lines.length) return null;
    let playlistName = "Playlist de YouTube";
    const urls = [];
    for (const line of lines) {
      const [title, id] = line.split("\t");
      if (title && title !== "NA" && title !== "None" && playlistName === "Playlist de YouTube")
        playlistName = title.trim();
      if (id && /^[A-Za-z0-9_-]{11}$/.test(id.trim()))
        urls.push(`https://www.youtube.com/watch?v=${id.trim()}`);
    }
    return urls.length ? { name: playlistName, thumbnail: null, urls } : null;
  } catch { return null; }
}

// ─── STREAM EXTRACTION ────────────────────────────
const _extracting = new Set();
async function preExtractStream(videoUrl) {
  if (!videoUrl || _extracting.has(videoUrl) || deadUrls.has(videoUrl)) return;
  const cached = streamCache.get(videoUrl);
  if (cached && Date.now() - cached.ts < STREAM_TTL / 2) return;
  
  _extracting.add(videoUrl);
  try {
    const args = [
      videoUrl, "--get-url",
      "-f", "bestaudio[ext=webm]/bestaudio/best",
      "--no-playlist", "--no-warnings", "--quiet",
    ];
    const cookieFile = path.join(process.cwd(), "cookies.txt");
    if (fs.existsSync(cookieFile)) args.push("--cookies", cookieFile);
    const { stdout } = await execFileAsync(YTDLP, args, { timeout: 10_000 });
    const streamUrl = stdout.trim().split("\n")[0];
    if (streamUrl?.startsWith("http")) {
      streamCache.set(videoUrl, { streamUrl, ts: Date.now() });
    }
  } catch { } finally { 
    _extracting.delete(videoUrl); 
  }
}

// ─── PARALLEL SEARCH ─────────────────────────────
async function searchVideoWithFallback(query, thumbnail = null) {
  const [spResults, ytApiResults, ytdlpResults] = await Promise.allSettled([
    searchSpotify(query),
    YT_API_KEY ? ytApiSearch(query, 5) : Promise.resolve(null),
    ytdlpSearch(query, 5),
  ]);
  
  const candidates = [];
  
  if (ytApiResults.status === "fulfilled" && ytApiResults.value) {
    const list = Array.isArray(ytApiResults.value) ? ytApiResults.value : [ytApiResults.value];
    candidates.push(...list.filter(r => !deadUrls.has(r.url)));
  }
  
  if (ytdlpResults.status === "fulfilled" && ytdlpResults.value) {
    const list = Array.isArray(ytdlpResults.value) ? ytdlpResults.value : (ytdlpResults.value ? [ytdlpResults.value] : []);
    for (const r of list) {
      if (!deadUrls.has(r.url) && !candidates.some(c => c.url === r.url)) {
        candidates.push(r);
      }
    }
  }
  
  if (candidates.length > 0) {
    const sp = spResults.status === "fulfilled" ? spResults.value : null;
    const first = candidates[0];
    preExtractStream(first.url).catch(() => {});
    return { 
      ...first, 
      thumbnail: thumbnail ?? (Array.isArray(sp) ? sp[0]?.thumbnail : sp?.thumbnail) ?? first.thumbnail 
    };
  }
  
  return null;
}

async function searchVideo(query) {
  const sp = YT_API_KEY ? null : await searchSpotify(query);
  return searchVideoWithFallback(query, sp?.thumbnail ?? null);
}

// ─── DEAD URL MARKER ──────────────────────────────
function markDead(url) {
  if (!url) return;
  deadUrls.add(url);
  for (const [key, val] of Object.entries(cache.toJSON())) {
    if (val.url === url) { cache.delete(key); saveCache(); }
  }
  streamCache.delete(url);
}

// ─── PREFETCH SYSTEM ──────────────────────────────
const _prefetching = new Set();
const _prefetchQueue = [];
let _prefetchWorking = false;

async function processPrefetchQueue() {
  if (_prefetchWorking || _prefetchQueue.length === 0) return;
  _prefetchWorking = true;
  
  while (_prefetchQueue.length > 0) {
    const query = _prefetchQueue.shift();
    const key = query.toLowerCase().trim();
    
    if (_prefetching.has(key)) continue;
    
    const hit = cache.get(key);
    if (hit) { 
      preExtractStream(hit.url).catch(() => {}); 
      continue;
    }
    
    _prefetching.add(key);
    try {
      const result = await searchVideo(query);
      if (result) { cache.set(key, result); saveCache(); }
    } catch {} finally { _prefetching.delete(key); }
  }
  
  _prefetchWorking = false;
}

async function prefetch(query) {
  const key = query.toLowerCase().trim();
  const hit = cache.get(key);
  if (hit) { 
    preExtractStream(hit.url).catch(() => {}); 
    return; 
  }
  _prefetchQueue.push(query);
  processPrefetchQueue().catch(() => {});
}

// ─── MAIN RESOLVER ───────────────────────────────
async function resolve(input) {
  const trimmed = input.trim();
  const type = detectType(trimmed);

  if (type === "yt-playlist") {
    const pl = await ytPlaylistFull(trimmed, PLAYLIST_LIMIT);
    if (pl?.urls?.length) {
      pl.urls.slice(0, 5).forEach(u => preExtractStream(u).catch(() => {}));
      return { type: "yt-playlist-limited", ...pl, count: pl.urls.length };
    }
    return { type: "playlist", url: trimmed };
  }

  if (type === "spotify-playlist") {
    const info = extractSpotifyPlaylistId(trimmed);
    if (info) {
      const pl = await spotifyPlaylistFull(info.id, info.kind, PLAYLIST_LIMIT);
      if (pl?.tracks?.length) return { type: "spotify-playlist-limited", ...pl, count: pl.tracks.length };
    }
    return { type: "playlist", url: trimmed };
  }

  if (type === "spotify-track") {
    const trackId = trimmed.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?track\/([A-Za-z0-9]+)/)?.[1];
    if (trackId) {
      const sp = await getSpotifyTrack(trackId);
      if (sp) {
        const results = YT_API_KEY ? await ytApiSearch(sp.name, 5) : await ytdlpSearch(sp.name, 5);
        const list = Array.isArray(results) ? results : (results ? [results] : []);
        for (const yt of list) {
          if (!deadUrls.has(yt.url)) {
            const entry = { url: yt.url, name: sp.name, thumbnail: sp.thumbnail ?? yt.thumbnail };
            cache.set(sp.name.toLowerCase(), entry);
            saveCache();
            preExtractStream(yt.url).catch(() => {});
            return { type: "single", ...entry };
          }
        }
      }
      return { type: "single", url: trimmed };
    }
    return null;
  }

  if (type === "yt-video" || type === "url") {
    preExtractStream(trimmed).catch(() => {});
    return { type: "single", url: trimmed };
  }

  // Text search
  const key = trimmed.toLowerCase();
  let hit = cache.get(key);
  if (hit && !deadUrls.has(hit.url)) {
    console.log(`  ⚡ Cache hit: "${trimmed}"`);
    preExtractStream(hit.url).catch(() => {});
    return { type: "single", url: hit.url, name: hit.name, thumbnail: hit.thumbnail };
  }

  // Fuzzy search
  if (!hit) {
    const fuzzyResults = cache.searchFuzzy(key, 0.65);
    if (fuzzyResults.length > 0) {
      const best = fuzzyResults[0];
      if (!deadUrls.has(best.entry.url)) {
        console.log(`  ⚡ Fuzzy cache hit (${(best.score * 100).toFixed(0)}%): "${trimmed}" → "${best.key}"`);
        preExtractStream(best.entry.url).catch(() => {});
        return { type: "single", url: best.entry.url, name: best.entry.name, thumbnail: best.entry.thumbnail };
      }
    }
  }

  const result = await searchVideo(trimmed);
  if (!result) return null;

  cache.set(key, result);
  saveCache();
  console.log(`  ✓ [${YT_API_KEY ? "YT API" : "yt-dlp"}] "${trimmed}" → ${result.name}`);
  return { type: "single", ...result };
}

module.exports = { resolve, detectType, prefetch, markDead, PLAYLIST_LIMIT };
