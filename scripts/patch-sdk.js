#!/usr/bin/env node
/**
 * Patches @varity-labs/sdk to fix broken orchestration module re-exports.
 *
 * The SDK's dist/index.js re-exports `Orchestrator` and `orchestrator` from
 * `./orchestration`, but the orchestration module uses CommonJS while the
 * package is declared as "type": "module". This causes webpack to fail with
 * "module has no exports" errors.
 *
 * This patch comments out the broken re-exports since they are not used
 * by the application (only `db` is imported from the SDK).
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findSdkIndex() {
  // Find the SDK dist/index.js in node_modules
  const candidates = [
    path.join(__dirname, '..', 'node_modules', '@varity-labs', 'sdk', 'dist', 'index.js'),
  ];

  // Also check pnpm store
  const pnpmDir = path.join(__dirname, '..', 'node_modules', '.pnpm');
  if (fs.existsSync(pnpmDir)) {
    try {
      const result = execSync(
        `find "${pnpmDir}" -path "*/@varity-labs/sdk/dist/index.js" -not -path "*/orchestration/*"`,
        { encoding: 'utf-8' }
      ).trim();
      if (result) {
        result.split('\n').forEach(p => candidates.push(p));
      }
    } catch {}
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

const sdkIndex = findSdkIndex();
if (!sdkIndex) {
  console.log('[patch-sdk] SDK not found, skipping patch.');
  process.exit(0);
}

let content = fs.readFileSync(sdkIndex, 'utf-8');
if (content.includes('// PATCHED:')) {
  console.log('[patch-sdk] Already patched, skipping.');
  process.exit(0);
}

const lines = content.split('\n');
const patchedLines = lines.map(line => {
  if (line.includes('Orchestrator') && line.includes('orchestration')) {
    return '// PATCHED: ' + line;
  }
  if (line.includes('orchestrator') && line.includes('orchestration') && !line.includes('Orchestrator')) {
    return '// PATCHED: ' + line;
  }
  return line;
});

fs.writeFileSync(sdkIndex, patchedLines.join('\n'));
console.log('[patch-sdk] Successfully patched @varity-labs/sdk orchestration exports.');
