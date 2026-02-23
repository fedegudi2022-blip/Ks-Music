#!/usr/bin/env node

/**
 * Pre-Deploy Automated Checker
 * 
 * Este script verifica automáticamente que todo esté listo
 * antes de deployar a Render o cualquier host en la nube.
 * 
 * Uso: node pre-deploy-check.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}=== ${msg} ===${colors.reset}\n`),
};

let checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

// Helper function to run commands safely
function runCommand(cmd, silent = true) {
  try {
    const result = execSync(cmd, {
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit',
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 1. Verificar que .env existe
function checkEnvFile() {
  log.header('📋 Environment Variables');
  
  const envExists = fs.existsSync('.env');
  if (!envExists) {
    log.error('.env file not found');
    checks.failed++;
    return;
  }
  log.success('.env file exists');
  checks.passed++;

  // Check critical values
  const envContent = fs.readFileSync('.env', 'utf-8');
  const criticalVars = ['DISCORD_TOKEN', 'SPOTIFY_CLIENT_ID', 'YOUTUBE_API_KEY'];
  
  criticalVars.forEach(varName => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=undefined`)) {
      log.success(`${varName} configured`);
      checks.passed++;
    } else {
      log.error(`${varName} missing or undefined`);
      checks.failed++;
    }
  });
}

// 2. Verificar que .env no está en git
function checkGitIgnore() {
  log.header('🔒 Security');
  
  const result = runCommand('git check-ignore .env');
  if (result.success) {
    log.success('.env properly ignored in git');
    checks.passed++;
  } else {
    log.error('.env is NOT ignored (will expose secrets!)');
    checks.failed++;
  }

  // Check if .env is in git history
  const historyResult = runCommand('git log --all --name-only --pretty=format: | grep -i "\\.env"', false);
  if (!historyResult.success || historyResult.output === '') {
    log.success('No .env files in git history');
    checks.passed++;
  } else {
    log.warn('.env may have been committed in the past');
    checks.warnings++;
  }

  // Check node_modules in gitignore
  const nmResult = runCommand('grep "node_modules" .gitignore');
  if (nmResult.success) {
    log.success('node_modules properly ignored');
    checks.passed++;
  } else {
    log.error('node_modules NOT in .gitignore');
    checks.failed++;
  }
}

// 3. Verificar packages instalados
function checkDependencies() {
  log.header('📦 Dependencies');

  if (!fs.existsSync('node_modules')) {
    log.warn('node_modules not found - running npm install');
    runCommand('npm install', false);
  }

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const requiredDeps = ['discord.js', 'distube', 'dotenv'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      log.success(`${dep} v${packageJson.dependencies[dep]} installed`);
      checks.passed++;
    } else {
      log.error(`${dep} not found in package.json`);
      checks.failed++;
    }
  });

  // npm audit
  log.info('Running npm audit...');
  const auditResult = runCommand('npm audit --json');
  if (auditResult.success) {
    try {
      const auditData = JSON.parse(auditResult.output);
      const vulnerabilities = auditData.metadata?.vulnerabilities?.total || 0;
      if (vulnerabilities === 0) {
        log.success('No security vulnerabilities');
        checks.passed++;
      } else {
        log.warn(`${vulnerabilities} vulnerabilities found`);
        checks.warnings++;
      }
    } catch (e) {
      log.info('npm audit check skipped');
    }
  }
}

// 4. Verificar archivo de configuración necesarios
function checkRequiredFiles() {
  log.header('📁 Required Files');

  const requiredFiles = [
    'src/index.js',
    'src/resolver.js',
    'launcher.js',
    'package.json',
    'README.md',
    '.env',
    '.gitignore',
  ];

  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log.success(`${file} exists`);
      checks.passed++;
    } else {
      log.error(`${file} missing`);
      checks.failed++;
    }
  });

  // Check infrastructure files
  log.info('Infrastructure files:');
  const infraFiles = ['Dockerfile', 'docker-compose.yml', 'shell.nix', 'flake.nix', 'render.yaml'];
  infraFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log.success(`${file} prepared`);
      checks.passed++;
    } else {
      log.warn(`${file} not found (optional but recommended)`);
      checks.warnings++;
    }
  });
}

// 5. Verificar Git status
function checkGitStatus() {
  log.header('🔀 Git Status');

  // Check branch
  const branchResult = runCommand('git rev-parse --abbrev-ref HEAD');
  const branch = branchResult.output || 'unknown';
  log.info(`Current branch: ${branch}`);

  // Check for uncommitted changes
  const statusResult = runCommand('git status --porcelain');
  const hasChanges = statusResult.output.length > 0;
  
  if (hasChanges) {
    log.warn('Uncommitted changes detected:');
    statusResult.output.split('\n').forEach(line => {
      if (line) console.log(`  ${line}`);
    });
    checks.warnings++;
  } else {
    log.success('Working tree clean');
    checks.passed++;
  }

  // Check for commits
  const logResult = runCommand('git log --oneline -1');
  if (logResult.success) {
    log.success(`Last commit: ${logResult.output}`);
    checks.passed++;
  } else {
    log.error('No git commits found');
    checks.failed++;
  }
}

// 6. Health check del bot (si está corriendo)
function checkBotHealth() {
  log.header('🤖 Bot Health');

  // No intentamos iniciar el bot automáticamente para no interferir
  log.info('To check bot health:');
  console.log('  1. In another terminal: node launcher.js');
  console.log('  2. Then run: curl http://localhost:3000/health');
  log.info('(Skipping automatic check to avoid interfering with current processes)');
}

// 7. Resumen final
function printSummary() {
  log.header('📊 Summary');

  const total = checks.passed + checks.failed;
  const percentage = total > 0 ? Math.round((checks.passed / total) * 100) : 0;

  console.log(`
${colors.green}✓ Passed: ${checks.passed}${colors.reset}
${colors.red}✗ Failed: ${checks.failed}${colors.reset}
${colors.yellow}⚠ Warnings: ${checks.warnings}${colors.reset}

Success Rate: ${percentage}%
  `);

  if (checks.failed === 0 && checks.warnings === 0) {
    log.success('🎉 All checks passed! Ready to deploy.');
    console.log(`
Next steps:
  1. git push origin main
  2. Go to render.com → New Web Service
  3. Connect GitHub repo
  4. Set environment variables
  5. Deploy!
    `);
    process.exit(0);
  } else if (checks.failed === 0) {
    log.warn('⚠️  Some warnings found. Review above before deploying.');
    process.exit(1);
  } else {
    log.error('❌ Fix errors above before deploying.');
    process.exit(1);
  }
}

// Run all checks
async function runAllChecks() {
  console.log(`
${colors.bold}${colors.blue}🚀 Pre-Deploy Automated Checker${colors.reset}
${colors.bold}Kp-Music Discord Bot${colors.reset}
  `);

  try {
    checkEnvFile();
    checkGitIgnore();
    checkDependencies();
    checkRequiredFiles();
    checkGitStatus();
    checkBotHealth();
    printSummary();
  } catch (error) {
    log.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Run
runAllChecks();
