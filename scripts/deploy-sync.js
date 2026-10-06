import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');

if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist');
  process.exit(1);
}

// 1. Sync to docs directory
fs.cpSync(distDir, path.resolve('docs'), { recursive: true });

// 2. Sync assets to root /assets
if (fs.existsSync(path.join(distDir, 'assets'))) {
  fs.cpSync(path.join(distDir, 'assets'), path.resolve('assets'), { recursive: true });
}

// 3. Sync root files: manifest, sw.js, workbox, index.html
const filesToCopy = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
];

for (const file of fs.readdirSync(distDir)) {
  if (file.endsWith('.js') || file.endsWith('.webmanifest') || file === 'index.html') {
    fs.copyFileSync(path.join(distDir, file), path.resolve(file));
  }
}

console.log('Successfully synced production build to root assets and docs/');
