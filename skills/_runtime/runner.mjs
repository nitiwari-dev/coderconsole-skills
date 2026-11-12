#!/usr/bin/env node

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const usage = {
  architecture: 'architecture --input <spec.json> --output <diagram.mmd>',
  color: 'color --value <hex|rgb(...)|hsl(...)> [--format hex|rgb|hsl]',
  cron: 'cron --expression "*/15 * * * *" [--count 5]',
  diff: 'diff --left <file> --right <file> [--output <diff.txt> | --stdout]',
  focus: 'focus --input <tasks.txt> --output <plan.md> [--focus-minutes 25] [--break-minutes 5]',
  hash: 'hash --input <file> --algorithm sha256|sha384|sha512 [--output <digest.txt> | --stdout]',
  html: 'html encode|decode --input <file> --output <file>',
  json: 'json format|minify|validate --input <file> [--output <file> | --stdout]',
  'json-diff': 'json-diff --left <a.json> --right <b.json> [--output <diff.json> | --stdout] [--include-values]',
  'json-model': 'json-model --input <file> --language typescript|kotlin|java|python|go|csharp --name <Model> --output <model-file>',
  jwt: 'jwt --input <token.txt> --output <decoded.json>',
  markdown: 'markdown --input <file.md> --output <preview.html>',
  scrub: 'scrub --input <file> --output <redacted-file>',
  regex: 'regex --input <file> --pattern <js-regex> [--flags <flags>] [--output <matches.json> | --stdout] [--timeout-ms 500]',
  sql: 'sql --input <query.sql> --output <formatted.sql>',
  timestamp: 'timestamp --value <unix-seconds|unix-milliseconds|ISO-date>',
  url: 'url encode|decode --mode component|url --input <file> --output <file>',
  uuid: 'uuid --version 4|7 [--count 1]',
  yaml: 'yaml yaml-to-json|json-to-yaml --input <file> --output <file>',
};
const executableNames = {
  architecture: 'architecture-sketcher.mjs', color: 'color.mjs', cron: 'cron.mjs', diff: 'diff.mjs', focus: 'focus.mjs',
  hash: 'hash.mjs', html: 'html-entities.mjs', json: 'json.mjs', 'json-diff': 'json-diff.mjs', 'json-model': 'json-to-model.mjs',
  jwt: 'jwt.mjs', markdown: 'markdown.mjs', scrub: 'privacy-scrubber.mjs', regex: 'regex.mjs', sql: 'sql.mjs',
  timestamp: 'timestamp.mjs', url: 'url.mjs', uuid: 'uuid.mjs', yaml: 'yaml-json.mjs',
};

function options(args) {
  const result = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith('--')) throw new Error(`Unexpected argument: ${arg}`);
    const [key, inline] = arg.slice(2).split(/=(.*)/s, 2);
    if (!key || Object.hasOwn(result, key)) throw new Error(`Invalid or duplicate option: ${arg}`);
    if (inline !== undefined) result[key] = inline;
    else if (args[i + 1] && !args[i + 1].startsWith('--')) result[key] = args[++i];
    else result[key] = true;
  }
  return result;
}

function need(opts, name) {
  const value = opts[name];
  if (value === undefined || value === true || value === '') throw new Error(`Missing --${name}.`);
  return value;
}

function help(tool) {
  if (tool === 'help' || tool === undefined || tool === true) {
    process.stdout.write(`CoderConsole local tool runner\n\n${Object.values(usage).join('\n')}\n`);
    return true;
  }
  if (!usage[tool]) throw new Error(`Unknown tool: ${tool}`);
  process.stdout.write(`Usage: node <skill-dir>/scripts/${executableNames[tool]} ${usage[tool].replace(/^\S+\s*/, '')}\n`);
  return true;
}

async function inputText(opts, name = 'input') {
  return readFile(need(opts, name), 'utf8');
}

