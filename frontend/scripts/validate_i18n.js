const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'public', 'locales');
const supportedLangs = ['en', 'fr', 'de', 'hi', 'it', 'ja', 'kn', 'ml', 'pt', 'es', 'ta', 'te'];
const sourceLang = 'en';

let hasErrors = false;

// 1. Read source JSON
const sourcePath = path.join(localesDir, sourceLang, 'translation.json');
let sourceObj = {};
try {
  const content = fs.readFileSync(sourcePath, 'utf8');
  sourceObj = JSON.parse(content);
} catch (e) {
  console.error(`ERROR: Failed to read source file ${sourcePath}`);
  console.error(e.message);
  process.exit(1);
}

const sourceKeys = Object.keys(sourceObj);
console.log(`Source (English) has ${sourceKeys.length} keys.`);

// 2. Validate other languages
supportedLangs.forEach(lang => {
  if (lang === sourceLang) return;
  const langPath = path.join(localesDir, lang, 'translation.json');
  let langObj = {};
  
  if (!fs.existsSync(langPath)) {
    console.error(`ERROR: Missing translation file for ${lang}`);
    hasErrors = true;
    return;
  }

  try {
    const content = fs.readFileSync(langPath, 'utf8');
    langObj = JSON.parse(content);
  } catch (e) {
    console.error(`ERROR: Malformed JSON in ${langPath}`);
    console.error(e.message);
    hasErrors = true;
    return;
  }

  const langKeys = Object.keys(langObj);

  // Missing keys
  const missingKeys = sourceKeys.filter(k => !langKeys.includes(k) || !langObj[k] || langObj[k].trim() === '');
  if (missingKeys.length > 0) {
    console.error(`ERROR: [${lang}] Missing or empty translations for ${missingKeys.length} keys:`);
    console.error(`  ${missingKeys.slice(0, 5).join(', ')}${missingKeys.length > 5 ? ' ...' : ''}`);
    hasErrors = true;
  }

  // Extra keys
  const extraKeys = langKeys.filter(k => !sourceKeys.includes(k));
  if (extraKeys.length > 0) {
    console.warn(`WARN: [${lang}] Has ${extraKeys.length} extra keys not present in English.`);
  }

  // Placeholder mismatches (very basic check for {{var}})
  const placeholderRegex = /{{(.*?)}}/g;
  sourceKeys.forEach(key => {
    if (langObj[key]) {
      const sourceMatches = (sourceObj[key].match(placeholderRegex) || []).sort();
      const langMatches = (langObj[key].match(placeholderRegex) || []).sort();
      
      if (sourceMatches.join(',') !== langMatches.join(',')) {
        console.error(`ERROR: [${lang}] Placeholder mismatch for key "${key}"`);
        console.error(`  Expected: ${sourceMatches.join(', ')}`);
        console.error(`  Found:    ${langMatches.join(', ')}`);
        hasErrors = true;
      }
    }
  });
});

if (hasErrors) {
  console.error('\nValidation FAILED.');
  process.exit(1);
} else {
  console.log('\nValidation PASSED. All required keys and placeholders match.');
  process.exit(0);
}
