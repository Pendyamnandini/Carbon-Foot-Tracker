const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');
const enDir = path.join(localesDir, 'en');

const namespaces = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));
const langs = fs.readdirSync(localesDir).filter(f => fs.statSync(path.join(localesDir, f)).isDirectory());

langs.forEach(lang => {
  if (lang === 'en') return;
  const langDir = path.join(localesDir, lang);
  
  namespaces.forEach(ns => {
    const enData = JSON.parse(fs.readFileSync(path.join(enDir, ns), 'utf8'));
    const langFilePath = path.join(langDir, ns);
    let langData = {};
    if (fs.existsSync(langFilePath)) {
      try {
        langData = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
      } catch (e) {}
    } else {
        fs.writeFileSync(langFilePath, '{}');
    }
    
    let updated = false;
    // Iterate nested keys if any (or simple keys)
    // For simplicity, Assuming flat keys as in common JSON structure for i18next, or 1 level deep.
    // If they are nested, we can just do a simple flat Object.keys or a deep merge.
    
    const flattenKeys = (obj, prefix = '') => {
        let keys = [];
        for(let k in obj) {
            if(typeof obj[k] === 'object' && obj[k] !== null) {
                keys = keys.concat(flattenKeys(obj[k], prefix + k + '.'));
            } else {
                keys.push(prefix + k);
            }
        }
        return keys;
    };
    
    // Actually, just looping over the first level is usually enough. Let's do a simple recursive merge.
    const mergeObj = (base, target) => {
        let changed = false;
        for (let key in base) {
            if (target[key] === undefined) {
                target[key] = base[key];
                changed = true;
            } else if (typeof base[key] === 'object' && base[key] !== null && typeof target[key] === 'object' && target[key] !== null) {
                if (mergeObj(base[key], target[key])) {
                    changed = true;
                }
            }
        }
        return changed;
    };
    
    updated = mergeObj(enData, langData);
    
    if (updated) {
      fs.writeFileSync(langFilePath, JSON.stringify(langData, null, 2));
    }
  });
});
console.log('Finished merging locales!');