async function resultText(opts, content, label = 'Wrote output') {
  if (opts.stdout) {
    process.stdout.write(content);
    return;
  }
  const output = need(opts, 'output');
  await writeFile(output, content, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
  process.stdout.write(`${label}: ${output}\n`);
}

function parseList(value, minimum, maximum, description) {
  const results = new Set();
  for (const part of value.split(',')) {
    const [baseText, stepText] = part.split('/');
    const step = stepText === undefined ? 1 : Number(stepText);
    if (!Number.isInteger(step) || step < 1) throw new Error(`Invalid ${description} step: ${part}`);
    let low;
    let high;
    if (baseText === '*') {
      [low, high] = [minimum, maximum];
    } else if (baseText.includes('-')) {
      [low, high] = baseText.split('-').map(Number);
    } else {
      low = Number(baseText);
      high = stepText === undefined ? low : maximum;
    }
    if (!Number.isInteger(low) || !Number.isInteger(high) || low < minimum || high > maximum || low > high) throw new Error(`Invalid ${description} range: ${part}`);
    for (let value = low; value <= high; value += step) results.add(value);
  }
  return results;
}

function cronMatches(date, fields, dayOfMonthAny, dayOfWeekAny) {
  const minute = date.getMinutes();
  const hour = date.getHours();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const weekday = date.getDay();
  const domMatch = fields[2].has(day);
  const dowMatch = fields[4].has(weekday) || (weekday === 0 && fields[4].has(7));
  const dayMatch = dayOfMonthAny && dayOfWeekAny ? true
    : dayOfMonthAny ? dowMatch
      : dayOfWeekAny ? domMatch : domMatch || dowMatch;
  return fields[0].has(minute) && fields[1].has(hour) && dayMatch && fields[3].has(month);
}

function formatLocal(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())} (UTC${sign}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)})`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function yamlScalar(value) {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  return String(value);
}

function toYaml(value, indent = 0) {
  const pad = ' '.repeat(indent);
  if (Array.isArray(value)) return value.length ? value.map((item) => `${pad}- ${item && typeof item === 'object' ? `\n${toYaml(item, indent + 2)}` : yamlScalar(item)}`).join('\n') : `${pad}[]`;
  if (value && typeof value === 'object') {
    return Object.entries(value).map(([key, item]) => `${pad}${/^[A-Za-z_][\w-]*$/.test(key) ? key : JSON.stringify(key)}:${item && typeof item === 'object' ? `\n${toYaml(item, indent + 2)}` : ` ${yamlScalar(item)}`}`).join('\n');
  }
  return `${pad}${yamlScalar(value)}`;
}

function parseYamlSubset(source) {
  const stripComment = (raw) => {
    let quote = '';
    for (let i = 0; i < raw.length; i += 1) {
      const ch = raw[i];
      if (quote) {
        if (ch === quote && raw[i - 1] !== '\\') quote = '';
      } else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '#' && (i === 0 || /\s/.test(raw[i - 1]))) return raw.slice(0, i).trimEnd();
    }
    return raw;
  };
  const lines = source.split(/\r?\n/).map((raw, index) => {
    const text = stripComment(raw);
    return { text, indent: text.match(/^ */)[0].length, line: index + 1 };
  }).filter((item) => item.text.trim() && !['---', '...'].includes(item.text.trim()));
  if (!lines.length) return null;
  function scalar(raw, line) {
    const text = raw.trim();
    if (text === '' || text === 'null' || text === '~') return null;
    if (text === 'true') return true;
    if (text === 'false') return false;
    if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(text)) return Number(text);
    if (text.startsWith('"')) {
      try { return JSON.parse(text); } catch { throw new Error(`Invalid quoted scalar on YAML line ${line}.`); }
    }
    if (text.startsWith("'")) {
      if (!text.endsWith("'")) throw new Error(`Unclosed quoted scalar on YAML line ${line}.`);
      return text.slice(1, -1).replace(/''/g, "'");
    }
    if (text.startsWith('[') || text.startsWith('{')) {
      try { return JSON.parse(text); } catch { throw new Error(`Only JSON-compatible flow collections are supported (line ${line}).`); }
    }
    if (/^[!&*]|\s[|>]\s*$/.test(text)) throw new Error(`YAML tags, anchors, aliases, and block scalars are not supported (line ${line}).`);
    return text;
  }
  function splitKey(text, line) {
    let quote = '';
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (quote) {
        if (ch === quote && text[i - 1] !== '\\') quote = '';
      } else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === ':' && (i === text.length - 1 || /\s/.test(text[i + 1]))) return [text.slice(0, i).trim(), text.slice(i + 1).trim()];
    }
    throw new Error(`Expected a mapping key and colon on YAML line ${line}.`);
  }
  function parseBlock(start, indent) {
    const first = lines[start].text.trimStart();
    const sequence = first === '-' || first.startsWith('- ');
    const out = sequence ? [] : {};
    let cursor = start;
    while (cursor < lines.length && lines[cursor].indent === indent) {
      const current = lines[cursor];
      const text = current.text.trimStart();
      if (sequence) {
        if (text !== '-' && !text.startsWith('- ')) break;
        const rest = text.slice(1).trimStart();
        if (!rest) {
          if (!lines[cursor + 1] || lines[cursor + 1].indent <= indent) out.push(null), cursor += 1;
          else { const nested = parseBlock(cursor + 1, lines[cursor + 1].indent); out.push(nested.value); cursor = nested.next; }
        } else {
          let pair;
          try { pair = splitKey(rest, current.line); } catch { pair = null; }
          if (!pair) {
            out.push(scalar(rest, current.line));
            cursor += 1;
          } else {
            const item = {};
            const keyValue = scalar(pair[0], current.line);
            if (typeof keyValue !== 'string' && typeof keyValue !== 'number') throw new Error(`YAML mapping keys must be strings or numbers (line ${current.line}).`);
            const key = String(keyValue);
            if (pair[1] === '') {
              if (!lines[cursor + 1] || lines[cursor + 1].indent <= indent) item[key] = null, cursor += 1;
              else { const nested = parseBlock(cursor + 1, lines[cursor + 1].indent); item[key] = nested.value; cursor = nested.next; }
            } else {
              item[key] = scalar(pair[1], current.line);
              cursor += 1;
            }
            while (cursor < lines.length && lines[cursor].indent > indent) {
              const nested = parseBlock(cursor, lines[cursor].indent);
              if (!nested.value || Array.isArray(nested.value) || typeof nested.value !== 'object') throw new Error(`Expected mapping continuation on YAML line ${lines[cursor].line}.`);
              for (const [nestedKey, nestedValue] of Object.entries(nested.value)) {
                if (Object.hasOwn(item, nestedKey)) throw new Error(`Duplicate YAML key '${nestedKey}' on line ${lines[cursor].line}.`);
                item[nestedKey] = nestedValue;
              }
              cursor = nested.next;
            }
            out.push(item);
          }
        }
      } else {
        if (text.startsWith('-')) break;
        const [rawKey, rawValue] = splitKey(text, current.line);
        const keyValue = scalar(rawKey, current.line);
        if (typeof keyValue !== 'string' && typeof keyValue !== 'number') throw new Error(`YAML mapping keys must be strings or numbers (line ${current.line}).`);
        const key = String(keyValue);
        if (Object.hasOwn(out, key)) throw new Error(`Duplicate YAML key '${key}' on line ${current.line}.`);
        if (rawValue === '') {
          if (!lines[cursor + 1] || lines[cursor + 1].indent <= indent) out[key] = null, cursor += 1;
          else { const nested = parseBlock(cursor + 1, lines[cursor + 1].indent); out[key] = nested.value; cursor = nested.next; }
        } else {
          out[key] = scalar(rawValue, current.line);
          cursor += 1;
        }
      }
    }
    return { value: out, next: cursor };
  }
  const rootIndent = lines[0].indent;
  const parsed = parseBlock(0, rootIndent);
  if (parsed.next !== lines.length) throw new Error(`Unsupported mixed indentation or YAML structure near line ${lines[parsed.next].line}.`);
  return parsed.value;
}

function typeName(value) {
  return value.replace(/(^|[^A-Za-z0-9])([A-Za-z0-9])/g, (_, __, ch) => ch.toUpperCase()).replace(/[^A-Za-z0-9]/g, '') || 'Item';
}

function colorParse(value) {
  const input = value.trim().toLowerCase();
  let channels;
  if (/^#[0-9a-f]{3,8}$/.test(input)) {
    const hex = input.slice(1);
    if (![3, 4, 6, 8].includes(hex.length)) throw new Error('HEX colors must use 3, 4, 6, or 8 digits.');
    const expanded = hex.length <= 4 ? [...hex].map((part) => part + part).join('') : hex;
    channels = [0, 2, 4].map((index) => parseInt(expanded.slice(index, index + 2), 16));
    channels.push(expanded.length === 8 ? parseInt(expanded.slice(6, 8), 16) / 255 : 1);
  } else {
    const rgb = input.match(/^rgba?\((.*)\)$/);
    const hsl = input.match(/^hsla?\((.*)\)$/);
    if (rgb) {
      const values = rgb[1].split(/[\s,/]+/).filter(Boolean);
      if (values.length < 3 || values.length > 4) throw new Error('RGB expects three channels and optional alpha.');
      channels = values.slice(0, 3).map((part) => part.endsWith('%') ? Math.round(parseFloat(part) * 2.55) : Math.round(Number(part)));
      channels.push(values[3] === undefined ? 1 : values[3].endsWith('%') ? parseFloat(values[3]) / 100 : Number(values[3]));
      if (channels.some((part, index) => !Number.isFinite(part) || (index < 3 ? part < 0 || part > 255 : part < 0 || part > 1))) throw new Error('RGB channels or alpha are out of range.');
    } else if (hsl) {
      const values = hsl[1].split(/[\s,/]+/).filter(Boolean);
      if (values.length < 3 || values.length > 4 || !values[1].endsWith('%') || !values[2].endsWith('%')) throw new Error('HSL expects hue, saturation%, lightness%, and optional alpha.');
      const hue = ((parseFloat(values[0]) % 360) + 360) % 360 / 360;
      const saturation = parseFloat(values[1]) / 100;
      const lightness = parseFloat(values[2]) / 100;
      const alpha = values[3] === undefined ? 1 : values[3].endsWith('%') ? parseFloat(values[3]) / 100 : Number(values[3]);
      if (![hue, saturation, lightness, alpha].every(Number.isFinite) || saturation < 0 || saturation > 1 || lightness < 0 || lightness > 1 || alpha < 0 || alpha > 1) throw new Error('HSL saturation, lightness, and alpha are out of range.');
      const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
      const x = chroma * (1 - Math.abs((hue * 6) % 2 - 1));
      const m = lightness - chroma / 2;
      const parts = hue < 1/6 ? [chroma,x,0] : hue < 2/6 ? [x,chroma,0] : hue < 3/6 ? [0,chroma,x] : hue < 4/6 ? [0,x,chroma] : hue < 5/6 ? [x,0,chroma] : [chroma,0,x];
      channels = parts.map((part) => Math.round((part + m) * 255));
      channels.push(alpha);
    } else throw new Error('Use #hex, rgb(...), or hsl(...).');
  }
  return channels;
}

function colorFormat(channels, format) {
  const [red, green, blue, alpha] = channels;
  if (format === 'hex') {
    const base = [red, green, blue].map((part) => Math.round(part).toString(16).padStart(2, '0')).join('');
    return `#${base}${alpha < 1 ? Math.round(alpha * 255).toString(16).padStart(2, '0') : ''}`;
  }
  if (format === 'rgb') return `rgb(${red} ${green} ${blue}${alpha < 1 ? ` / ${Number(alpha.toFixed(3))}` : ''})`;
  if (format === 'hsl') {
    const r = red / 255; const g = green / 255; const b = blue / 255;
    const max = Math.max(r, g, b); const min = Math.min(r, g, b); const delta = max - min;
    const lightness = (max + min) / 2;
    let hue = 0;
    if (delta) hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    hue = (hue * 60 + 360) % 360;
    const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
    return `hsl(${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%${alpha < 1 ? ` / ${Number(alpha.toFixed(3))}` : ''})`;
  }
  throw new Error('--format must be hex, rgb, or hsl.');
}

