const POOL_SIZE = 2;

export async function asyncPool<T>(asyncTasks: (() => Promise<T>)[]) {
  let nextIndex = 0;
  const results: T[] = [];

  async function _runNext() {
    if (nextIndex >= asyncTasks.length) {
      return;
    }

    const currentIndex = nextIndex;
    nextIndex++;
    results[currentIndex] = await asyncTasks[currentIndex]();
    await _runNext();
  }

  const pool = Array.from(
    { length: Math.min(POOL_SIZE, asyncTasks.length) },
    () => _runNext(),
  );

  await Promise.all(pool);

  return results;
}
