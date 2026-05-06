import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root was not found.');
}

app.innerHTML = `
  <main class="shell">
    <section class="panel">
      <p class="eyebrow">Raf Basic</p>
      <h1>Vanilla TypeScript Starter</h1>
      <p class="lead">
        A small standalone kairo package. Replace this content with the one idea
        you want to explore.
      </p>
      <button class="button" type="button">Click to test the wiring</button>
      <p class="status" aria-live="polite">Ready.</p>
    </section>
  </main>
`;

const button = app.querySelector<HTMLButtonElement>('.button');
const status = app.querySelector<HTMLParagraphElement>('.status');

if (!button || !status) {
  throw new Error('Starter UI failed to mount.');
}

let count = 0;

button.addEventListener('click', () => {
  count += 1;
  status.textContent = `Button clicked ${count} time${count === 1 ? '' : 's'}.`;
});
