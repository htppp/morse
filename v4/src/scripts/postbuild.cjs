const fs = require('fs');
const path = require('path');

// paths
// __dirname === .../morse/v4/src/scripts
const repoRoot = path.resolve(__dirname, '..', '..', '..'); // .../morse
const srcDir = path.join(repoRoot, 'v4', 'src'); // .../morse/v4/src
const distDir = path.join(srcDir, 'dist');
const targetDir = path.join(repoRoot, 'v4'); // .../morse/v4

function copyIfExists(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return true;
}

try {
  // copy built HTML files from dist subdirectories to v4/ root
  const pages = [
    { dir: 'menu', output: 'index.html' },
    { dir: 'vertical', output: 'vertical.html' },
    { dir: 'horizontal', output: 'horizontal.html' },
    { dir: 'flashcard', output: 'flashcard.html' },
    { dir: 'koch', output: 'koch.html' },
  ];

  for (const page of pages) {
    const srcFile = path.join(distDir, page.dir, 'index.html');
    const destFile = path.join(targetDir, page.output);

    if (copyIfExists(srcFile, destFile)) {
      console.log(`Copied ${srcFile} -> ${destFile}`);
    } else {
      console.warn(`Build output not found: ${srcFile}`);
    }
  }

  process.exit(0);
} catch (err) {
  console.error('postbuild failed', err);
  process.exit(1);
}
