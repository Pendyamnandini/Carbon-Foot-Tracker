import json
import os
import sys
from deep_translator import GoogleTranslator
import time

sys.stdout.reconfigure(encoding='utf-8')

LANGS = {
    'hi': 'hindi',
    'bn': 'bengali',
    'mr': 'marathi',
    'gu': 'gujarati',
    'or': 'odia',
    'pa': 'punjabi',
    'ur': 'urdu',
    'te': 'telugu',
    'ta': 'tamil',
    'kn': 'kannada',
    'ml': 'malayalam'
}

EN_PATH = 'public/locales/en/translation.json'

with open(EN_PATH, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

for code, lang_name in LANGS.items():
    print(f'Translating to {code}...')
    target_path = f'public/locales/{code}/translation.json'
    
    os.makedirs(f'public/locales/{code}', exist_ok=True)
    
    if os.path.exists(target_path):
        with open(target_path, 'r', encoding='utf-8') as f:
            target_data = json.load(f)
    else:
        target_data = {}
        
    translator = GoogleTranslator(source='en', target=code)
    
    count = 0
    for key, value in en_data.items():
        if key not in target_data or target_data[key] == value:
            try:
                # Add tiny sleep to avoid rate limits
                time.sleep(0.01)
                translated = translator.translate(value)
                if translated:
                    target_data[key] = translated
                else:
                    target_data[key] = value
                count += 1
            except Exception as e:
                target_data[key] = value
                
    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(target_data, f, ensure_ascii=False, indent=2)
        
print('Done!')
