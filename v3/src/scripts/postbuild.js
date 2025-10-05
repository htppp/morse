const fs = require('fs');
const path = require('path');

// paths
const repoRoot = path.resolve(__dirname, '..', '..'); // .../morse
const srcDir = path.resolve(__dirname, '..'); // .../morse/v3/src
const distIndex = path.join(srcDir, 'dist', 'index.html');
const targetRootIndex = path.join(repoRoot, 'v3', 'index.html');

const rootFlashcard = path.join(repoRoot, 'flashcard.tsv');
const srcDataDir = path.join(srcDir, 'data');
const distDataDir = path.join(repoRoot, 'v3', 'data');

function copyIfExists(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return true;
}

try {
  // copy built index.html to repo v3/index.html
  if (copyIfExists(distIndex, targetRootIndex)) {
    console.log(`Copied ${distIndex} -> ${targetRootIndex}`);
  } else {
    console.warn(`Build output not found: ${distIndex}`);
  }

  // propagate root flashcard.tsv to v3/src/data and v3/data
  if (copyIfExists(rootFlashcard, path.join(srcDataDir, 'flashcard.tsv'))) {
    console.log(`Copied ${rootFlashcard} -> ${path.join(srcDataDir, 'flashcard.tsv')}`);
  } else {
    console.warn(`Root flashcard not found: ${rootFlashcard}`);
  }

  if (copyIfExists(rootFlashcard, path.join(distDataDir, 'flashcard.tsv'))) {
    console.log(`Copied ${rootFlashcard} -> ${path.join(distDataDir, 'flashcard.tsv')}`);
  } else {
    console.warn(`Root flashcard not found for v3/dist: ${rootFlashcard}`);
  }

  process.exit(0);
} catch (err) {
  console.error('postbuild failed', err);
  process.exit(1);
}