async function runArchitecture(opts) {
  const spec = JSON.parse(await inputText(opts));
  const nodes = spec.nodes ?? spec.components;
  const edges = spec.edges ?? spec.flows ?? [];
  if (!Array.isArray(nodes) || !nodes.length) throw new Error('Input JSON needs a non-empty nodes or components array.');
  const ids = new Set();
  const safeId = (value) => {
    const id = String(value).replace(/[^A-Za-z0-9_]/g, '_');
    if (!id || !/^[A-Za-z_]/.test(id)) return `node_${id}`;
    return id;
  };
  const lines = ['flowchart LR'];
  for (const [index, node] of nodes.entries()) {
    const rawId = node.id ?? node.name ?? `component_${index + 1}`;
    const id = safeId(rawId);
    if (ids.has(id)) throw new Error(`Duplicate component ID: ${id}`);
    ids.add(id);
    const label = String(node.label ?? node.name ?? rawId).replace(/["\n\r]/g, ' ');
    lines.push(`  ${id}["${label}"]`);
  }
  for (const edge of edges) {
    const from = safeId(edge.from ?? edge.source ?? '');
    const to = safeId(edge.to ?? edge.target ?? '');
    if (!ids.has(from) || !ids.has(to)) throw new Error(`Flow references unknown component: ${from} -> ${to}`);
    const label = edge.label ? `|${String(edge.label).replace(/[|\n\r]/g, ' ')}|` : '';
    lines.push(`  ${from} -->${label} ${to}`);
  }
  await resultText(opts, `${lines.join('\n')}\n`, 'Wrote Mermaid diagram');
}

function runCron(opts) {
  const expression = need(opts, 'expression');
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) throw new Error('Expected a standard five-field cron expression.');
  const ranges = [[0,59,'minute'],[0,23,'hour'],[1,31,'day'],[1,12,'month'],[0,7,'weekday']];
  const fields = parts.map((part, index) => parseList(part, ...ranges[index]));
  const domAny = fields[2].size === 31;
  const dowAny = fields[4].size === 8;
  const count = Number(opts.count ?? 5);
  if (!Number.isInteger(count) || count < 1 || count > 50) throw new Error('--count must be between 1 and 50.');
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(now.getMinutes() + 1);
  const found = [];
  for (let i = 0; i < 527040 && found.length < count; i += 1) {
    if (cronMatches(now, fields, domAny, dowAny)) found.push(formatLocal(now));
    now.setMinutes(now.getMinutes() + 1);
  }
  if (found.length < count) throw new Error('Could not find enough matching run times within one year.');
  process.stdout.write(`Expression: ${expression}\nTimezone: local system timezone\nNext ${count} runs:\n${found.map((time) => `- ${time}`).join('\n')}\n`);
}

async function runDiff(opts) {
  const splitLines = (value) => { const lines = value.split(/\r?\n/); if (value.endsWith('\n')) lines.pop(); return lines; };
  const left = splitLines(await readFile(need(opts, 'left'), 'utf8'));
  const right = splitLines(await readFile(need(opts, 'right'), 'utf8'));
  if (left.length * right.length > 4_000_000) throw new Error('Files are too large for this local diff mode (line-count product limit: 4,000,000).');
  const table = Array.from({ length: left.length + 1 }, () => new Uint32Array(right.length + 1));
  for (let i = left.length - 1; i >= 0; i -= 1) for (let j = right.length - 1; j >= 0; j -= 1) {
    table[i][j] = left[i] === right[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
  }
  const edits = [];
  let i = 0; let j = 0;
  while (i < left.length || j < right.length) {
    if (i < left.length && j < right.length && left[i] === right[j]) { edits.push(`  ${i + 1}: ${left[i]}`); i += 1; j += 1; }
    else if (j < right.length && (i === left.length || table[i][j + 1] >= table[i + 1][j])) { edits.push(`+ ${j + 1}: ${right[j]}`); j += 1; }
    else { edits.push(`- ${i + 1}: ${left[i]}`); i += 1; }
  }
  await resultText(opts, `${edits.join('\n')}\n`, 'Wrote text diff');
}

async function runFocus(opts) {
  const lines = (await inputText(opts)).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) throw new Error('Task file is empty. Put one task per line.');
  const focus = Number(opts['focus-minutes'] ?? 25);
  const rest = Number(opts['break-minutes'] ?? 5);
  if (!Number.isInteger(focus) || focus < 1 || focus > 180 || !Number.isInteger(rest) || rest < 0 || rest > 60) throw new Error('Focus must be 1–180 minutes and break 0–60 minutes.');
  const blocks = lines.map((task, index) => `## Focus ${index + 1} · ${focus} minutes\n\n- Outcome: ${task}\n- Stop point: note what is complete and the next action\n${index < lines.length - 1 && rest ? `\n## Break · ${rest} minutes\n\nStep away from the screen, then return for the next focus block.\n` : ''}`).join('\n');
  const plan = `# Focus plan\n\n${blocks}\n`;
  await resultText(opts, plan, 'Wrote focus plan');
}

async function runHash(opts) {
  const algorithm = opts.algorithm ?? 'sha256';
  if (!['sha256','sha384','sha512'].includes(algorithm)) throw new Error('Choose sha256, sha384, or sha512.');
  const bytes = await readFile(need(opts, 'input'));
  const digest = `${algorithm.toUpperCase()} ${createHash(algorithm).update(bytes).digest('hex')}\n`;
  await resultText(opts, digest, 'Wrote digest');
}

async function runHtml(opts, operation) {
  const source = await inputText(opts);
  let result;
  if (operation === 'encode') result = source.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  else if (operation === 'decode') {
    const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };
    result = source.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);/gi, (match, key) => {
      if (key[0] === '#') {
        const hex = key[1]?.toLowerCase() === 'x';
        const value = Number.parseInt(key.slice(hex ? 2 : 1), hex ? 16 : 10);
        return Number.isInteger(value) && value >= 0 && value <= 0x10ffff ? String.fromCodePoint(value) : match;
      }
      return entities[key.toLowerCase()] ?? match;
    });
  } else throw new Error('Choose encode or decode.');
  await resultText(opts, result, `Wrote HTML entity ${operation} output`);
}

