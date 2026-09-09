import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Build a fresh candidate, then consume its actual archive. Never install or publish.
const root = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
assert.equal(require('typescript/package.json').version, '5.9.3', 'Review compiler version changes explicitly');
const compiler = require.resolve('typescript/bin/tsc');
const npmCandidates = [process.env.npm_execpath,
  join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
  join(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js')];
const npm = npmCandidates.find(path => path && path.endsWith('npm-cli.js') && existsSync(path));
assert.ok(npm, 'Installed npm-cli.js required; run via npm run verify:package in Widgets. No tool will be downloaded.');
const evidence = mkdtempSync(join(tmpdir(), 'konitif-widgets-package-'));
const source = root;
const stage = join(evidence, 'stage');
mkdirSync(stage);
const manifest = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8'));
for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies', 'bundledDependencies']) {
  assert.equal(Object.keys(manifest[field] ?? {}).length, 0, `Unexpected ${field}`);
}
const selected = ['LICENSE.md', 'README.md', 'package.json', 'reference/catalog.json',
  'reference/diagrams.json', 'src/index.ts', 'src/definition.ts',
  'dist/index.js', 'dist/index.d.ts', 'dist/definition.js', 'dist/definition.d.ts'];
assert.deepEqual([...manifest.files].sort(), [...selected].sort());
for (const file of [...selected.filter(file => !file.startsWith('dist/')), 'tsconfig.build.json']) {
  mkdirSync(dirname(join(stage, file)), { recursive: true });
  cpSync(join(source, file), join(stage, file));
}
const env = { ...process.env, NODE_OPTIONS: '', NODE_PATH: '', npm_config_cache: join(evidence, 'cache'),
  npm_config_offline: 'true', npm_config_audit: 'false', npm_config_fund: 'false' };
const run = (command, args, cwd = stage) => execFileSync(command, args, { cwd, env, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
run(process.execPath, [compiler, '-p', 'tsconfig.build.json']);
const packed = JSON.parse(run(process.execPath, [npm, 'pack', '--offline', '--ignore-scripts', '--json']))[0];
assert.deepEqual(packed.files.map(file => file.path).sort(), [...selected].sort());
const archive = join(stage, packed.filename);
assert.equal(`sha512-${createHash('sha512').update(readFileSync(archive)).digest('base64')}`, packed.integrity);
const consumer = join(evidence, 'consumer');
const installed = join(consumer, 'node_modules/@konitif/widgets');
mkdirSync(installed, { recursive: true });
run('tar', ['-xzf', archive, '-C', installed, '--strip-components=1']);
for (const file of ['consumer.mjs', 'consumer.mts']) cpSync(join(root, 'tests', file), join(consumer, file));
const output = run(process.execPath, ['consumer.mjs'], consumer);
assert.match(output, /Widgets ESM contracts passed/);
run(process.execPath, [compiler, 'consumer.mts', '--noEmit', '--strict', '--target', 'ES2022',
  '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--lib', 'ES2022',
  '--typeRoots', join(consumer, 'node_modules/@types')], consumer);
console.log(JSON.stringify({ consumer: 'passed (ESM and TypeScript NodeNext)', version: manifest.version,
  integrity: packed.integrity, bytes: packed.size, files: packed.files.length, evidence }));
