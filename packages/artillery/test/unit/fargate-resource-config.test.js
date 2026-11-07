/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { test } = require('node:test');
const assert = require('node:assert');
let checkFargateResourceConfig;

const __tap = require('node:test');
// Modules under test are ES modules - load before tests run
__tap.before(async () => {
  const mod = await import('../../lib/platform/aws-ecs/legacy/run-cluster.ts');
  checkFargateResourceConfig = mod.checkFargateResourceConfig;
});

test('32 vCPU accepts 60, 120 and 244 GiB (issue #3781)', () => {
  for (const memory of [61440, 122880, 249856]) {
    const err = checkFargateResourceConfig(32768, memory);
    assert.strictEqual(
      err,
      null,
      `expected cpu=32768 memory=${memory} to be valid, got: ${err && err.message}`
    );
  }
});

test('32 vCPU rejects other memory sizes', () => {
  const err = checkFargateResourceConfig(32768, 61441);
  assert.ok(err instanceof Error);
  assert.match(err.message, /Fargate memory override for cpu = 32768/);
});

test('existing smaller task sizes still valid', () => {
  assert.strictEqual(checkFargateResourceConfig(256, 512), null);
  assert.strictEqual(checkFargateResourceConfig(16384, 122880), null);
});

test('unsupported cpu still rejected', () => {
  const err = checkFargateResourceConfig(65536, 122880);
  assert.ok(err instanceof Error);
  assert.match(err.message, /Unsupported cpu override for Fargate/);
});
