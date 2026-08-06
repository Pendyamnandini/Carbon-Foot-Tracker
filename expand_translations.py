import re
import json

filepath = r"C:\Users\Nandi\.gemini\antigravity\scratch\carbon-tracker\frontend\src\components\translations.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# We can match the object structure
match = re.search(r"const TRANSLATIONS = (\{.*?\});\s*export const translate", content, re.DOTALL)
if not match:
    print("Could not match TRANSLATIONS object")
    exit(1)

# Let's parse or modify textually.
# Since translations.js is valid JS, we can extract the dictionaries language by language.
# Let's add keys to the TRANSLATIONS object using dictionary mapping.

ADDITIONAL_KEYS = {
    # Navigation
    "nav.dashboard": {
        "en": "Dashboard", "es": "Tablero", "fr": "Tableau de bord", "de": "Dashboard", "hi": "डैशबोर्ड", "te": "డాష్‌బోర్డ్", "ar": "لوحة القيادة", "ja": "ダッシュボード", "zh_CN": "仪表板"
    },
    "nav.analytics": {
        "en": "Analytics", "es": "Analítica", "fr": "Analytiques", "de": "Analysen", "hi": "विश्लेषण", "te": "విశ్లేషణలు", "ar": "التحليلات", "ja": "分析", "zh_CN": "数据分析"
    },
    "nav.activity_logs": {
        "en": "Activity Logs", "es": "Registros de Actividad", "fr": "Journaux d'activité", "de": "Aktivitätsprotokolle", "hi": "गतिविधि लॉग", "te": "కార్యకలాపాల లాగ్స్", "ar": "سجلات النشاط", "ja": "活動ログ", "zh_CN": "活动日志"
    },
    "nav.goals": {
        "en": "Goals", "es": "Metas", "fr": "Objectifs", "de": "Ziele", "hi": "लक्ष्य", "te": "లక్ష్యాలు", "ar": "الأهداف", "ja": "目標", "zh_CN": "目标"
    },
    "nav.recommendations": {
        "en": "Recommendations", "es": "Recomendaciones", "fr": "Recommandations", "de": "Empfehlungen", "hi": "सिफारिशें", "te": "సిఫార్సులు", "ar": "التوصيات", "ja": "おすすめ", "zh_CN": "系统推荐"
    },
    "nav.sustainability_score": {
        "en": "Sustainability Score", "es": "Puntuación de Sostenibilidad", "fr": "Score de durabilité", "de": "Nachhaltigkeits-Score", "hi": "स्थिरता स्कोर", "te": "స్థిరత్వ స్కోరు", "ar": "درجة الاستدامة", "ja": "持続可能性スコア", "zh_CN": "可持续发展评分"
    },
    "nav.benchmarking": {
        "en": "Benchmarking", "es": "Evaluación Comparativa", "fr": "Analyse comparative", "de": "Benchmarking", "hi": "बेंचमार्किंग", "te": "బెంచ్‌మార్కింగ్", "ar": "المقارنة المرجعية", "ja": "ベンチマーク", "zh_CN": "行业基准"
    },
    "nav.leaderboard": {
        "en": "Leaderboard", "es": "Tabla de Clasificación", "fr": "Classement", "de": "Bestenliste", "hi": "लीडरबोर्ड", "te": "లీడర్‌బోర్డ్", "ar": "لوحة الصدارة", "ja": "リーダーボード", "zh_CN": "排行榜"
    },
    "nav.reports": {
        "en": "Reports", "es": "Informes", "fr": "Rapports", "de": "Berichte", "hi": "रिपोर्ट", "te": "నివేదికలు", "ar": "التقارير", "ja": "レポート", "zh_CN": "数据报表"
    },
    "nav.profile": {
        "en": "Profile", "es": "Perfil", "fr": "Profil", "de": "Profil", "hi": "प्रोफ़ाइल", "te": "ప్రొఫైల్", "ar": "الملف الشخصي", "ja": "プロフィール", "zh_CN": "个人资料"
    },
    "nav.settings": {
        "en": "Settings", "es": "Configuración", "fr": "Paramètres", "de": "Einstellungen", "hi": "सेटिंग्स", "te": "సెట్టింగులు", "ar": "الإعدادات", "ja": "設定", "zh_CN": "设置"
    },
    "nav.support": {
        "en": "Support", "es": "Soporte", "fr": "Assistance", "de": "Support", "hi": "सहायता", "te": "మద్దతు", "ar": "الدعم", "ja": "サポート", "zh_CN": "客服支持"
    },
    "nav.joincreate_org": {
        "en": "Join/Create Org", "es": "Unirse/Crear Org", "fr": "Rejoindre/Créer Org", "de": "Org beitreten/erstellen", "hi": "संगठन में शामिल हों/बनाएं", "te": "సంస్థలో చేరండి/సృష్టించండి", "ar": "الانضمام/إنشاء مؤسسة", "ja": "組織に参加/作成", "zh_CN": "加入/创建组织"
    },
    "nav.admin_dashboard": {
        "en": "Admin Dashboard", "es": "Tablero de Administrador", "fr": "Tableau de bord Admin", "de": "Admin-Dashboard", "hi": "एडमिन डैशबोर्ड", "te": "అడ్మిన్ డాష్‌బోర్డ్", "ar": "لوحة تحكم المسؤول", "ja": "管理者ダッシュボード", "zh_CN": "管理员控制台"
    },
    "nav.user_analytics": {
        "en": "User Analytics", "es": "Analítica de Usuarios", "fr": "Analyses utilisateur", "de": "Benutzeranalysen", "hi": "उपयोगकर्ता विश्लेषण", "te": "వినియోగదారుల విశ్లేషణలు", "ar": "تحليلات المستخدم", "ja": "ユーザー分析", "zh_CN": "用户分析"
    },
    "nav.platform_analytics": {
        "en": "Platform Analytics", "es": "Analítica de Plataforma", "fr": "Analyses plateforme", "de": "Plattformanalysen", "hi": "प्लेटफ़ॉर्म विश्लेषण", "te": "ప్లాట్‌ఫాం విశ్లేషణలు", "ar": "تحليلات المنصة", "ja": "プラットフォーム分析", "zh_CN": "平台运营分析"
    },
    "nav.emission_factors": {
        "en": "Emission Factors", "es": "Factores de Emisión", "fr": "Facteurs d'émission", "de": "Emissionsfaktoren", "hi": "उत्सर्जन कारक", "te": "ఉద్గార కారకాలు", "ar": "عوامل الانبعاثات", "ja": "排出係数", "zh_CN": "碳排放因子"
    },
    "nav.feedback_management": {
        "en": "Feedback Management", "es": "Gestión de Comentarios", "fr": "Gestion des retours", "de": "Feedback-Management", "hi": "प्रतिक्रिया प्रबंधन", "te": "అభిప్రాయాల నిర్వహణ", "ar": "إدارة التعليقات", "ja": "フィードバック管理", "zh_CN": "反馈管理"
    },
    "nav.support_management": {
        "en": "Support Management", "es": "Gestión de Soporte", "fr": "Gestion du support", "de": "Support-Management", "hi": "सहायता प्रबंधन", "te": "మద్దతు నిర్వహణ", "ar": "إدارة الدعم", "ja": "サポート管理", "zh_CN": "客服工单管理"
    },
    "nav.organization_analytics": {
        "en": "Organization Analytics", "es": "Analítica de Organizaciones", "fr": "Analyses organisation", "de": "Organisationsanalysen", "hi": "संगठन विश्लेषण", "te": "సంస్థ విశ్లేషణలు", "ar": "تحليلات المؤسسة", "ja": "組織分析", "zh_CN": "组织分析"
    },

    # Authentication Page labels
    "auth.login": {
        "en": "Login", "es": "Iniciar Sesión", "fr": "Connexion", "de": "Anmelden", "hi": "लॉगिन", "te": "లాగిన్", "ar": "تسجيل الدخول", "ja": "ログイン", "zh_CN": "登录"
    },
    "auth.register": {
        "en": "Register", "es": "Registrarse", "fr": "S'inscrire", "de": "Registrieren", "hi": "रजिस्टर", "te": "నమోదు", "ar": "تسجيل", "ja": "新規登録", "zh_CN": "注册"
    },
    "auth.forgot_password": {
        "en": "Forgot Password?", "es": "¿Olvidó su contraseña?", "fr": "Mot de passe oublié ?", "de": "Passwort vergessen?", "hi": "पासवर्ड भूल गए?", "te": "పాస్‌వర్డ్ మర్చిపోయారా?", "ar": "هل نسيت كلمة المرور؟", "ja": "パスワードをお忘れですか？", "zh_CN": "忘记密码？"
    },
    "auth.reset_password": {
        "en": "Reset Password", "es": "Restablecer Contraseña", "fr": "Réinitialiser le mot de passe", "de": "Passwort zurücksetzen", "hi": "पासवर्ड रीसेट करें", "te": "పాస్‌వర్డ్ రీసెట్ చేయండి", "ar": "إعادة تعيين كلمة المرور", "ja": "パスワード再設定", "zh_CN": "重置密码"
    },
    "auth.email": {
        "en": "Email Address", "es": "Correo Electrónico", "fr": "Adresse e-mail", "de": "E-Mail-Adresse", "hi": "ईमेल पता", "te": "ఈమెయిల్ చిరునామా", "ar": "البريد الإلكتروني", "ja": "メールアドレス", "zh_CN": "邮箱地址"
    },
    "auth.password": {
        "en": "Password", "es": "Contraseña", "fr": "Mot de passe", "de": "Passwort", "hi": "पासवर्ड", "te": "పాస్‌వర్డ్", "ar": "كلمة المرور", "ja": "パスワード", "zh_CN": "密码"
    },

    # General button actions
    "btn.save": {
        "en": "Save Changes", "es": "Guardar Cambios", "fr": "Sauvegarder", "de": "Änderungen speichern", "hi": "बदलाव सहेजें", "te": "మార్పులను సేవ్ చేయండి", "ar": "حفظ التغييرات", "ja": "変更を保存", "zh_CN": "保存修改"
    },
    "btn.cancel": {
        "en": "Cancel", "es": "Cancelar", "fr": "Annuler", "de": "Abbrechen", "hi": "रद्द करें", "te": "రద్దు చేయండి", "ar": "إلغاء", "ja": "キャンセル", "zh_CN": "取消"
    },
    "btn.submit": {
        "en": "Submit", "es": "Enviar", "fr": "Soumettre", "de": "Absenden", "hi": "जमा करें", "te": "సమర్పించండి", "ar": "إرسال", "ja": "送信", "zh_CN": "提交"
    },

    # Validations & Errors
    "validation.required": {
        "en": "This field is required", "es": "Este campo es obligatorio", "fr": "Ce champ est obligatoire", "de": "Dieses Feld ist erforderlich", "hi": "यह फ़ील्ड आवश्यक है", "te": "ఈ ఫీల్డ్ అవసరం", "ar": "هذا الحقل مطلوب", "ja": "このフィールドは必須です", "zh_CN": "必填项"
    },
    "validation.email": {
        "en": "Invalid email address", "es": "Correo electrónico no válido", "fr": "Adresse e-mail invalide", "de": "Ungültige E-Mail-Adresse", "hi": "अमान्य ईमेल पता", "te": "చెల్లని ఈమెయిల్", "ar": "البريد الإلكتروني غير صالحة", "ja": "無効なメールアドレス", "zh_CN": "邮箱格式不正确"
    },
    "validation.password": {
        "en": "Incorrect password", "es": "Contraseña incorrecta", "fr": "Mot de passe incorrect", "de": "Falsches Passwort", "hi": "गलत पासवर्ड", "te": "తప్పు పాస్‌వర్డ్", "ar": "كلمة المرور غير صحيحة", "ja": "パスワードが間違っています", "zh_CN": "密码错误"
    }
}

