import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');

if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist');
  process.exit(1);
}

// 1. Ensure dist/index.html exists from dist/template.html
if (fs.existsSync(path.join(distDir, 'template.html'))) {
  fs.copyFileSync(path.join(distDir, 'template.html'), path.join(distDir, 'index.html'));
}

// 2. Sync to docs directory
fs.cpSync(distDir, path.resolve('docs'), { recursive: true });

// 3. Sync assets to root /assets
if (fs.existsSync(path.join(distDir, 'assets'))) {
  fs.cpSync(path.join(distDir, 'assets'), path.resolve('assets'), { recursive: true });
}

// 4. Sync root files: index.html, manifest, sw.js, workbox, etc.
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  fs.copyFileSync(path.join(distDir, 'index.html'), path.resolve('index.html'));
}

for (const file of fs.readdirSync(distDir)) {
  if (file.endsWith('.js') || file.endsWith('.webmanifest')) {
    fs.copyFileSync(path.join(distDir, file), path.resolve(file));
  }
}

console.log('Successfully synced production build to root assets, root index.html, and docs/');
