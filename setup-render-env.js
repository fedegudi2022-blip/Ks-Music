#!/usr/bin/env node

/**
 * Render Environment Variables Setup Helper
 * 
 * Este script te ayuda a configurar las variables de entorno en Render.com
 * 
 * Uso: node setup-render-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

console.log(`
${colors.bold}${colors.blue}
╔════════════════════════════════════════════════════════════════╗
║        🚀 Render.com Environment Variables Setup Helper        ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}
`);

console.log(`${colors.yellow}⚠️  IMPORTANTE:${colors.reset}
Este script te mostrará qué variables necesitas configurar en:
→ https://dashboard.render.com

${colors.cyan}Pasos:${colors.reset}
1. Ve a tu servicio 'kp-music-bot' en el dashboard
2. Haz clic en "Environment" (arriba a la derecha)
3. Añade las variables que ves abajo con "Add Environment Variable"
4. Re-deploy el servicio

\n`);

// Read .env file
const envPath = path.join(__dirname, '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && key.trim()) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
}

// Define required and optional variables
const requiredVars = [
  { key: 'DISCORD_TOKEN', description: 'Token del bot Discord' },
  { key: 'CLIENT_ID', description: 'Discord Client ID' },
  { key: 'CLIENT_SECRET', description: 'Discord Client Secret' },
];

const optionalVars = [
  { key: 'SPOTIFY_CLIENT_ID', description: 'Spotify Client ID (opcional)' },
  { key: 'SPOTIFY_CLIENT_SECRET', description: 'Spotify Client Secret (opcional)' },
  { key: 'YOUTUBE_API_KEY', description: 'YouTube API Key (opcional)' },
  { key: 'USER_ID', description: 'Tu Discord User ID (opcional)' },
];

console.log(`${colors.bold}${colors.green}📋 VARIABLES REQUERIDAS${colors.reset}\n`);

requiredVars.forEach((varDef) => {
  const value = envVars[varDef.key];
  const status = value ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
  const displayValue = value ? maskToken(value) : '(no configurado)';
  
  console.log(`${status} ${varDef.key.padEnd(25)} = ${displayValue}`);
  console.log(`   → ${varDef.description}\n`);
});

console.log(`\n${colors.bold}${colors.cyan}🎵 VARIABLES OPCIONALES${colors.reset}\n`);

optionalVars.forEach((varDef) => {
  const value = envVars[varDef.key];
  const status = value ? `${colors.green}✓${colors.reset}` : `${colors.yellow}○${colors.reset}`;
  const displayValue = value ? maskToken(value) : '(no configurado)';
  
  console.log(`${status} ${varDef.key.padEnd(25)} = ${displayValue}`);
  console.log(`   → ${varDef.description}\n`);
});

// Show copy-paste format
console.log(`\n${colors.bold}${colors.blue}📋 VARIABLES PARA COPIAR/PEGAR${colors.reset}\n`);
console.log(`${colors.cyan}Copia esta tabla en https://dashboard.render.com${colors.reset}\n`);

const allVars = [...requiredVars, ...optionalVars];
console.log('Key                      | Value');
console.log('-------------------------|' + '-'.repeat(40));

allVars.forEach((varDef) => {
  const value = envVars[varDef.key] || '';
  console.log(`${varDef.key.padEnd(24)} | ${value}`);
});

// Summary
console.log(`\n${colors.bold}${colors.blue}📌 PRÓXIMOS PASOS:${colors.reset}\n`);

console.log(`1. ${colors.bold}Ve a Render Dashboard${colors.reset}`);
console.log(`   → https://dashboard.render.com`);
console.log(`   → Selecciona tu servicio 'kp-music-bot'\n`);

console.log(`2. ${colors.bold}Abre Environment Variables${colors.reset}`);
console.log(`   → Menú superior derecho → "Environment"\n`);

console.log(`3. ${colors.bold}Añade Variables (REQUERIDAS primero)${colors.reset}`);
console.log(`   → Haz clic en "Add Environment Variable"`);
console.log(`   → Copia cada Key/Value de arriba\n`);

console.log(`4. ${colors.bold}Guarda y Re-Deploy${colors.reset}`);
console.log(`   → Haz clic en "Deploy Latest Commit"\n`);

console.log(`5. ${colors.bold}Verifica en Logs${colors.reset}`);
console.log(`   → Espera 2-3 minutos`);
console.log(`   → Abre "Logs" y busca: ✓ DISCORD_TOKEN\n`);

// Security note
console.log(`\n${colors.red}⚠️  SEGURIDAD IMPORTANTE:${colors.reset}`);
console.log(`Tu .env local contiene secretos expuestos.`);
console.log(`Considera regenerar estos tokens después del deployment:\n`);
console.log(`  • Discord Token: Discord Developers → Bot → "Reset Token"`);
console.log(`  • Spotify Creds: Spotify Dev Dashboard`);
console.log(`  • YouTube API: Google Cloud Console\n`);

console.log(`${colors.green}✅ ¡Estás listo para deployar a Render!${colors.reset}\n`);

rl.close();

/**
 * Mask sensitive tokens for display
 */
function maskToken(token) {
  if (!token || token.length < 20) {
    return '***' + token.substring(token.length - 4);
  }
  return token.substring(0, 10) + '…' + token.substring(token.length - 4);
}
