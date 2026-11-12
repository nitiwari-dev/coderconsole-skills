#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const usage = 'Usage: node base64.mjs <encode|decode> --input <path> [--output <path> | --stdout]';

function fail(message) {
  console.error(`${message}\n${usage}`);
  process.exitCode = 1;
}

const [operation, ...args] = process.argv.slice(2);
if (!['encode', 'decode'].includes(operation)) {
  fail('Choose encode or decode.');
} else {
  const options = new Map();
  let invalidArgs = false;
  for (let index = 0; index < args.length; index++) {
    const key = args[index];
    if (key === '--stdout') {
      if (options.has(key)) invalidArgs = true;
      options.set(key, true);
    } else if (key === '--input' || key === '--output') {
      const value = args[++index];
      if (!value || value.startsWith('--') || options.has(key)) invalidArgs = true;
      else options.set(key, value);
    } else {
      invalidArgs = true;
    }
  }

  const inputPath = options.get('--input');
  const outputPath = options.get('--output');
  const toStdout = options.has('--stdout');
  if (invalidArgs || !inputPath || (toStdout && outputPath) || (!toStdout && !outputPath)) {
    fail('Provide one input and either an output path or --stdout.');
  } else {
    try {
      const source = await readFile(inputPath, 'utf8');
      let result;
      let byteCount;

      if (operation === 'encode') {
        const bytes = Buffer.from(source, 'utf8');
        result = bytes.toString('base64');
        byteCount = bytes.length;
      } else {
        const compact = source.replace(/[\t\n\f\r ]/g, '');
        const validBase64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2,3})?$/.test(compact);
        if (!validBase64) throw new Error('Input is not valid Base64 text.');
        const bytes = Buffer.from(compact, 'base64');
        if (bytes.toString('base64').replace(/=+$/, '') !== compact.replace(/=+$/, '')) {
          throw new Error('Input is not valid Base64 text.');
        }
        result = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        byteCount = bytes.length;
      }

      if (toStdout) {
        process.stdout.write(result);
      } else {
        const inputResolved = resolve(inputPath);
        const outputResolved = resolve(outputPath);
        if (inputResolved === outputResolved) throw new Error('Input and output paths must be different.');
        await writeFile(outputResolved, result, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
        console.log(`OK operation=${operation} bytes=${byteCount} output=${outputResolved}`);
      }
    } catch (error) {
      fail(error instanceof Error ? error.message : 'Conversion failed.');
    }
  }
}
