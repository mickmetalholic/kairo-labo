const POOL_SIZE = 2;

export async function asyncPool<T>(asyncTasks: (() => Promise<T>)[]) {
  const running = new Set<Promise<T>>();
  const results: Promise<T>[] = [];

  for (let i = 0; i < asyncTasks.length; i++) {
    if (running.size >= POOL_SIZE) {
      await Promise.race(running).catch(() => undefined);
    }

    const task = asyncTasks[i];
    const p = task();

    running.add(p);
    results[i] = p;
    p.then(
      () => running.delete(p),
      () => running.delete(p),
    );
  }

  return Promise.all(results);
}
