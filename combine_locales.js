const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend', 'public', 'locales');
const namespaces = [
  'common', 'dashboard', 'analytics', 'profile', 'support', 
  'admin', 'landing', 'auth', 'reports', 'settings'
];

const supportedLangs = ['en', 'fr', 'de', 'hi', 'it', 'ja', 'kn', 'ml', 'pt', 'es', 'ta', 'te'];

supportedLangs.forEach(lang => {
  const langDir = path.join(localesDir, lang);
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }

  let translation = {};
  namespaces.forEach(ns => {
    const nsPath = path.join(langDir, `${ns}.json`);
    if (fs.existsSync(nsPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(nsPath, 'utf8'));
        translation = { ...translation, ...data };
        fs.unlinkSync(nsPath);
      } catch (e) {
        console.error(`Error reading ${nsPath}:`, e);
      }
    }
  });

  fs.writeFileSync(path.join(langDir, 'translation.json'), JSON.stringify(translation, null, 2), 'utf8');
});

// Also remove unsupported language directories to clean up
const allDirs = fs.readdirSync(localesDir);
allDirs.forEach(dir => {
  if (fs.statSync(path.join(localesDir, dir)).isDirectory() && !supportedLangs.includes(dir)) {
    fs.rmSync(path.join(localesDir, dir), { recursive: true, force: true });
  }
});
console.log('Combined locales flatly!');
