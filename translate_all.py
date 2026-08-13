import os
import json
import time
from deep_translator import GoogleTranslator

locales_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'public', 'locales')
en_dir = os.path.join(locales_dir, 'en')

namespaces = [f for f in os.listdir(en_dir) if f.endswith('.json')]
langs = [f for f in os.listdir(locales_dir) if os.path.isdir(os.path.join(locales_dir, f)) and f != 'en']

# Focus on priority languages first, then the rest
priority = ['hi', 'te', 'bn', 'ta', 'kn', 'ml', 'mr', 'gu', 'pa', 'ur', 'fr', 'es', 'de', 'it', 'pt', 'nl', 'ru', 'ja', 'ko', 'zh_CN', 'zh_TW', 'ar']
langs = sorted(langs, key=lambda x: 0 if x in priority else 1)

en_data = {}
for ns in namespaces:
    with open(os.path.join(en_dir, ns), 'r', encoding='utf-8') as f:
        en_data[ns] = json.load(f)

for lang in langs:
    print(f"\n--- Processing {lang} ---")
    lang_dir = os.path.join(locales_dir, lang)
    
    gt_lang = lang.lower()
    if gt_lang == 'zh_cn': gt_lang = 'zh-CN'
    elif gt_lang == 'zh_tw': gt_lang = 'zh-TW'
    elif gt_lang == 'fil': gt_lang = 'tl'
    
    try:
        translator = GoogleTranslator(source='auto', target=gt_lang)
    except Exception as e:
        print(f"Skipping {lang} due to unsupported code")
        continue

    for ns in namespaces:
        lang_file = os.path.join(lang_dir, ns)
        lang_data = {}
        if os.path.exists(lang_file):
            try:
                with open(lang_file, 'r', encoding='utf-8') as f:
                    lang_data = json.load(f)
            except:
                pass
        
        missing_keys = []
        for key, text in en_data[ns].items():
            if key not in lang_data or lang_data[key] == text:
                if isinstance(text, str) and any(c.isalpha() for c in text):
                    missing_keys.append((key, text))
                else:
                    lang_data[key] = text
        
        if not missing_keys:
            continue
            
        print(f"Translating {len(missing_keys)} keys for {lang}/{ns}...")
        
        # Batch translate
        texts_to_translate = [t for k, t in missing_keys]
        try:
            # deep-translator supports translate_batch
            translated_texts = translator.translate_batch(texts_to_translate)
            for i, (key, text) in enumerate(missing_keys):
                if translated_texts[i]:
                    lang_data[key] = translated_texts[i]
                else:
                    lang_data[key] = text
        except Exception as e:
            print(f"Batch translation failed for {lang}/{ns}: {e}")
            for key, text in missing_keys:
                lang_data[key] = text
                
        with open(lang_file, 'w', encoding='utf-8') as f:
            json.dump(lang_data, f, ensure_ascii=False, indent=2)
            
print("\nTranslation complete!")