async function runJson(opts, operation) {
  const source = await inputText(opts);
  const value = JSON.parse(source);
  if (operation === 'validate') { process.stdout.write('Valid JSON.\n'); return; }
  if (!['format','minify'].includes(operation)) throw new Error('Choose format, minify, or validate.');
  const result = operation === 'format' ? `${JSON.stringify(value, null, 2)}\n` : JSON.stringify(value);
  await resultText(opts, result, `Wrote ${operation} JSON`);
}

function jsonDiffValue(a, b, path, output, includeValues) {
  if (a === b) return;
  if (Array.isArray(a) && Array.isArray(b)) {
    const size = Math.max(a.length, b.length);
    for (let i = 0; i < size; i += 1) {
      const child = `${path}[${i}]`;
      if (i >= a.length) output.push({ path: child, change: 'added', ...(includeValues ? { after: b[i] } : {}) });
      else if (i >= b.length) output.push({ path: child, change: 'removed', ...(includeValues ? { before: a[i] } : {}) });
      else jsonDiffValue(a[i], b[i], child, output, includeValues);
    }
    return;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of [...keys].sort()) {
      const child = path ? `${path}.${key}` : key;
      if (!Object.hasOwn(a, key)) output.push({ path: child, change: 'added', ...(includeValues ? { after: b[key] } : {}) });
      else if (!Object.hasOwn(b, key)) output.push({ path: child, change: 'removed', ...(includeValues ? { before: a[key] } : {}) });
      else jsonDiffValue(a[key], b[key], child, output, includeValues);
    }
    return;
  }
  output.push({ path: path || '$', change: 'changed', ...(includeValues ? { before: a, after: b } : {}) });
}

