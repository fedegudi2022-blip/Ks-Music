# 🔧 Bot Offline en Render - Diagnóstico y Solución

El deploy fue exitoso pero el bot está offline. Aquí está cómo arreglarlo.

---

## 🤔 ¿Por qué el bot está offline?

Posibles causas (en orden de probabilidad):

1. **❌ DISCORD_TOKEN no está configurado en Render** (80% probable)
2. ❌ DISCORD_TOKEN es inválido o expirado (15% probable)
3. ❌ Bot sin permisos en el servidor (5% probable)

---

## ✅ Solución: Verificar y Configurar Variables

### Paso 1: Ir a Render Dashboard

1. Ve a https://dashboard.render.com
2. Selecciona tu servicio `kp-music-bot`
3. Ve a la pestaña **Environment**

### Paso 2: Verificar DISCORD_TOKEN

Deberías ver una variable `DISCORD_TOKEN` configurada.

**Si NO está:**
1. Click en **Add Environment Variable**
2. **Key:** `DISCORD_TOKEN`
3. **Value:** Tu token de Discord (ver abajo cómo obtenerlo)
4. Save

**Si ESTÁ pero está vacío o incompleto:**
1. Edítalo
2. Pon el token correcto
3. Save

---

## 🎫 ¿Cómo obtener tu token de Discord?

### 1. En Discord Developer Portal

1. Ve a https://discord.com/developers/applications
2. Selecciona tu aplicación (bot)
3. Ve a **Bot** en el panel izquierdo
4. Busca **TOKEN** y haz click en **Reset Token**
5. Click en **Copy** (copia el token completo)

**⚠️ IMPORTANTE:**
- Nunca compartas este token publicamente
- Nunca lo comitees a git (.env está ignorado, está bien)
- Si lo exposiste, regenera inmediatamente

### 2. Pegar en Render

En Render Dashboard → Environment → DISCORD_TOKEN → Value

---

## 🔄 Trigger de Redeploy

Después de agregar/actualizar el token:

**Opción A: Manual (Rápido)**
1. En Render Dashboard → Click en **Manual Deploy** o **Deploy latest commit**

**Opción B: Automático**
```bash
# Hacer un commit vacío en local
git commit --allow-empty -m "Trigger Render redeploy with token configured"
git push origin main
```

---

## 📊 Verificar el Fix

Después del redeploy, en Render → Logs verás:

```
✓ DISCORD_TOKEN: MTQ3NDQzMTg5ND...
✓ PREFIX: !

🤖 Intentando conectar a Discord...

✓ BotName#1234 | Prefijo: ! | 13 comandos

🌐 Health check server listening on port 3000
✅ Bot ready for requests
```

**Si aún hay error, verás:**
```
❌ ERROR: DISCORD_TOKEN no está configurado
```

o

```
❌ Error al conectar a Discord: Unauthorized
```

---

## 🐛 Debugging Avanzado

Si el token está configurado pero sigue sin funcionar:

### Verificar Health Check

```bash
curl https://ks-music.onrender.com/health
```

Deberías obtener:
```json
{
  "status": "ok",
  "bot": "ready",
  "uptime": 120.234,
  "memory": {...}
}
```

### Ver Logs Completos

En Render Dashboard → **Logs** (abajo a la derecha)

Busca por:
- `DISCORD_TOKEN` - Verifica que aparezca
- `Intentando conectar` - Verifica que se intente conectar
- `Error` - Busca mensajes de error

### Reiniciar el Servicio

En Render Dashboard → **More** (3 puntos) → **Restart Service**

---

## ✅ Checklist Rápido

- [ ] Tengo mi DISCORD_TOKEN válido
- [ ] DISCORD_TOKEN está en Render Environment
- [ ] He hecho redeploy después de agregar el token
- [ ] Los logs muestran `Intentando conectar a Discord`
- [ ] El bot aparece con estado Online en Discord

---

## 💡 Consejos

1. **Token inválido:** Si ves `Unauthorized`, el token es incorrecto
   - Regenera en Discord Developer Portal
   - Copia el token completo (no le falte nada)

2. **Bot sin permisos:** Si ves `Forbidden`, el bot no tiene permisos
   - Ve a Discord Server → Server Settings → Roles
   - Dale permisos de **Send Messages**, **Manage Messages**, **Connect to Voice**, **Speak**

3. **Problema de red:** Verifica tu conexión a Internet
   - A veces Render tarda en conectarse

---

## 🆘 Si aún no funciona

1. Capturas la parte del log que dice **ERROR**
2. Verifica que el token sea exacto (sin espacios extra)
3. Intenta un redeploy manual
4. Reinicia el servicio (Render → More → Restart)

---

**Nota:** Después de estos cambios, el deploy automático debería reconectar al bot a Discord correctamente.
