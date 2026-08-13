const fs = require('fs');
const path = require('path');
const { translate } = require('@vitalets/google-translate-api');

const localesDir = path.join(__dirname, 'frontend', 'public', 'locales');
const enDir = path.join(localesDir, 'en');
const namespaces = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));
const langs = fs.readdirSync(localesDir).filter(f => fs.statSync(path.join(localesDir, f)).isDirectory() && f !== 'en');

async function run() {
  for (const lang of langs) {
    console.log(`Processing ${lang}...`);
    const langDir = path.join(localesDir, lang);
    
    const missingKeys = [];
    const fileData = {}; 
    
    for (const ns of namespaces) {
      const enData = JSON.parse(fs.readFileSync(path.join(enDir, ns), 'utf8'));
      const langFilePath = path.join(langDir, ns);
      
      let langData = {};
      if (fs.existsSync(langFilePath)) {
        try { langData = JSON.parse(fs.readFileSync(langFilePath, 'utf8')); } catch(e){}
      }
      fileData[ns] = langData;
      
      for (const [key, text] of Object.entries(enData)) {
        if (!langData[key] || langData[key] === text) {
          if (typeof text === 'string' && text.match(/[a-zA-Z]/)) {
            missingKeys.push({ ns, key, text: text.replace(/\n/g, ' ') });
          } else {
            langData[key] = text;
          }
        }
      }
    }
    
    if (missingKeys.length > 0) {
      console.log(`Translating ${missingKeys.length} keys for ${lang}...`);
      
      const chunks = [];
      for(let i=0; i<missingKeys.length; i+=50) {
        chunks.push(missingKeys.slice(i, i+50));
      }
      
      for(const chunk of chunks) {
        const textToTranslate = chunk.map(k => k.text).join(' \n|||\n ');
        try {
          const res = await translate(textToTranslate, { to: lang });
          const translatedArray = res.text.split(/(?:\|\|\||\|\||\|\| \|\s*)/i).map(s => s.trim());
          
          for(let i=0; i<chunk.length; i++) {
             const m = chunk[i];
             if (translatedArray[i] && translatedArray[i].length > 0) {
                fileData[m.ns][m.key] = translatedArray[i].replace(/^['"]|['"]$/g, '');
             } else {
                fileData[m.ns][m.key] = m.text; 
             }
          }
          await new Promise(r => setTimeout(r, 200)); 
        } catch(e) {
          console.error(`Failed translation chunk for ${lang}:`, e.message);
          // If translation fails, copy English
          for(let i=0; i<chunk.length; i++) {
             fileData[chunk[i].ns][chunk[i].key] = chunk[i].text;
          }
        }
      }
      
      for(const ns of namespaces) {
         fs.writeFileSync(path.join(langDir, ns), JSON.stringify(fileData[ns], null, 2));
      }
    }
  }
}
run();