async function runJsonDiff(opts) {
  const left = JSON.parse(await inputText(opts, 'left'));
  const right = JSON.parse(await inputText(opts, 'right'));
  const changes = [];
  jsonDiffValue(left, right, '', changes, Boolean(opts['include-values']));
  await resultText(opts, `${JSON.stringify(changes, null, 2)}\n`, 'Wrote JSON diff');
}

function buildModelSchema(value, name, definitions) {
  if (value === null) return { kind: 'null' };
  if (Array.isArray(value)) return { kind: 'array', items: value.length ? buildModelSchema(value[0], `${name}Item`, definitions) : { kind: 'any' } };
  if (typeof value === 'object') {
    const definition = { kind: 'object', name: typeName(name), fields: [] };
    for (const [key, child] of Object.entries(value)) {
      const childName = `${definition.name}${typeName(key)}`;
      definition.fields.push({ key, schema: buildModelSchema(child, childName, definitions) });
    }
    definitions.push(definition);
    return definition;
  }
  if (typeof value === 'string') return { kind: 'string' };
  if (typeof value === 'boolean') return { kind: 'boolean' };
  if (typeof value === 'number') return { kind: Number.isInteger(value) ? 'integer' : 'number' };
  return { kind: 'any' };
}

function modelType(schema, language) {
  const types = {
    typescript: { string: 'string', boolean: 'boolean', integer: 'number', number: 'number', any: 'unknown', null: 'null' },
    kotlin: { string: 'String', boolean: 'Boolean', integer: 'Long', number: 'Double', any: 'Any', null: 'Nothing?' },
    java: { string: 'String', boolean: 'Boolean', integer: 'Long', number: 'Double', any: 'Object', null: 'Object' },
    python: { string: 'str', boolean: 'bool', integer: 'int', number: 'float', any: 'Any', null: 'None' },
    go: { string: 'string', boolean: 'bool', integer: 'int64', number: 'float64', any: 'any', null: 'any' },
    csharp: { string: 'string', boolean: 'bool', integer: 'long', number: 'double', any: 'object', null: 'object?' },
  };
  if (schema.kind === 'array') {
    const child = modelType(schema.items, language);
    return language === 'kotlin' ? `List<${child}>` : language === 'go' ? `[]${child}` : language === 'python' ? `List[${child}]` : language === 'java' ? `List<${child}>` : language === 'csharp' ? `List<${child}>` : `${child}[]`;
  }
  return schema.kind === 'object' ? schema.name : (types[language]?.[schema.kind] ?? 'unknown');
}

function modelProperty(key, language) {
  if (language === 'go') return typeName(key);
  if (language === 'csharp') return typeName(key);
  if (['java','kotlin','python'].includes(language)) {
    let name = key.replace(/[^A-Za-z0-9_$]/g, '_');
    if (!name || /^\d/.test(name)) name = `_${name}`;
    const reserved = language === 'python'
      ? new Set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '))
      : language === 'kotlin'
        ? new Set('as break class continue do else false for fun if in interface is null object package return super this throw true try typealias typeof val var when while'.split(' '))
        : new Set('abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while'.split(' '));
    return reserved.has(name) ? `${name}_` : name;
  }
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}

