# 🎵 Kp-Music Bot By Kepersonas

<div align="center">

[![Discord.js](https://img.shields.io/badge/Discord.js-v14-blue?style=flat-square&logo=discord)](https://discord.js.org/)
[![DisTube](https://img.shields.io/badge/DisTube-v5-green?style=flat-square)](https://github.com/skick1337/DisTube)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**🚀 Bot de música Discord ultra-rápido con búsquedas 5-10x más veloces**

[Características](#características) • [Instalación](#instalación) • [Configuración](#configuración) • [Comandos](#comandos)

</div>

---

## ✨ Características

- ⚡ **Súper Rápido**: Búsquedas optimizadas 5-10x más veloces gracias a:
  - Cache LRU inteligente con 5000 entradas y TTL de 7 días
  - Fuzzy matching para correcciones automáticas de typos
  - Búsquedas paralelas (YouTube API + yt-dlp + Spotify simultáneamente)

- 🎯 **Multi-Fuente**: Reproduce desde:
  - YouTube (videos, playlists)
  - Spotify (tracks, playlists, albums)
  - URLs directas
  - Búsquedas por texto

- 🛡️ **Production-Ready**:
  - Manejo automático de errores con auto-retry
  - Supresión completa de warnings
  - Estable 24/7 con garbage collection automático
  - Anti-crash handlers globales

- 🎮 **Comandos Completos**:
  - Reproducción: `!play`, `!pause`, `!skip`, `!stop`
  - Control: `!volume`, `!loop`, `!shuffle`
  - Info: `!queue`, `!nowplaying`, `!history`
  - Ayuda: `!help`, `!voteskip`

---

## 🚀 Instalación

### Requisitos
- **Node.js 18+** (recomendado: 20 LTS)
- **yt-dlp** (incluido en este repositorio para Windows)
- **FFmpeg** (instalado automáticamente si no existe)

### Pasos

1. **Clona el repositorio**:
```bash
git clone https://github.com/tuusuario/Kp-Music.git
cd Kp-Music
```

2. **Instala dependencias**:
```bash
npm install
```

3. **Configura las variables de entorno**:
```bash
cp .env.example .env
```

4. **Edita `.env` con tus credenciales**:
```env
DISCORD_TOKEN=tu_token_del_bot
YOUTUBE_API_KEY=tu_api_key_de_youtube (opcional pero recomendado)
SPOTIFY_CLIENT_ID=tu_spotify_client_id
SPOTIFY_CLIENT_SECRET=tu_spotify_client_secret
PREFIX=!
```

5. **Inicia el bot**:
```bash
npm start
```

---

## ⚙️ Configuración

### Variables de Entorno

| Variable | Requerido | Descripción |
|----------|-----------|-------------|
| `DISCORD_TOKEN` | ✅ | Token del bot Discord |
| `YOUTUBE_API_KEY` | ⭕ | API Key de YouTube (mejora búsquedas) |
| `SPOTIFY_CLIENT_ID` | ⭕ | ID de cliente Spotify |
| `SPOTIFY_CLIENT_SECRET` | ⭕ | Secret de Spotify |
| `PREFIX` | ❌ | Prefijo del bot (default: `!`) |
| `PLAYLIST_LIMIT` | ❌ | Máx canciones por playlist (default: `30`) |

> ✅ = Requerido | ⭕ = Recomendado | ❌ = Opcional

### Obtener Credenciales

**Discord Bot Token**:
1. Ve a [Discord Developers](https://discord.com/developers/applications)
2. Crea una nueva aplicación
3. En la sección "Bot", haz clic en "Add Bot"
4. Copia el token

**YouTube API Key**:
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto
3. Habilita "YouTube Data API v3"
4. Crea una credencial de API Key
5. Copia la clave

**Spotify Credentials**:
1. Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crea una nueva aplicación
3. Copia "Client ID" y "Client Secret"

---

## 📖 Comandos

### Reproducción

| Comando | Aliases | Uso |
|---------|---------|-----|
| `!play <query>` | `!p` | Busca y reproduce una canción |
| `!pause` | `!resume` | Pausa/reanuda la reproducción |
| `!skip` | `!s`, `!next` | Salta a la siguiente canción |
| `!stop` | `!dc`, `!leave` | Para la música y abandona el canal |
| `!stop` | `!dc`, `!leave` | Para la música y abandona el canal |

### Control

| Comando | Aliases | Uso |
|---------|---------|-----|
| `!volume <0-100>` | `!vol`, `!v` | Ajusta el volumen |
| `!loop` | `!repeat`, `!r` | Alterna modo: off → 1 canción → cola |
| `!shuffle` | `!mix` | Mezcla la cola |
| `!playnext <query>` | `!pn`, `!insertar` | Añade canción como siguiente |

### Información

| Comando | Aliases | Uso |
|---------|---------|-----|
| `!queue` | `!q`, `!list` | Muestra la cola de canciones |
| `!nowplaying` | `!np`, `!current` | Muestra canción actual |
| `!history` | `!recent`, `!h` | Muestra últimas canciones |

### Utilidad

| Comando | Aliases | Uso |
|---------|---------|-----|
| `!voteskip` | `!vs` | Vota para saltar (50% + 1 necesario) |
| `!help` | `!h`, `!commands`, `!ayuda` | Muestra lista de comandos |

---

## 🎯 Ejemplos de Uso

```
// Reproducir una canción
!play Bohemian Rhapsody

// Reproducir desde Spotify
!play https://open.spotify.com/track/1301WleyT98MSxVHPZCA6M

// Reproducir una playlist de YouTube
!play https://www.youtube.com/playlist?list=PLxxx

// Ajustar volumen
!volume 50

// Ver la cola
!queue

// Cambiar modo de repetición
!loop

// Insertar canción como siguiente
!playnext Better Days - Macklemore
```

---

## 🔧 Desarrollo

### Scripts disponibles

```bash
# Iniciar el bot en producción
npm start

# Iniciar con hot-reload para desarrollo
npm run dev

# Iniciar limpio (sin cache)
npm run clean
```

### Estructura del Proyecto

```
Kp-Music/
├── src/
│   ├── index.js              # Bot principal
│   ├── resolver.js           # Motor de búsqueda
│   ├── patch-setTimeout.js   # Patch de timeouts
│   └── commands/
│       ├── play.js
│       ├── pause.js
│       ├── skip.js
│       └── ...otros comandos
├── launcher.js               # Entry point con warning suppression
├── .env.example              # Template de configuración
├── package.json
└── README.md
```

---

## 🐛 Troubleshooting

### El bot no inicia
1. Verifica que `.env` esté completamente configurado
2. Comprueba que tienes permisos en el guild
3. Revisa que el token sea válido

### No encuentra canciones
1. Intenta con el YouTube API Key configurado
2. Verifica que yt-dlp esté actualizado
3. Comprueba tu conexión a internet

### Problemas de audio
1. Asegúrate de tener FFmpeg instalado
2. Intenta reproducir desde otra fuente (YouTube, Spotify, etc.)
3. Verifica que tengas permiso para conectar al canal

### El bot está lento
1. Revisa `.music-cache.json` tamaño (máx 5000 entradas)
2. Intenta `npm run clean` para limpiar cache
3. Verifica CPU y memoria disponible

---

## 📊 Optimizaciones

### Cache Inteligente
- **LRU Cache**: 5000 entradas máximo
- **TTL**: 7 días por defecto
- **Frecuencia**: Prioriza canciones más usadas
- **Fuzzy Matching**: Corrección automática de typos

### Búsquedas Paralelas
- YouTube API (2.5s timeout)
- yt-dlp (12s timeout)
- Spotify (2s timeout)
- Se ejecutan simultáneamente para máxima velocidad

### Estabilidad 24/7
- Garbage collection automático cada 5 minutos
- Limpieza de cache expirado cada hora
- Anti-crash handlers globales
- Manejo automático de errores de red

---

## 📝 Logs

El bot genera logs detallados de:
- Búsquedas de canciones
- Cache hits/misses
- Errores de conexión
- Cambios de estado

```
✓ Kp-Music#5623  |  Prefijo: !  |  35 comandos

⚡ Cache: 42 entradas
⚡ Cache hit: "bohemian rhapsody"
▶ Bohemian Rhapsody - Queen [05:55]
✓ Spotify listo
✓ yt-dlp encontrado
```

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- [Discord.js](https://github.com/discordjs/discord.js) - Discord API wrapper
- [DisTube](https://github.com/skick1337/DisTube) - Audio player
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - YouTube downloader
- [Spotify API](https://developer.spotify.com/) - Music streaming

---

<div align="center">

**⭐ Si te gusta este bot, dale una estrella!**

Hecho con ❤️ por la comunidad <br/>
[⬆ volver arriba](#-kp-music-bot)

</div>
