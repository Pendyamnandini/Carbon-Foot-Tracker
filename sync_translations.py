import os
from deep_translator import GoogleTranslator

# Run this script to sync missing keys from 'en' to all other 100 languages in frontend/public/locales
locales_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'public', 'locales')
en_dir = os.path.join(locales_dir, 'en')

if not os.path.exists(en_dir):
    print("English locales not found!")
    exit(1)

namespaces = [f for f in os.listdir(en_dir) if f.endswith('.json')]
languages = [d for d in os.listdir(locales_dir) if os.path.isdir(os.path.join(locales_dir, d)) and d != 'en']

for ns in namespaces:
    en_file = os.path.join(en_dir, ns)
    with open(en_file, 'r', encoding='utf-8') as f:
        import json
        en_data = json.load(f)

    for lang in languages:
        gt_lang = lang.lower()
        if gt_lang == 'zh_cn': gt_lang = 'zh-CN'
        elif gt_lang == 'zh_tw': gt_lang = 'zh-TW'
        
        translator = GoogleTranslator(source='auto', target=gt_lang)
        
        lang_file = os.path.join(locales_dir, lang, ns)
        lang_data = {}
        if os.path.exists(lang_file):
            with open(lang_file, 'r', encoding='utf-8') as f:
                try:
                    lang_data = json.load(f)
                except json.JSONDecodeError:
                    pass

        missing_keys = []
        for key, text in en_data.items():
            if key not in lang_data or lang_data[key] == text:
                if any(c.isalpha() for c in text): # Only translate if it contains letters
                    missing_keys.append((key, text))
                else:
                    lang_data[key] = text
        
        if missing_keys:
            print(f"Translating {len(missing_keys)} missing keys for {lang}/{ns}...")
            texts_to_translate = [t for k, t in missing_keys]
            try:
                # Deep translator batches internally
                translated_texts = translator.translate_batch(texts_to_translate)
                for i, (key, text) in enumerate(missing_keys):
                    if translated_texts[i]:
                        lang_data[key] = translated_texts[i]
                    else:
                        lang_data[key] = text
            except Exception as e:
                print(f"Failed translation for {lang}/{ns}: {e}")
                for key, text in missing_keys:
                    lang_data[key] = text # Fallback to English

            # Save the file back
            os.makedirs(os.path.dirname(lang_file), exist_ok=True)
            with open(lang_file, 'w', encoding='utf-8') as f:
                json.dump(lang_data, f, ensure_ascii=False, indent=2)

print("Frontend missing translations synced!")
