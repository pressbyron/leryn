import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, jump, stepRun } from '../runner-engine.mjs';
const dt = 1 / 120;

test('missing the first star ends the run without awarding points', () => {
  const run = createRun();
  for (let i = 0; i < 600; i++) stepRun(run, dt);
  assert.equal(run.status, 'over');
  assert.equal(run.score, 0);
});

test('a timed jump collects a star; a later miss still ends the run', () => {
  const run = createRun();
  while (run.starX > 120) stepRun(run, dt);
  jump(run);
  for (let i = 0; i < 120 && run.score === 0; i++) stepRun(run, dt);
  assert.equal(run.score, 10);
  assert.equal(run.status, 'running');
  for (let i = 0; i < 600; i++) stepRun(run, dt);
  assert.equal(run.status, 'over');
  assert.equal(run.score, 10);
});

test('pressing jump in midair cannot grant another jump', () => {
  const run = createRun();
  jump(run);
  stepRun(run, dt);
  const velocity = run.velocity;
  jump(run);
  assert.equal(run.velocity, velocity);
});

test('later stars remain reachable as speed rises', () => {
  const run = createRun();
  for (let i = 0; i < 12000 && run.score < 150; i++) {
    if (run.starX < 120 && run.y === 0) jump(run);
    stepRun(run, dt);
    assert.equal(run.status, 'running');
  }
  assert.equal(run.score, 150);
});

test('paused runs freeze; a fresh run resets score, position and speed', () => {
  const run = createRun();
  run.status = 'paused';
  const before = {...run};
  stepRun(run, 1);
  jump(run);
  assert.deepEqual(run, before);
  const fresh = createRun();
  assert.equal(fresh.score, 0);
  assert.equal(fresh.y, 0);
  assert.equal(fresh.status, 'running');
});
