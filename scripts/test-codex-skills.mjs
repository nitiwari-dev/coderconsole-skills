#!/usr/bin/env node

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(process.env.CODERCONSOLE_SKILLS_REPO || resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const installerPath = join(repoRoot, 'scripts/install-coderconsole-skill.sh');
const manifestText = readFileSync(join(repoRoot, 'skills/manifest.conf'), 'utf8');
const tests = [
  {
    skill: 'coderconsole-architecture-sketcher', script: 'architecture-sketcher', output: 'diagram.mmd',
    files: { 'spec.json': JSON.stringify({ nodes: [{ id: 'api', label: 'API' }, { id: 'db', label: 'Database' }], edges: [{ from: 'api', to: 'db' }] }) },
    prompt: 'Create a Mermaid architecture diagram from spec.json and save it as diagram.mmd. Use the bundled script. Do not invent components.',
    verify: (dir) => assert.match(read(dir, 'diagram.mmd'), /flowchart LR[\s\S]*api --> db/),
  },
  {
    skill: 'coderconsole-base64', script: 'base64', output: 'encoded.b64',
    files: { 'input.txt': 'sanity check' },
    prompt: 'Encode input.txt to encoded.b64 using the bundled script. Keep the payload out of your response.',
    verify: (dir) => assert.equal(read(dir, 'encoded.b64'), 'c2FuaXR5IGNoZWNr'),
  },
  {
    skill: 'coderconsole-color', script: 'color', output: 'color.txt',
    prompt: 'Convert #1e90ff to HSL using the bundled script and save the command output to color.txt.',
    verify: (dir) => assert.match(read(dir, 'color.txt'), /^hsl\(210 100% 56%\)/),
  },
  {
    skill: 'coderconsole-cron', script: 'cron', output: 'cron.txt',
    prompt: 'For */15 * * * *, calculate the next two run times with the bundled script and save its output to cron.txt. State the timezone printed by the tool.',
    verify: (dir) => assert.match(read(dir, 'cron.txt'), /Next 2 runs/),
  },
  {
    skill: 'coderconsole-diff', script: 'diff', output: 'changes.txt',
    files: { 'before.txt': 'same\nold\n', 'after.txt': 'same\nnew\n' },
    prompt: 'Compare before.txt and after.txt with the bundled script and save the result to changes.txt. Do not apply either file.',
    verify: (dir) => {
      assert.match(read(dir, 'changes.txt'), /- 2: old/);
      assert.match(read(dir, 'changes.txt'), /\+ 2: new/);
    },
  },
  {
    skill: 'coderconsole-focus', script: 'focus', output: 'focus-plan.md',
    files: { 'tasks.txt': 'Inspect the failing workflow\nDocument the fix\n' },
    prompt: 'Turn tasks.txt into a focus plan with 25-minute sessions and 5-minute breaks. Save it as focus-plan.md with the bundled script. Do not claim to start a timer.',
    verify: (dir) => assert.match(read(dir, 'focus-plan.md'), /Focus 1 · 25 minutes/),
  },
  {
    skill: 'coderconsole-hash', script: 'hash', output: 'digest.txt',
    files: { 'input.txt': 'sanity check' },
    prompt: 'Calculate the SHA-256 digest of input.txt with the bundled script and save it to digest.txt. Do not print the file contents.',
    verify: (dir) => assert.match(read(dir, 'digest.txt'), /^SHA256 [0-9a-f]{64}/),
  },
  {
    skill: 'coderconsole-html-entities', script: 'html-entities', output: 'encoded.html.txt',
    files: { 'markup.txt': '<tag>&' },
    prompt: 'Encode markup.txt as HTML entities with the bundled script and save the result to encoded.html.txt. Do not render or execute the markup.',
    verify: (dir) => assert.equal(read(dir, 'encoded.html.txt'), '&lt;tag&gt;&amp;'),
  },
  {
    skill: 'coderconsole-json', script: 'json', output: 'formatted.json',
    files: { 'input.json': '{"ready":true}' },
    prompt: 'Format input.json with the bundled JSON skill and save it to formatted.json. Do not print the document.',
    verify: (dir) => assert.match(read(dir, 'formatted.json'), /"ready": true/),
  },
  {
    skill: 'coderconsole-json-diff', script: 'json-diff', output: 'json-diff.json',
    files: { 'before.json': '{"x":1}', 'after.json': '{"x":2,"y":true}' },
    prompt: 'Compare before.json and after.json with the bundled JSON diff script. Save changed paths to json-diff.json and omit before/after values.',
    verify: (dir) => {
      assert.match(read(dir, 'json-diff.json'), /"path": "x"/);
      assert.match(read(dir, 'json-diff.json'), /"path": "y"/);
    },
  },
  {
    skill: 'coderconsole-json-to-model', script: 'json-to-model', output: 'model.ts',
    files: { 'sample.json': '{"id":7,"name":"Ada"}' },
    prompt: 'Generate a TypeScript model named ApiResponse from sample.json with the bundled script and save it to model.ts.',
    verify: (dir) => assert.match(read(dir, 'model.ts'), /export interface ApiResponse/),
  },
  {
    skill: 'coderconsole-jwt', script: 'jwt', output: 'decoded.json',
    files: { 'token.txt': 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJkZW1vIn0.x' },
    prompt: 'Decode token.txt with the bundled JWT script and save its result to decoded.json. Do not verify or claim to verify its signature, and do not repeat the token.',
    verify: (dir) => {
      assert.match(read(dir, 'decoded.json'), /"sub": "demo"/);
      assert.match(read(dir, 'decoded.json'), /"verified": false/);
    },
  },
  {
    skill: 'coderconsole-markdown', script: 'markdown', output: 'preview.html',
    files: { 'notes.md': '# Hello\n<script>alert(1)</script>\n' },
    prompt: 'Create a safe HTML preview of notes.md with the bundled script and save it to preview.html. Raw HTML must remain escaped.',
    verify: (dir) => assert.match(read(dir, 'preview.html'), /&lt;script&gt;/),
  },
  {
    skill: 'coderconsole-privacy-scrubber', script: 'privacy-scrubber', output: 'redacted.txt',
    files: { 'source.txt': 'Contact alice@example.com; password=demo-secret' },
    prompt: 'Redact common secrets and personal data in source.txt with the bundled script. Save only the redacted output to redacted.txt; do not echo the source.',
    verify: (dir) => {
      const result = read(dir, 'redacted.txt');
      assert.doesNotMatch(result, /alice@example\.com|demo-secret/);
      assert.match(result, /\[REDACTED\]/);
    },
  },
  {
    skill: 'coderconsole-regex', script: 'regex', output: 'matches.json',
    files: { 'sample.txt': 'word other WORD' },
    prompt: 'Use the bundled regex skill to find case-insensitive whole-word matches for word in sample.txt and save match metadata to matches.json. Do not include matched text.',
    verify: (dir) => assert.match(read(dir, 'matches.json'), /"count": 2/),
  },
  {
    skill: 'coderconsole-sql', script: 'sql', output: 'formatted.sql',
    files: { 'query.sql': 'select id from users where active = true;' },
    prompt: 'Format query.sql with the bundled SQL script and save the result to formatted.sql. Do not execute or optimize the query.',
    verify: (dir) => assert.match(read(dir, 'formatted.sql'), /SELECT id\nFROM users\nWHERE active = true;/),
  },
  {
    skill: 'coderconsole-timestamp', script: 'timestamp', output: 'timestamp.txt',
    prompt: 'Convert Unix timestamp 1735689600 with the bundled script and save its output to timestamp.txt.',
    verify: (dir) => assert.match(read(dir, 'timestamp.txt'), /UTC: 2025-01-01T00:00:00/),
  },
  {
    skill: 'coderconsole-url', script: 'url', output: 'encoded-url.txt',
    files: { 'url.txt': 'a b' },
    prompt: 'Encode url.txt as a URL component using the bundled script and save the result to encoded-url.txt.',
    verify: (dir) => assert.equal(read(dir, 'encoded-url.txt'), 'a%20b'),
  },
  {
    skill: 'coderconsole-uuid', script: 'uuid', output: 'uuid.txt',
    prompt: 'Generate two UUID v7 values with the bundled script and save its standard output to uuid.txt. Do not claim this validates existing UUIDs.',
    verify: (dir) => {
      const values = read(dir, 'uuid.txt').trim().split(/\r?\n/);
      assert.equal(values.length, 2);
      assert.ok(values.every((value) => /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)));
    },
  },
  {
    skill: 'coderconsole-yaml-json', script: 'yaml-json', output: 'output.json',
    files: { 'input.yaml': 'ready: true\nitems:\n  - one\n  - two\n' },
    prompt: 'Convert input.yaml to JSON using the bundled YAML-to-JSON script and save it to output.json.',
    verify: (dir) => assert.deepEqual(JSON.parse(read(dir, 'output.json')), { ready: true, items: ['one', 'two'] }),
  },
];

function read(directory, name) {
  return readFileSync(join(directory, name), 'utf8');
}

function parseArgs(args) {
  const result = { skill: null, list: false };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--list') result.list = true;
    else if (args[index] === '--skill' && args[index + 1]) result.skill = args[++index];
    else if (args[index] === '--help' || args[index] === '-h') result.help = true;
    else throw new Error(`Unknown or incomplete option: ${args[index]}`);
  }
  return result;
}

