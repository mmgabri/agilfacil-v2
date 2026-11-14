/**
 * Gera as informações de versão do frontend antes de `npm start` / `npm run build`.
 *
 *   public/version.json   → servido estaticamente: o que está PUBLICADO
 *                           (ex.: curl https://agilfacil.com.br/version.json)
 *   src/buildInfo.json    → embutido no bundle: o que o NAVEGADOR está rodando
 *                           (página /version)
 *
 * Versão = "<version do package.json>+<nº do build>", onde o nº do build é a
 * quantidade de commits do HEAD — sobe sozinho a cada commit publicado.
 * `dirty: true` indica build gerado com alterações não commitadas.
 *
 * Os dois arquivos são gerados (não versionados — ver .gitignore).
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));

const git = (cmd) => {
  try {
    return execSync(`git ${cmd}`, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return null;
  }
};

const buildNumber = git('rev-list --count HEAD');
const commit = git('rev-parse --short HEAD');
const status = git('status --porcelain');

const info = {
  version: buildNumber ? `${pkg.version}+${buildNumber}` : pkg.version,
  commit: commit || 'desconhecido',
  branch: git('rev-parse --abbrev-ref HEAD') || 'desconhecido',
  commitDate: git('log -1 --format=%cI') || null,
  dirty: status === null ? null : status.length > 0,
  builtAt: new Date().toISOString(),
  mode: process.env.npm_lifecycle_event === 'prestart' ? 'development' : 'production',
};

const json = JSON.stringify(info, null, 2) + '\n';
fs.writeFileSync(path.join(root, 'public', 'version.json'), json);
fs.writeFileSync(path.join(root, 'src', 'buildInfo.json'), json);

console.log(`[build-info] ${info.version} (${info.commit}${info.dirty ? ', dirty' : ''}) — ${info.builtAt}`);
