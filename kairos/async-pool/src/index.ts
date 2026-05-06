import { strict as assert } from 'node:assert';

// import { asyncPool } from './asyncPoolWorker';

import { asyncPool } from './asyncPoolRecursive';

// import { asyncPool } from './asyncPoolRace';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function testKeepsResultOrder() {
  const tasks = [30, 10, 20].map((ms, index) => async () => {
    await sleep(ms);

    return index;
  });

  assert.deepEqual(await asyncPool(tasks), [0, 1, 2]);
}

async function testLimitsConcurrency() {
  let activeCount = 0;
  let maxActiveCount = 0;

  const tasks = [20, 20, 20, 20].map(() => async () => {
    activeCount++;
    maxActiveCount = Math.max(maxActiveCount, activeCount);

    await sleep(20);

    activeCount--;

    return activeCount;
  });

  await asyncPool(tasks);

  assert.equal(maxActiveCount, 2);
}

async function testRejectsWithTaskError() {
  const tasks = [
    async () => 'first',
    async () => {
      await sleep(10);

      throw new Error('boom');
    },
    async () => 'third',
  ];

  await assert.rejects(() => asyncPool(tasks), /boom/);
}

async function testEmptyTasks() {
  assert.deepEqual(await asyncPool([]), []);
}

async function runTests() {
  await testKeepsResultOrder();
  await testLimitsConcurrency();
  await testRejectsWithTaskError();
  await testEmptyTasks();

  console.log('All async pool cases passed.');
}

runTests();
