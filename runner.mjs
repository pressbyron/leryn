import { createRun, jump, stepRun, PLAYER } from './runner-engine.mjs';

const field = document.getElementById('gameField');
const gameWindow = document.getElementById('runnerWindow');
const player = document.getElementById('runnerPlayer');
const star = document.getElementById('runnerStar');
const score = document.getElementById('gameScore');
const hint = document.getElementById('gameHint');
const overlay = document.getElementById('runnerOverlay');
let run = null;
let frame = 0;
let previous = 0;
let accumulator = 0;
let lastScore = 0;
const fixedStep = 1 / 120;

function render() {
  if (!run) return;
  player.style.left = `${PLAYER.x / 3}%`;
  player.style.bottom = `${16 + run.y / 125 * 100}%`;
  player.style.width = `${PLAYER.width / 3}%`;
  player.style.height = `${PLAYER.height / 125 * 100}%`;
  player.dataset.airborne = String(run.y > 0);
  star.style.left = `${run.starX / 3}%`;
  star.style.bottom = `${16 + run.starY / 125 * 100}%`;
  gameWindow.style.setProperty('--run-distance', `${-run.distance * 0.2}px`);
  if (run.score !== lastScore) {
    lastScore = run.score;
    score.textContent = `${run.score} POÄNG`;
    player.classList.remove('runner-catch');
    player.classList.add('runner-catch');
    window.setTimeout(() => player.classList.remove('runner-catch'), 160);
  }
}

function tick(time) {
  if (!run || run.status !== 'running') return;
  if (!previous) previous = time;
  accumulator += Math.min((time - previous) / 1000, 0.05);
  previous = time;
  while (accumulator >= fixedStep && run.status === 'running') {
    stepRun(run, fixedStep);
    accumulator -= fixedStep;
  }
  render();
  if (run.status === 'over') {
    gameWindow.dataset.state = 'over';
    overlay.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = 'En stjärna smet förbi!';
    const retry = document.createElement('span');
    retry.textContent = `${run.score} poäng · Klicka och försök igen`;
    overlay.append(title, retry);
    overlay.hidden = false;
    hint.textContent = `Omgången är slut. ${run.score} poäng. Klicka för att börja om.`;
    field.setAttribute('aria-label', 'Försök igen. Klicka eller tryck mellanslag för att starta.');
    return;
  }
  frame = requestAnimationFrame(tick);
}

function start() {
  cancelAnimationFrame(frame);
  run = createRun();
  player.classList.remove('runner-catch');
  previous = 0;
  accumulator = 0;
  lastScore = 0;
  score.textContent = '00 POÄNG';
  overlay.hidden = true;
  gameWindow.dataset.state = 'running';
  hint.textContent = 'Klicka / mellanslag = hoppa. Missa ingen stjärna!';
  field.setAttribute('aria-label', 'Hoppa och fånga stjärnan');
  render();
  frame = requestAnimationFrame(tick);
}

function activate() {
  if (!run || run.status === 'over') start();
  else if (run.status === 'paused') {
    run.status = 'running';
    previous = 0;
    overlay.hidden = true;
    gameWindow.dataset.state = 'running';
    hint.textContent = 'Klicka / mellanslag = hoppa. Missa ingen stjärna!';
    field.setAttribute('aria-label', 'Hoppa och fånga stjärnan');
    frame = requestAnimationFrame(tick);
  } else jump(run);
}

field.addEventListener('click', activate);
field.addEventListener('keydown', event => {
  if ([' ', 'ArrowUp', 'Enter'].includes(event.key)) {
    event.preventDefault(); // Prevent scrolling and the button's synthetic second click.
    if (!event.repeat) activate();
  }
});
document.getElementById('resetGame').addEventListener('click', () => {
  start();
  field.focus({ preventScroll: true });
});

function pause() {
  if (run?.status !== 'running') return;
  run.status = 'paused';
  cancelAnimationFrame(frame);
  overlay.replaceChildren();
  const title = document.createElement('strong');
  title.textContent = 'Liten paus.';
  const instruction = document.createElement('span');
  instruction.textContent = 'Klicka för att fortsätta';
  overlay.append(title, instruction);
  overlay.hidden = false;
  gameWindow.dataset.state = 'paused';
  hint.textContent = 'Spelet är pausat. Klicka för att fortsätta.';
  field.setAttribute('aria-label', 'Fortsätt spelet');
}
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
window.addEventListener('blur', pause);
new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting) pause();
}).observe(field);