function renderModel(schema, language) {
  const definitions = [];
  // Root naming is assigned by the caller; nested schemas are collected depth-first.
  const all = [...definitions];
  function collect(node) {
    if (node.kind === 'array') collect(node.items);
    if (node.kind === 'object') { for (const field of node.fields) collect(field.schema); all.push(node); }
  }
  collect(schema);
  const unique = [...new Map(all.map((item) => [item.name, item])).values()];
  unique.sort((left, right) => Number(right.name === schema.name) - Number(left.name === schema.name));
  const output = [];
  if (language === 'python') output.push('from dataclasses import dataclass', 'from typing import Any, List, Optional', '');
  if (language === 'java') output.push('import java.util.List;', '');
  if (language === 'csharp') output.push('using System.Collections.Generic;', '');
  for (const definition of unique) {
    if (language === 'typescript') {
      output.push(`export interface ${definition.name} {`);
      for (const field of definition.fields) output.push(`  ${modelProperty(field.key, language)}: ${modelType(field.schema, language)};`);
      output.push('}', '');
    } else if (language === 'kotlin') {
      output.push(`data class ${definition.name}(`);
      output.push(...definition.fields.map((field, index) => `    val ${modelProperty(field.key, language)}: ${modelType(field.schema, language)}${index < definition.fields.length - 1 ? ',' : ''}`));
      output.push(')', '');
    } else if (language === 'java') {
      output.push(`${definition.name === schema.name ? 'public ' : ''}class ${definition.name} {`);
      for (const field of definition.fields) output.push(`    public ${modelType(field.schema, language)} ${modelProperty(field.key, language)};`);
      output.push('}', '');
    } else if (language === 'python') {
      output.push('@dataclass', `class ${definition.name}:`);
      if (!definition.fields.length) output.push('    pass');
      for (const field of definition.fields) output.push(`    ${modelProperty(field.key, language)}: ${modelType(field.schema, language)}`);
      output.push('');
    } else if (language === 'go') {
      output.push(`type ${definition.name} struct {`);
      for (const field of definition.fields) output.push(`    ${modelProperty(field.key, language)} ${modelType(field.schema, language)} \`json:${JSON.stringify(field.key)}\``);
      output.push('}', '');
    } else if (language === 'csharp') {
      output.push(`public class ${definition.name}`, '{');
      for (const field of definition.fields) output.push(`    public ${modelType(field.schema, language)} ${modelProperty(field.key, language)} { get; set; }`);
      output.push('}', '');
    }
  }
  return `${output.join('\n').trim()}\n`;
}

async function runJsonModel(opts) {
  const language = need(opts, 'language').toLowerCase();
  if (!['typescript','kotlin','java','python','go','csharp'].includes(language)) throw new Error('Choose typescript, kotlin, java, python, go, or csharp.');
  const name = typeName(opts.name ?? 'RootModel');
  const value = JSON.parse(await inputText(opts));
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Root JSON value must be an object.');
  const definitions = [];
  const schema = buildModelSchema(value, name, definitions);
  await resultText(opts, renderModel(schema, language), `Wrote ${language} model`);
}

async function runJwt(opts) {
  const token = (await inputText(opts)).trim();
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('JWT must have three dot-separated segments.');
  let header; let claims;
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch { throw new Error('JWT header or payload is not valid Base64URL JSON.'); }
  const result = { header, claims, signaturePresent: Boolean(parts[2]), verified: false, note: 'Decoded only. The signature and claims were not verified.' };
  await resultText(opts, `${JSON.stringify(result, null, 2)}\n`, 'Wrote decoded JWT');
}

function inlineMarkdown(text) {
  let value = escapeHtml(text);
  value = value.replace(/`([^`]+)`/g, '<code>$1</code>');
  value = value.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  value = value.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');
  return value;
}

function markdownToHtml(source) {
  const lines = source.split(/\r?\n/);
  const output = ['<!doctype html>', '<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Markdown preview</title><body>'];
  let inCode = false; let code = []; let listType = '';
  const closeList = () => { if (listType) output.push(`</${listType}>`), listType = ''; };
  for (const line of lines) {
    if (line.startsWith('```')) {
      closeList();
      if (inCode) { output.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`); code = []; inCode = false; }
      else inCode = true;
      continue;
    }
    if (inCode) { code.push(line); continue; }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    const item = line.match(/^\s*[-*+]\s+(.*)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (heading) { closeList(); const level = heading[1].length; output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`); }
    else if (item || ordered) {
      const nextType = ordered ? 'ol' : 'ul';
      if (listType !== nextType) closeList(), output.push(`<${nextType}>`), listType = nextType;
      output.push(`<li>${inlineMarkdown((item ?? ordered)[1])}</li>`);
    } else if (!line.trim()) closeList();
    else if (/^>\s?/.test(line)) closeList(), output.push(`<blockquote><p>${inlineMarkdown(line.replace(/^>\s?/, ''))}</p></blockquote>`);
    else closeList(), output.push(`<p>${inlineMarkdown(line)}</p>`);
  }
  if (inCode) output.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
  closeList();
  output.push('</body></html>');
  return `${output.join('\n')}\n`;
}

async function runMarkdown(opts) {
  await resultText(opts, markdownToHtml(await inputText(opts)), 'Wrote safe Markdown preview');
}

async function runScrub(opts) {
  let source = await inputText(opts);
  let counts = { credential: 0, email: 0, phone: 0, ipv4: 0 };
  const replace = (pattern, kind) => { source = source.replace(pattern, () => { counts[kind] += 1; return '[REDACTED]'; }); };
  replace(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, 'credential');
  replace(/\b(?:Bearer\s+)[A-Za-z0-9._~+/-]+=*/gi, 'credential');
  replace(/\b(?:api[_-]?key|token|secret|password)\s*[:=]\s*["']?[^\s"',;]+["']?/gi, 'credential');
  replace(/\bAKIA[0-9A-Z]{16}\b/g, 'credential');
  replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, 'email');
  replace(/\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g, 'ipv4');
  replace(/\b(?:\+?\d[\d(). -]{8,}\d)\b/g, 'phone');
  await resultText(opts, source, 'Wrote scrubbed output');
  if (!opts.stdout) process.stdout.write(`Redaction counts: ${JSON.stringify(counts)}\n`);
}