function usage() {
  console.log('Usage: node scripts/test-codex-skills.mjs [--list] [--skill <skill-id>]');
  console.log('Runs one Codex prompt per selected skill and verifies its output in an isolated temporary project.');
}

const options = parseArgs(process.argv.slice(2));
if (manifestText.includes('test-codex-skills.mjs')) {
  throw new Error('Repo-level Codex smoke test must stay out of skills/manifest.conf.');
}
if (options.help) {
  usage();
  process.exit(0);
}
if (options.list) {
  tests.forEach(({ skill }) => console.log(skill));
  process.exit(0);
}
if (options.skill && !tests.some(({ skill }) => skill === options.skill)) {
  usage();
  throw new Error(`No Codex sanity example exists for ${options.skill}`);
}

const selectedTests = options.skill ? tests.filter(({ skill }) => skill === options.skill) : tests;
const codexVersion = spawnSync('codex', ['--version'], { encoding: 'utf8' });
if (codexVersion.error || codexVersion.status !== 0) {
  throw new Error('Codex CLI is required. Install it, sign in, then rerun this script.');
}

const runRoot = mkdtempSync(join(tmpdir(), 'coderconsole-codex-skills-'));
const failures = [];
const timeoutMs = Number(process.env.CODEX_SKILL_TEST_TIMEOUT_MS || 180000);
if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1000) throw new Error('CODEX_SKILL_TEST_TIMEOUT_MS must be an integer of at least 1000.');

