const tap = require('node:test');
const assert = require('node:assert');
const { execute } = require('../helpers');

tap.test(
  'Throws when encountered an unknown engine in scenarios',
  async (_t) => {
    const [exitCode, output] = await execute([
      'run',
      'test/scripts/unknown_engine.json'
    ]);

    assert.strictEqual(exitCode, 11, 'CLI should exit with code 11');
    assert.ok(output.stdout.includes(
        'Failed to run scenario "0": unknown engine "playwright". Did you forget to include it in "config.engines.playwright"?'
      ), 'Error message about missing "config[engineName]" is not being printed');
  }
);

tap.test(
  'Unloaded engine in config.engines yields unknown-engine error, not TypeError (issue #3784)',
  async (_t) => {
    const [exitCode, output] = await execute([
      'run',
      'test/scripts/unloaded_engine.json'
    ]);

    assert.notStrictEqual(exitCode, 0, 'CLI should fail');
    assert.ok(
      output.stdout.includes(
        'Failed to run scenario "0": unknown engine "zzmissing"'
      ),
      'Error message about unknown engine is not being printed'
    );
    assert.ok(
      !output.stdout.includes('TypeError'),
      'Output should not contain a TypeError'
    );
  }
);

tap.test(
  'Unloaded engine in a before hook yields unknown-engine error, not TypeError (issue #3784)',
  async (_t) => {
    const [exitCode, output] = await execute([
      'run',
      'test/scripts/unloaded_engine_hook.json'
    ]);

    assert.notStrictEqual(exitCode, 0, 'CLI should fail');
    const combined = `${output.stdout}\n${output.stderr || ''}`;
    assert.ok(
      combined.includes(
        'Failed to run before hook: unknown engine "zzmissing"'
      ),
      'Error message about unknown engine in hook is not being printed'
    );
    assert.ok(
      !combined.includes('TypeError'),
      'Output should not contain a TypeError'
    );
  }
);
