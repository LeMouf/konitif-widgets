import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertReleaseInputs } from '../scripts/check-release.mjs';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const json = file => JSON.parse(read(file));

test('lock admits only the approved compiler, not a host dependency', () => {
  const manifest = json('package.json');
  const lock = json('package-lock.json');
  assert.deepEqual(manifest.dependencies ?? {}, {});
  assert.deepEqual(manifest.devDependencies, { typescript: '5.9.3' });
  assert.deepEqual(Object.keys(lock.packages).sort(), ['', 'node_modules/typescript']);
  assert.deepEqual(lock.packages[''].devDependencies, manifest.devDependencies);
  assert.equal(lock.packages['node_modules/typescript'].version, '5.9.3');
  assert.equal(lock.packages['node_modules/typescript'].integrity,
    'sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==');
});

test('CI validates without publication permissions or automatic runtime installation', () => {
  const workflow = read('.github/workflows/ci.yml');
  assert.match(workflow, /contents: read/);
  for (const command of ['npm ci --ignore-scripts', 'npm run build', 'npm test', 'npm run verify:package']) {
    assert.ok(workflow.includes(command));
  }
  assert.doesNotMatch(workflow, /id-token:|npm publish|secrets\./);
  const runtime = read('scripts/select-ci-runtime.sh');
  assert.match(runtime, /24\.20\.0/);
  assert.doesNotMatch(runtime, /curl|wget|npx|npm install/);
  const config = json('tsconfig.build.json');
  assert.equal(config.extends, undefined);
  assert.deepEqual(config.compilerOptions.lib, ['ES2022']);
  assert.deepEqual(config.compilerOptions.types, []);
});

test('release refuses registry redirection, wrong package and wrong license', () => {
  const manifest = json('package.json');
  const policy = json('release-policy.json');
  const lock = json('package-lock.json');
  const env = { GITHUB_REPOSITORY: policy.repository, GITHUB_EVENT_NAME: 'push', GITHUB_REF: `refs/tags/v${manifest.version}` };
  for (const patch of [{ name: '@konitif/foreign' }, { license: 'MIT' },
    { publishConfig: { access: 'public', registry: 'https://example.org/' } }]) {
    assert.throws(() => assertReleaseInputs(policy, { ...manifest, ...patch }, lock, env));
  }
});

test('release verifies before publishing and retains a non-overwritable exact archive', () => {
  const workflow = read('.github/workflows/publish.yml');
  assert.ok(workflow.indexOf('node scripts/check-release.mjs') < workflow.indexOf('node scripts/prepare-release-archive.mjs'));
  assert.ok(workflow.indexOf('node scripts/prepare-release-archive.mjs') < workflow.indexOf('npm publish .release/package.tgz'));
  assert.match(workflow, /--provenance --ignore-scripts --registry=https:\/\/registry.npmjs.org/);
  const script = read('scripts/prepare-release-archive.mjs');
  assert.ok(script.includes("join(evidence.evidence, 'stage')"));
  assert.match(script, /evidence.integrity/);
  assert.match(script, /evidence.bytes/);
  assert.match(script, /COPYFILE_EXCL/);
  const files = json('package.json').files;
  for (const path of ['.github', 'scripts', 'tests', 'release-policy.json', '.release']) assert.ok(!files.includes(path));
});