console.log(`Codex ${codexVersion.stdout.trim()}`);
console.log(`Running ${selectedTests.length} prompt(s); this uses your configured Codex account and model.`);
console.log(`Artifacts and traces will be kept in ${runRoot}`);

for (const testCase of selectedTests) {
  const testDir = join(runRoot, testCase.skill);
  mkdirSync(testDir);
  for (const [name, content] of Object.entries(testCase.files ?? {})) writeFileSync(join(testDir, name), content);

  console.log(`RUN  ${testCase.skill}`);
  const install = spawnSync('sh', [installerPath, '--agent', 'codex', '--scope', 'project', '--skill', testCase.skill], {
    cwd: testDir,
    encoding: 'utf8',
    timeout: 30000,
  });
  if (install.error || install.status !== 0) {
    failures.push(`${testCase.skill}: local skill install failed: ${install.stderr || install.error?.message || install.status}`);
    console.error(`FAIL ${testCase.skill}: local skill install failed`);
    continue;
  }

  const responsePath = join(testDir, 'codex-response.txt');
  const prompt = `Use $${testCase.skill}. ${testCase.prompt} Execute the skill's bundled script; do not merely describe the steps. Write only inside this temporary project.`;
  const codexArgs = [
    'exec', '--ephemeral', '--skip-git-repo-check', '--sandbox', 'workspace-write',
    '--cd', testDir, '--output-last-message', responsePath, '--json', prompt,
  ];
  if (process.env.CODEX_SKILL_TEST_MODEL) codexArgs.splice(1, 0, '--model', process.env.CODEX_SKILL_TEST_MODEL);

  const execution = spawnSync('codex', codexArgs, {
    cwd: testDir,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 20 * 1024 * 1024,
  });
  writeFileSync(join(testDir, 'codex-events.jsonl'), execution.stdout ?? '');
  writeFileSync(join(testDir, 'codex-stderr.log'), execution.stderr ?? '');

  try {
    if (execution.error) throw execution.error;
    if (execution.status !== 0) throw new Error(`codex exec exited with ${execution.status}: ${(execution.stderr ?? '').trim()}`);
    testCase.verify(testDir);
    const trace = execution.stdout ?? '';
    if (!trace.includes(`${testCase.script}.mjs`)) {
      console.warn(`WARN ${testCase.skill}: output passed, but the JSON trace did not show ${testCase.script}.mjs; inspect its artifacts.`);
    }
    console.log(`PASS ${testCase.skill}`);
  } catch (error) {
    failures.push(`${testCase.skill}: ${error.message}`);
    console.error(`FAIL ${testCase.skill}: ${error.message}`);
  }
}

console.log(`\n${selectedTests.length - failures.length}/${selectedTests.length} skill prompt checks passed.`);
console.log(`Review prompts' results and event traces under ${runRoot}`);
if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
}
