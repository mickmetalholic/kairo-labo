const POOL_SIZE = 2;

export async function asyncPool<T>(asyncTasks: (() => Promise<T>)[]) {
  const results: T[] = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < asyncTasks.length) {
      const currentIndex = nextIndex;
      nextIndex++;

      results[currentIndex] = await asyncTasks[currentIndex]();
    }
  }

  const workers = Array.from(
    { length: Math.min(POOL_SIZE, asyncTasks.length) },
    () => worker(),
  );

  await Promise.all(workers);

  return results;
}
