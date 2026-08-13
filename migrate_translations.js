const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('frontend/src/components/translations.js', 'utf8');
const match = content.match(/const TRANSLATIONS = (\{[\s\S]*?\});\s*export const translate/);
if (!match) {
  console.log('No translations match found');
  process.exit(1);
}

const TRANSLATIONS = eval('(' + match[1] + ')');

const localesDir = path.join(__dirname, 'frontend', 'public', 'locales');
const enDir = path.join(localesDir, 'en');
const namespaces = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));

const langs = fs.readdirSync(localesDir).filter(f => fs.statSync(path.join(localesDir, f)).isDirectory() && f !== 'en');

for (const lang of langs) {
  const langDir = path.join(localesDir, lang);
  const langTranslations = TRANSLATIONS[lang] || TRANSLATIONS[lang.split('_')[0]];
  
  if (!langTranslations) {
     console.log(`No TRANSLATIONS entry for ${lang}`);
     continue;
  }
  
  for (const ns of namespaces) {
    const enData = JSON.parse(fs.readFileSync(path.join(enDir, ns), 'utf8'));
    const langFilePath = path.join(langDir, ns);
    
    let langData = {};
    if (fs.existsSync(langFilePath)) {
      try { langData = JSON.parse(fs.readFileSync(langFilePath, 'utf8')); } catch(e){}
    }
    
    let updated = false;
    for (const key of Object.keys(enData)) {
      if (langTranslations[key] && langTranslations[key] !== enData[key]) {
         langData[key] = langTranslations[key];
         updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(langFilePath, JSON.stringify(langData, null, 2));
    }
  }
}
console.log('Successfully injected translations.js strings into locales JSON!');
