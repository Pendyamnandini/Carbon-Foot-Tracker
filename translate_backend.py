import os
from deep_translator import GoogleTranslator

properties_dir = os.path.join(os.path.dirname(__file__), 'backend', 'src', 'main', 'resources')
en_file = os.path.join(properties_dir, 'messages.properties')

langs = ['ar', 'bn', 'de', 'es', 'fr', 'hi', 'ja', 'te', 'zh_CN', 'zh_TW']

# Parse English messages
en_data = {}
with open(en_file, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#'): continue
        if '=' in line:
            key, val = line.split('=', 1)
            en_data[key.strip()] = val.strip()

for lang in langs:
    print(f"Processing backend {lang}...")
    lang_file = os.path.join(properties_dir, f"messages_{lang}.properties")
    
    gt_lang = lang.lower()
    if gt_lang == 'zh_cn': gt_lang = 'zh-CN'
    elif gt_lang == 'zh_tw': gt_lang = 'zh-TW'
    
    translator = GoogleTranslator(source='auto', target=gt_lang)
    
    lang_data = {}
    if os.path.exists(lang_file):
        with open(lang_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'): continue
                if '=' in line:
                    key, val = line.split('=', 1)
                    lang_data[key.strip()] = val.strip()
    
    missing_keys = []
    for key, text in en_data.items():
        if key not in lang_data or lang_data[key] == text:
            if any(c.isalpha() for c in text):
                missing_keys.append((key, text))
            else:
                lang_data[key] = text
                
    if missing_keys:
        print(f"Translating {len(missing_keys)} keys for {lang}...")
        texts_to_translate = [t for k, t in missing_keys]
        try:
            translated_texts = translator.translate_batch(texts_to_translate)
            for i, (key, text) in enumerate(missing_keys):
                if translated_texts[i]:
                    lang_data[key] = translated_texts[i]
                else:
                    lang_data[key] = text
        except Exception as e:
            print(f"Translation failed for {lang}: {e}")
            for key, text in missing_keys:
                lang_data[key] = text
    
    with open(lang_file, 'w', encoding='utf-8') as f:
        for key, text in lang_data.items():
            f.write(f"{key}={text}\n")

print("Backend Translation complete!")
