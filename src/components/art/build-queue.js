// Printing a living canvas is heavy work, so builds run one at a time, each waiting for
// the browser to be idle before it starts.
let chain = Promise.resolve();
const idle = () => new Promise(resolve => {
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(() => resolve(), { timeout: 1500 });
  else setTimeout(resolve, 120);
});

export function queueBuild(job) {
  const run = chain.then(idle).then(job);
  chain = run.catch(() => {});
  return run;
}
