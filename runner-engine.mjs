// Fixed logical coordinates keep gameplay identical at every display size.
export const PLAYER = { x: 64, width: 24, height: 28 };
export function createRun() {
  return { status: 'running', score: 0, y: 0, velocity: 0, starX: 310, starY: 57, speed: 125, distance: 0 };
}
export function jump(run) {
  if (run.status === 'running' && run.y === 0) run.velocity = 285;
}
export function stepRun(run, dt) {
  if (run.status !== 'running') return;
  // Caller uses a fixed step so background-tab stalls cannot skip a star.
  run.velocity -= 800 * dt;
  run.y = Math.max(0, run.y + run.velocity * dt);
  if (run.y === 0 && run.velocity < 0) run.velocity = 0;
  run.starX -= run.speed * dt;
  run.distance += run.speed * dt;
  const overlaps = run.starX < PLAYER.x + PLAYER.width && run.starX + 18 > PLAYER.x
    && run.starY < run.y + PLAYER.height && run.starY + 18 > run.y;
  if (overlaps) {
    run.score += 10;
    run.speed = Math.min(180, 125 + run.score * 0.55);
    run.starX = 310;
  } else if (run.starX + 18 < PLAYER.x) {
    run.status = 'over';
  }
}
