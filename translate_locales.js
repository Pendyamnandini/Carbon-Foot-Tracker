const fs = require('fs');
const path = require('path');
const { translate } = require('@vitalets/google-translate-api');

const localesDir = path.join(__dirname, 'frontend', 'public', 'locales');
const enDir = path.join(localesDir, 'en');
const namespaces = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));
const langs = fs.readdirSync(localesDir).filter(f => fs.statSync(path.join(localesDir, f)).isDirectory() && f !== 'en');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  for (const lang of langs) {
    console.log(`\nProcessing language: ${lang}`);
    const langDir = path.join(localesDir, lang);
    
    for (const ns of namespaces) {
      const enData = JSON.parse(fs.readFileSync(path.join(enDir, ns), 'utf8'));
      const langFilePath = path.join(langDir, ns);
      
      let langData = {};
      if (fs.existsSync(langFilePath)) {
        try {
          langData = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
        } catch (e) {
          console.error(`Failed to parse ${langFilePath}`);
        }
      }

      let updated = false;

      // Ensure all enData keys exist in langData and are translated
      for (const [key, text] of Object.entries(enData)) {
        if (!langData[key] || langData[key] === text) {
          // If missing or same as English (and English text is not just a symbol)
          if (typeof text === 'string' && text.match(/[a-zA-Z]/)) {
            try {
              console.log(`Translating [${lang}] ${ns}:${key} = "${text}"`);
              const res = await translate(text, { to: lang });
              langData[key] = res.text;
              updated = true;
              await sleep(100); // Prevent rate limiting
            } catch (err) {
              console.error(`Translation failed for ${key}:`, err.message);
            }
          } else {
            // Numbers, symbols, etc.
            langData[key] = text;
            updated = true;
          }
        }
      }

      if (updated) {
        fs.writeFileSync(langFilePath, JSON.stringify(langData, null, 2));
        console.log(`Updated ${lang}/${ns}`);
      }
    }
  }
  console.log('All translations completed!');
}

run();