async function runRegex(opts) {
  const input = await inputText(opts);
  if (Buffer.byteLength(input, 'utf8') > 1_000_000) throw new Error('Input is larger than the 1 MB safety limit.');
  const pattern = need(opts, 'pattern');
  let flags = opts.flags ?? '';
  if (/[^dgimsuvy]/.test(flags) || new Set(flags).size !== flags.length) throw new Error('Invalid JavaScript regex flags.');
  if (!flags.includes('g')) flags += 'g';
  const timeoutMs = Number(opts['timeout-ms'] ?? 500);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 50 || timeoutMs > 5000) throw new Error('--timeout-ms must be between 50 and 5000.');
  const workerCode = `let raw='';process.stdin.on('data',c=>raw+=c);process.stdin.on('end',()=>{try{const x=JSON.parse(raw);const r=new RegExp(x.pattern,x.flags);const out=[];let m;while((m=r.exec(x.input))&&out.length<10000){out.push({index:m.index,end:m.index+m[0].length,length:m[0].length,captureCount:m.length-1,namedGroups:Object.keys(m.groups||{})});if(!m[0].length)r.lastIndex++;}process.stdout.write(JSON.stringify(out));}catch(e){process.stderr.write(String(e&&e.message||e));process.exitCode=2;}});`;
  const child = spawn(process.execPath, ['-e', workerCode], { stdio: ['pipe','pipe','pipe'] });
  const data = JSON.stringify({ input, pattern, flags });
  let stdout = ''; let stderr = '';
  child.stdout.setEncoding('utf8').on('data', (chunk) => { stdout += chunk; });
  child.stderr.setEncoding('utf8').on('data', (chunk) => { stderr += chunk; });
  const done = new Promise((resolve, reject) => {
    const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('Regex execution timed out; pattern may cause excessive backtracking.')); }, timeoutMs);
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('close', (code) => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error(stderr || `Regex worker exited with ${code}.`)); });
  });
  child.stdin.end(data);
  await done;
  const matches = JSON.parse(stdout);
  const result = { count: matches.length, truncated: matches.length === 10000, matches };
  await resultText(opts, `${JSON.stringify(result, null, 2)}\n`, 'Wrote regex matches');
}

function sqlTokens(source) {
  const tokens = [];
  const regex = /\s+|--[^\r\n]*|\/\*[\s\S]*?\*\/|'(?:''|\\.|[^'])*'|"(?:""|\\.|[^"])*"|`(?:``|\\.|[^`])*`|\[(?:\]\]|[^\]])*\]|[A-Za-z_][A-Za-z0-9_$]*|\d+(?:\.\d+)?|[,();.]|./gy;
  let match;
  while ((match = regex.exec(source))) {
    const value = match[0];
    if (/^\s+$/.test(value)) continue;
    const type = value.startsWith('--') || value.startsWith('/*') ? 'comment'
      : /^['"`\[]/.test(value) ? 'quoted'
        : /^[A-Za-z_]/.test(value) ? 'word' : 'symbol';
    tokens.push({ value, type });
  }
  return tokens;
}

function formatSql(source) {
  const tokens = sqlTokens(source);
  const output = [];
  let depth = 0; let clause = ''; let previous = '';
  const breakWords = new Set(['SELECT','FROM','WHERE','JOIN','LEFT','RIGHT','FULL','INNER','CROSS','ON','HAVING','LIMIT','OFFSET','VALUES','SET','UNION','RETURNING','WHEN','ELSE','END']);
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const upper = token.type === 'word' ? token.value.toUpperCase() : '';
    const nextUpper = tokens[i + 1]?.type === 'word' ? tokens[i + 1].value.toUpperCase() : '';
    if (token.type === 'comment') {
      output.push(`${output.length && !output.at(-1).endsWith('\n') ? '\n' : ''}${'  '.repeat(depth)}${token.value}\n`);
      previous = token.value;
      continue;
    }
    if (token.value === '(') {
      output.push(`${previous && /[\w)]$/.test(previous) ? ' ' : ''}(`);
      depth += 1; previous = '('; continue;
    }
    if (token.value === ')') {
      depth = Math.max(0, depth - 1);
      output.push(`\n${'  '.repeat(depth)})`); previous = ')'; continue;
    }
    if (token.value === ',') {
      output.push(`,\n${'  '.repeat(depth + (clause === 'SELECT' || clause === 'VALUES' ? 1 : 0))}`);
      previous = ','; continue;
    }
    if (upper === 'GROUP' || upper === 'ORDER') {
      output.push(`${output.length ? '\n' : ''}${'  '.repeat(depth)}${upper} BY `);
      clause = upper; i += 1; previous = 'BY'; continue;
    }
    if (upper === 'INSERT' && nextUpper === 'INTO') {
      output.push(`${output.length ? '\n' : ''}${'  '.repeat(depth)}INSERT INTO `); i += 1; clause = 'INSERT'; previous = 'INTO'; continue;
    }
    if (upper === 'DELETE' && nextUpper === 'FROM') {
      output.push(`${output.length ? '\n' : ''}${'  '.repeat(depth)}DELETE FROM `); i += 1; clause = 'DELETE'; previous = 'FROM'; continue;
    }
    if (breakWords.has(upper)) {
      output.push(`${output.length ? '\n' : ''}${'  '.repeat(depth)}${upper} `);
      clause = upper;
      previous = upper;
      continue;
    }
    if (token.value === ';') { output.push(';\n'); clause = ''; previous = ';'; continue; }
    if (output.length && !output.at(-1).endsWith(' ') && !output.at(-1).endsWith('\n') && !/[.(]$/.test(previous)) output.push(' ');
    output.push(token.type === 'word' && /^(SELECT|FROM|WHERE|AND|OR|AS|JOIN|ON|GROUP|ORDER|BY|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|LEFT|RIGHT|INNER|OUTER|FULL|CROSS|UNION|ALL|DISTINCT|CASE|WHEN|THEN|ELSE|END|IS|NOT|NULL|IN|LIKE|BETWEEN|EXISTS|ASC|DESC|RETURNING)$/i.test(token.value) ? upper : token.value);
    previous = token.value;
  }
  return `${output.join('').replace(/[ \t]+\n/g, '\n').trim()}\n`;
}

