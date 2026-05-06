interface KairoStep {
  label: string;
  durationMs: number;
}

const kairo = {
  title: '__KAIRO_TITLE__',
  steps: [
    { label: 'Sketch the idea', durationMs: 120 },
    { label: 'Model the data', durationMs: 80 },
    { label: 'Run the experiment', durationMs: 160 },
  ],
} satisfies {
  title: string;
  steps: KairoStep[];
};

function formatDuration(durationMs: number): string {
  return `${durationMs}ms`;
}

function summarizeSteps(steps: KairoStep[]): string[] {
  const totalDuration = steps.reduce(
    (total, step) => total + step.durationMs,
    0,
  );

  return steps.map((step, index) => {
    const percentage = Math.round((step.durationMs / totalDuration) * 100);

    return `${index + 1}. ${step.label}: ${formatDuration(step.durationMs)} (${percentage}%)`;
  });
}

console.log(`__KAIRO_TITLE__`);
console.log('='.repeat(kairo.title.length));
console.log('');
console.log('A tiny TypeScript code kairo is wired up and ready.');
console.log('');
console.log(summarizeSteps(kairo.steps).join('\n'));
