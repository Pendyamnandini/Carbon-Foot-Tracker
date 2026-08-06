const fs = require('fs');
const path = require('path');

// The script operates directly in the locales directory containing language subfolders.
const localesRoot = __dirname; // Current directory where this script resides

function cleanJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse JSON:', filePath, e);
    return;
  }
  let changed = false;
  for (const key of Object.keys(data)) {
    if (typeof data[key] === 'string') {
      const cleaned = data[key].replace(/^\[[^\]]+\]\s*/, '');
      if (cleaned !== data[key]) {
        data[key] = cleaned;
        changed = true;
      }
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Cleaned', filePath);
  }
}

fs.readdirSync(localesRoot, { withFileTypes: true }).forEach(dirent => {
  if (dirent.isDirectory()) {
    const langDir = path.join(localesRoot, dirent.name);
    fs.readdirSync(langDir).forEach(file => {
      if (file.endsWith('.json')) {
        cleanJsonFile(path.join(langDir, file));
      }
    });
  }
});

console.log('All locale JSON files processed.');
