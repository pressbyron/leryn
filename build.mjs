import { mkdir, copyFile, rm, cp } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'style.css', 'script.js', 'runner.mjs', 'runner-engine.mjs', 'booking-config.js', 'favicon.svg', '.nojekyll']) {
  await copyFile(file, `dist/${file}`);
}
await cp('assets', 'dist/assets', { recursive: true });
console.log('Zento built → dist/');
