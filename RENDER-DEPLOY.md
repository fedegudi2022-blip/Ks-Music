# Deploy en Render - Guía Rápida

## 1. Variables de Entorno Requeridas

Configurat estas variables en el dashboard de Render:

### Obligatorias
- **DISCORD_TOKEN**: Tu token del bot Discord

### Recomendadas (para YouTube)
- **YT_COOKIES**: Las cookies de YouTube en formato base64 o texto plano

### Opcionales
- **SPOTIFY_CLIENT_ID**: ID de cliente Spotify
- **SPOTIFY_CLIENT_SECRET**: Secret de Spotify
- **YOUTUBE_API_KEY**: API Key de YouTube

## 2. Obtener Cookies de YouTube

### Opción A: Con Extensión (Recomendado)

1. Instala "Get cookies.txt":
   - Chrome: https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndcbgesaakmgiskokigen0cgodl
   - Edge: https://microsoftedge.microsoft.com/addons/detail/get-cookiestxt/

2. Ve a https://youtube.com (DEBES ESTAR LOGUEADO)

3. Haz clic en la extensión y exporta las cookies

4. Copia el contenido completo

5. En Render:
   - Pega las cookies en `YT_COOKIES`
   - El bot automáticamente las procesará

### Opción B: Encode en Base64

Si prefieres pasar las cookies codificadas:

```bash
# Linux/Mac
cat cookies.txt | base64 | pbcopy

# Windows PowerShell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("cookies.txt")) | Set-Clipboard
```

Luego pega en `YT_COOKIES`.

## 3. Deploy

```bash
git push origin main
```

O desde Render dashboard → Deployments → Deploy Latest Commit

## 4. HealthCheck

El bot responde a:
- `GET /health` - Estado del bot (JSON)
- `GET /stats` - Estadísticas
- `GET /` - Página de inicio

Render automáticamente verifica `/health` cada 30 segundos.

## 5. Verificar Logs

En Render dashboard → Logs

Deberías ver:
```
✓ Bot conectado a Discord
✓ Spotify listo (si hay credenciales)
✓ yt-dlp encontrado
🌐 Health check server listening on port 3000
```

## 6. Troubleshooting

### Bot no se conecta
- Verifica DISCORD_TOKEN
- Usa token con permiso SEND_MESSAGES

### No encuentra canciones YouTube
- Configura YT_COOKIES
- O configura YOUTUBE_API_KEY

### "Sign in to confirm you're not a bot"
- Actualiza YT_COOKIES
- Las cookies de YouTube expiran cada ~60 días
- Repite el proceso de obtener cookies

## 7. Actualizar Cookies Frecuentemente

Las cookies de YouTube expiran aprox cada 2 meses.

Para actualizar sin redeployar:
1. Exporta nuevas cookies (Ver Opción A)
2. En Render dashboard → Settings → Environment
3. Actualiza YT_COOKIES
4. Render automáticamente reinicia el bot con las nuevas cookies
