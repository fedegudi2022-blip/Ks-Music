#!/usr/bin/env node
/**
 * export-cookies.js
 * Script para ayudarte a exportar cookies de YouTube desde navegadores
 * Necesitas instalar la extensión manualmente, pero este script te informa de todo
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                   🍪 KP-MUSIC COOKIE EXPORTER                         ║
║              Actualizar cookies de YouTube en 3 pasos                  ║
╚════════════════════════════════════════════════════════════════════════╝

📋 OPCIÓN 1: Extensión Chrome/Edge (Recomendado - 5 minutos)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Instala la extensión "Get cookies.txt":
   • Chrome: https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndcbgesaakmgiskokigen0cgodl
   • Edge: https://microsoftedge.microsoft.com/addons/detail/get-cookiestxt/jffbegmjkchnapijdeppfbpoghelphlg

2️⃣  Ve a YouTube y asegúrate de estar LOGUEADO en tu cuenta

3️⃣  Haz clic en la extensión → "Export" o "Export Cookies"

4️⃣  Abre este archivo en tu editor y PEGA el contenido:
   📁 ${path.join(process.cwd(), "cookies.txt")}

5️⃣  GUARDA el archivo (Ctrl+S)

6️⃣  El bot funcionará en el próximo reinicio ✅


📋 OPCIÓN 2: Línea de comandos (Alternativa)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Si tienes CHROME o EDGE abierto con YouTube logueado, ejecuta:

📌 Para Windows:
   yt-dlp --cookies-from-browser edge --cookies cookies.txt https://www.youtube.com

   (Si no funciona con edge, prueba: --cookies-from-browser chrome)

📌 Para Firefox:
   yt-dlp --cookies-from-browser firefox --cookies cookies.txt https://www.youtube.com


📋 OPCIÓN 3: Exportar manualmente desde navegador
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Abre DevTools (F12)
2. Ve a → Application → Cookies → youtube.com
3. Copia todos (no es práctic o, pero funciona)


═══════════════════════════════════════════════════════════════════════════

✅ ESPERAMOS A QUE ACTUALICES:

El archivo cookies.txt actual tiene cookies EXPIRADAS:
📅 Fecha: 2024-2025 (hace meses)
❌ YouTube rechaza acceso sin cookies válidas

Una vez que pegues las cookies nuevas, el bot podrá:
✓ Descargar videos protegidos
✓ Evitar el error "Sign in to confirm you're not a bot"
✓ Acceder a contenido restringido geográficamente

═══════════════════════════════════════════════════════════════════════════

⏰ TIEMPO ESTIMADO: 5 minutos

¿Necesitas más ayuda? Revisa la documentación:
📖 yt-dlp: https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp
📖 Este repo: ${path.join(process.cwd(), "README.md")}
`);

// Verificar si el archivo tiene cookies válidas
const cookiePath = path.join(process.cwd(), "cookies.txt");
if (fs.existsSync(cookiePath)) {
  try {
    const content = fs.readFileSync(cookiePath, "utf-8");
    const lines = content.split("\n").filter(l => !l.startsWith("#") && l.trim());
    console.log(`\n📊 Cookies actuales: ${lines.length} líneas válidas`);
    
    // Checker simple
    if (content.includes("1834711389") || content.includes("1787387553")) {
      console.log(`⚠️  ⚠️  Las cookies parecen EXPIRADAS (2024-2025)`);
      console.log(`    👉 NECESITAS actualizar antes de usar el bot\n`);
    }
  } catch (e) {
    console.error(`❌ Error leyendo cookies: ${e.message}`);
  }
}

// Intentar un test rápido
if (process.argv.includes("--test")) {
  console.log("\n\n🧪 Intentando test con yt-dlp...\n");
  const { execSync } = require("child_process");
  try {
    // Usar un URL público que no requiere autenticación
    const cmd = `yt-dlp --no-warnings --cookies "${cookiePath}" "https://www.youtube.com/watch?v=jNQXAC9IVRw" --get-title`;
    const result = execSync(cmd, { encoding: "utf-8", stdio: "pipe" });
    console.log(`✅ Test exitoso! Cookies válidas.\n`);
    console.log(`   Título obtenido: ${result.trim()}`);
  } catch (e) {
    console.log(`\n❌ Test fallido (esto es normal si las cookies están expiradas)\n`);
    console.log(`   ${e.message.slice(0, 100)}...`);
  }
}
