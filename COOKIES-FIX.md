# 🍪 Solución de Error de YouTube - Cookies Expiradas

## El Problema

```
✗ No pude reproducir eso: Error: ERROR: [youtube] VIDEO_ID: Sign in to confirm you're not a bot
Use --cookies-from-browser or --cookies for the authentication.
```

**Causa:** Las cookies de autenticación de YouTube en tu archivo `cookies.txt` han **expirado** (son de 2024-2025).

---

## ✅ Solución Rápida (5 minutos)

### Opción 1: Script Windows (Más Fácil)

Simplemente ejecuta el archivo `update-cookies.bat` que está en la carpeta principal:

```bash
update-cookies.bat
```

Luego sigue las instrucciones que aparecerán en la pantalla.

---

### Opción 2: Manual con Extensión (Recomendado)

#### Paso 1: Instalar extensión
- **Microsoft Edge**: [Get cookies.txt - Edge Addon](https://microsoftedge.microsoft.com/addons/detail/get-cookiestxt/jffbegmjkchnapijdeppfbpoghelphlg)
- **Chrome**: [Get cookies.txt Chrome Web Store](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndcbgesaakmgiskokigen0cgodl)

#### Paso 2: Exportar cookies
1. Abre el navegador y ve a `https://youtube.com`
2. **Asegúrate de estar LOGUEADO** en tu cuenta
3. Haz clic en la extensión → "Export" o "Export Cookies"
4. Esto copia las cookies al portapapeles

#### Paso 3: Actualizar archivo
1. Abre este archivo en tu editor (`Ctrl+A` → `Ctrl+V`):
   ```
   cookies.txt
   ```
2. Pega las cookies que copiaste (**Ctrl+V**)
3. Guarda el archivo (**Ctrl+S**)

#### Paso 4: Reinicia el bot
Las nuevas cookies estarán activas en el próximo reinicio.

---

### Opción 3: Línea de Comandos (Alternativa)

Si tienes **Edge o Chrome abierto con YouTube logueado**, ejecuta:

```powershell
# Para Edge
yt-dlp --cookies-from-browser edge --cookies cookies.txt https://www.youtube.com

# Para Chrome
yt-dlp --cookies-from-browser chrome --cookies cookies.txt https://www.youtube.com

# Para Firefox
yt-dlp --cookies-from-browser firefox --cookies cookies.txt https://www.youtube.com
```

Si funciona, las cookies se habrán guardado automáticamente.

---

## 🔍 Verificar que Funciona

Ejecuta el script de prueba:

```powershell
node export-cookies.js --test
```

O manualmente:

```powershell
yt-dlp --cookies cookies.txt "https://www.youtube.com/watch?v=jNQXAC9IVRw" --get-title
```

**Resultado esperado:** Debería mostrar el título del video
- ✅ Éxito: "Me at the zoo"
- ❌ Error: Las cookies aún no son válidas

---

## 📋 A Qué Estarán Expuestas las Cookies

Las cookies que exportes de YouTube **solamente contienen**:
- Tu sesión activa
- Preferencias de lenguaje/zona horaria
- Identificadores públicos

**NO incluyen:**
- Contraseña
- Información financiera
- Datos personales sensibles

Es seguro mantener estas cookies en el archivo `cookies.txt`.

---

## ⚠️ Solución de Problemas

### "ERROR: could not find chrome cookies database"

- Chrome no está instalado o no está en la ubicación estándar
- **Solución:** Usa la opción con extensión (Opción 2)

### "ERROR: Failed to decrypt with DPAPI"

- Edge tiene encriptación que yt-dlp no puede acceder
- **Solución:** Usa la opción con extensión o Firefox

### "Still getting 'Sign in to confirm' error"

- Las cookies aún están expiradas o no son válidas
- **Causas comunes:**
  - No estabas logueado cuando exportaste
  - Las cookies se exportaron incorrectamente
  - El formato no es Netscape compatible

**Solución:** Repite el proceso desde el Paso 1

---

## 📚 Recursos Adicionales

- [yt-dlp Wiki - Authentication](https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp)
- [Exporting YouTube Cookies](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)

---

## 🤖 Mejoras Implementadas en el Bot

Se han agregado **fallbacks automáticos** en el código:

1. **retry-sin-cookies**: Si las cookies fallan, el bot automáticamente intenta sin ellas
2. **mejor-logging**: Ahora verás advertencias claras si las cookies expiran
3. **extracción-paralela**: Búsquedas YouTube API + yt-dlp simultáneamente

**Resultado:** Aunque tengas cookies expiradas, el bot intentará reproducer sin ellas como fallback.

---

**¿Problemas? Revisa `export-cookies.js` ejecutando:**

```powershell
node export-cookies.js
```