# Now let's insert these keys into translations.js languages
# We will read each language mapping, parse its dictionary content, merge ADDITIONAL_KEYS, and construct the new string.
# To do this safely, we can regex-find the dictionary for each language:
# e.g., "en: {\n  ..."
# Let's perform a parse:

for lang_code in ["en", "hi", "te", "ta", "kn", "ml", "mr", "gu", "pa", "bn", "or", "ur", "es", "fr", "de", "it", "pt", "nl", "ru", "tr", "ar", "he", "fa", "zh_CN", "zh_TW", "ja", "ko", "th", "vi", "id", "ms"]:
    # Let's find the content of lang_code: { ... } block
    pattern = rf"({lang_code}:\s*\{{)(.*?)(\}},)"
    m = re.search(pattern, content, re.DOTALL)
    if m:
        start = m.group(1)
        body = m.group(2)
        end = m.group(3)
        
        # Parse body lines
        lines = [line.strip() for line in body.split("\n") if line.strip()]
        # Build key-value pairs
        parsed = {}
        for line in lines:
            line_match = re.match(r'"(.*?)":\s*"(.*?)"(,?)$', line)
            if line_match:
                parsed[line_match.group(1)] = line_match.group(2)
        
        # Merge new keys
        for key, lang_map in ADDITIONAL_KEYS.items():
            val = lang_map.get(lang_code, lang_map.get("en"))
            parsed[key] = val
        
        # Format back into body
        new_body = "\n"
        for k, v in sorted(parsed.items()):
            escaped_v = v.replace('"', '\\"')
            new_body += f'    "{k}": "{escaped_v}",\n'
        # Remove trailing comma for standard JSON, but let's keep it clean
        
        content = content.replace(m.group(0), f"{start}{new_body}  {end}")

# Write back
with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Translations successfully expanded!")
