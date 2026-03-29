import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTaskArgs } from '../dist/taskOptions.js';

test('parseTaskArgs parses core browser task flags', () => {
  const result = parseTaskArgs([
    '--url', 'https://example.com',
    '--wait-for-text', 'Example Domain',
    '--screenshot', 'shot.png',
    '--extract', 'page.txt',
    '--run-label', 'demo',
    '--timeout-ms', '12000',
    '--headed'
  ]);

  assert.equal(result.url, 'https://example.com');
  assert.equal(result.waitForText, 'Example Domain');
  assert.equal(result.screenshot, 'shot.png');
  assert.equal(result.extract, 'page.txt');
  assert.equal(result.runLabel, 'demo');
  assert.equal(result.timeoutMs, 12000);
  assert.equal(result.headless, false);
});

test('parseTaskArgs parses script and publish flags', () => {
  const result = parseTaskArgs([
    '--script-file', 'examples/x-post.json',
    '--run-label', 'publish-dry-run',
    '--allow-live-publish'
  ]);

  assert.equal(result.scriptFile, 'examples/x-post.json');
  assert.equal(result.runLabel, 'publish-dry-run');
  assert.equal(result.allowLivePublish, true);
});

test('parseTaskArgs requires url or script file', () => {
  assert.throws(() => parseTaskArgs([]), /Missing required --url or --script-file/);
});