async function runSql(opts) {
  await resultText(opts, formatSql(await inputText(opts)), 'Wrote formatted SQL');
}

function runTimestamp(opts) {
  const value = need(opts, 'value').trim();
  const numeric = /^-?\d+(?:\.\d+)?$/.test(value);
  let date; let sourceUnit;
  if (numeric) {
    const number = Number(value);
    sourceUnit = Math.abs(number) >= 1e12 ? 'milliseconds' : 'seconds';
    date = new Date(sourceUnit === 'seconds' ? number * 1000 : number);
  } else {
    date = new Date(value);
    sourceUnit = 'date string';
  }
  if (!Number.isFinite(date.getTime())) throw new Error('Could not parse the timestamp or date.');
  process.stdout.write(`Input interpreted as: ${sourceUnit}\nUTC: ${date.toISOString()}\nUnix seconds: ${Math.floor(date.getTime() / 1000)}\nUnix milliseconds: ${date.getTime()}\n`);
}

async function runUrl(opts, operation) {
  if (!['encode','decode'].includes(operation)) throw new Error('Choose encode or decode.');
  const mode = opts.mode ?? 'component';
  if (!['component','url'].includes(mode)) throw new Error('Choose --mode component or url.');
  const input = await inputText(opts);
  let output;
  try {
    if (operation === 'encode') output = input.split(/(?<=\n)/).map((line) => mode === 'component' ? encodeURIComponent(line.replace(/\n$/, '')) + (line.endsWith('\n') ? '%0A' : '') : encodeURI(line.replace(/\n$/, '')) + (line.endsWith('\n') ? '%0A' : '')).join('');
    else output = mode === 'component' ? decodeURIComponent(input) : decodeURI(input);
  } catch { throw new Error('Input contains malformed percent encoding or an invalid URI component.'); }
  await resultText(opts, output, `Wrote URL ${operation} output`);
}

function uuidV7() {
  const bytes = randomBytes(16);
  let time = BigInt(Date.now());
  for (let i = 5; i >= 0; i -= 1) { bytes[i] = Number(time & 255n); time >>= 8n; }
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

function runUuid(opts) {
  const version = opts.version ?? '4';
  if (!['4','7'].includes(version)) throw new Error('Choose UUID version 4 or 7.');
  const count = Number(opts.count ?? 1);
  if (!Number.isInteger(count) || count < 1 || count > 1000) throw new Error('--count must be between 1 and 1000.');
  const values = Array.from({ length: count }, () => version === '4' ? randomUUID() : uuidV7());
  process.stdout.write(`${values.join('\n')}\n`);
}

async function runYaml(opts, operation) {
  const source = await inputText(opts);
  let output;
  if (operation === 'yaml-to-json') output = `${JSON.stringify(parseYamlSubset(source), null, 2)}\n`;
  else if (operation === 'json-to-yaml') output = `${toYaml(JSON.parse(source))}\n`;
  else throw new Error('Choose yaml-to-json or json-to-yaml.');
  await resultText(opts, output, 'Wrote converted document');
}

export async function run(tool, rawArgs = process.argv.slice(2)) {
  try {
    if (rawArgs.includes('--help') || rawArgs.includes('-h')) { help(tool); return; }
    const args = [...rawArgs];
    let operation;
    if (['html','json','url','yaml'].includes(tool)) {
      operation = args.shift();
      if (!operation || operation.startsWith('--')) throw new Error(`Choose an operation. Usage: ${usage[tool]}`);
    }
    const opts = options(args);
    switch (tool) {
      case 'architecture': await runArchitecture(opts); break;
      case 'color': {
        const format = opts.format ?? 'hex';
        process.stdout.write(`${colorFormat(colorParse(need(opts, 'value')), format)}\n`);
        break;
      }
      case 'cron': runCron(opts); break;
      case 'diff': await runDiff(opts); break;
      case 'focus': await runFocus(opts); break;
      case 'hash': await runHash(opts); break;
      case 'html': await runHtml(opts, operation); break;
      case 'json': await runJson(opts, operation); break;
      case 'json-diff': await runJsonDiff(opts); break;
      case 'json-model': await runJsonModel(opts); break;
      case 'jwt': await runJwt(opts); break;
      case 'markdown': await runMarkdown(opts); break;
      case 'scrub': await runScrub(opts); break;
      case 'regex': await runRegex(opts); break;
      case 'sql': await runSql(opts); break;
      case 'timestamp': runTimestamp(opts); break;
      case 'url': await runUrl(opts, operation); break;
      case 'uuid': runUuid(opts); break;
      case 'yaml': await runYaml(opts, operation); break;
      default: throw new Error(`No runnable tool named '${tool}'.`);
    }
  } catch (error) {
    process.stderr.write(`Error: ${error instanceof Error ? error.message : 'Tool operation failed.'}\nUsage: ${usage[tool] ?? 'unknown tool'}\n`);
    process.exitCode = 1;
  }
}




