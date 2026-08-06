const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'frontend', 'src', 'pages', 'SupportPage.js');
let content = fs.readFileSync(filepath, 'utf8');

// 1. Remove the global static FAQS definition
const faqsRegex = /const FAQS = \[[\s\S]*?\];/;
content = content.replace(faqsRegex, '');

// 2. Insert dynamic FAQS inside the SupportPage component
const componentStart = 'const SupportPage = () => {';
const dynamicFaqs = `const SupportPage = () => {
  const { lang, changeLanguage: setLang } = useTranslation();

  const FAQS = [
    {
      question: translate('support.faqQ1', lang),
      answer: translate('support.faqA1', lang)
    },
    {
      question: translate('support.faqQ2', lang),
      answer: translate('support.faqA2', lang)
    },
    {
      question: translate('support.faqQ3', lang),
      answer: translate('support.faqA3', lang)
    },
    {
      question: translate('support.faqQ4', lang),
      answer: translate('support.faqA4', lang)
    },
    {
      question: translate('support.faqQ5', lang),
      answer: translate('support.faqA5', lang)
    }
  ];`;

content = content.replace(componentStart, dynamicFaqs);

// Clean up duplicate declarations or double definitions of hooks
content = content.replace(/const \{ lang, changeLanguage: setLang \} = useTranslation\(\);/g, '');

// 3. Translate search FAQ input placeholder
content = content.replace('placeholder="Search FAQ guides..."', 'placeholder={translate(\'common.search\', lang)}');

// 4. Translate Category dropdown MenuItems
content = content.replace('<MenuItem value="BUG">Bug Report</MenuItem>', '<MenuItem value="BUG">{translate(\'category.bug\', lang)}</MenuItem>');
content = content.replace('<MenuItem value="FEATURE_REQUEST">Feature Request</MenuItem>', '<MenuItem value="FEATURE_REQUEST">{translate(\'category.feature\', lang)}</MenuItem>');
content = content.replace('<MenuItem value="SOS_ISSUE">SOS Issue</MenuItem>', '<MenuItem value="SOS_ISSUE">{translate(\'category.sos\', lang)}</MenuItem>');
content = content.replace('<MenuItem value="VOICE_DETECTION_ISSUE">Voice Detection Issue</MenuItem>', '<MenuItem value="VOICE_DETECTION_ISSUE">{translate(\'category.voice\', lang)}</MenuItem>');
content = content.replace('<MenuItem value="LOGIN_ISSUE">Login Issue</MenuItem>', '<MenuItem value="LOGIN_ISSUE">{translate(\'category.login\', lang)}</MenuItem>');
content = content.replace('<MenuItem value="OTP_ISSUE">OTP Issue</MenuItem>', '<MenuItem value="OTP_ISSUE">{translate(\'category.otp\', lang)}</MenuItem>');
content = content.replace('<MenuItem value="EMAIL_ISSUE">Email Issue</MenuItem>', '<MenuItem value="EMAIL_ISSUE">{translate(\'category.email\', lang)}</MenuItem>');
content = content.replace('<MenuItem value="NOTIFICATION_ISSUE">Notification Issue</MenuItem>', '<MenuItem value="NOTIFICATION_ISSUE">{translate(\'category.notification\', lang)}</MenuItem>');
content = content.replace('<MenuItem value="PERFORMANCE_ISSUE">Performance Issue</MenuItem>', '<MenuItem value="PERFORMANCE_ISSUE">{translate(\'category.performance\', lang)}</MenuItem>');
content = content.replace('<MenuItem value="UI_UX_ISSUE">UI/UX Issue</MenuItem>', '<MenuItem value="UI_UX_ISSUE">{translate(\'category.ui_ux\', lang)}</MenuItem>');
content = content.replace('<MenuItem value="ACCOUNT_ISSUE">Account Issue</MenuItem>', '<MenuItem value="ACCOUNT_ISSUE">{translate(\'category.account\', lang)}</MenuItem>');
content = content.replace('<MenuItem value="FEEDBACK">Feedback</MenuItem>', '<MenuItem value="FEEDBACK">{translate(\'category.feedback\', lang)}</MenuItem>');
content = content.replace('<MenuItem value="GENERAL">General Query</MenuItem>', '<MenuItem value="GENERAL">{translate(\'category.query\', lang)}</MenuItem>');
content = content.replace('<MenuItem value="OTHER">Other</MenuItem>', '<MenuItem value="OTHER">{translate(\'category.other\', lang)}</MenuItem>');

// 5. Translate Priority dropdown MenuItems
content = content.replace('<MenuItem value="Critical">Critical</MenuItem>', '<MenuItem value="Critical">{translate(\'priority.critical\', lang)}</MenuItem>');
content = content.replace('<MenuItem value="High">High</MenuItem>', '<MenuItem value="High">{translate(\'priority.high\', lang)}</MenuItem>');
content = content.replace('<MenuItem value="Medium">Medium</MenuItem>', '<MenuItem value="Medium">{translate(\'priority.medium\', lang)}</MenuItem>');
content = content.replace('<MenuItem value="Low">Low</MenuItem>', '<MenuItem value="Low">{translate(\'priority.low\', lang)}</MenuItem>');

// 6. Translate AI Diagnostics dialog strings
content = content.replace('Eco-Support AI Diagnostics Pre-Check', '{translate(\'support.aiCheck\', lang)}');
content = content.replace('Probable Issue Cause:', '{translate(\'support.details\', lang)}:');
content = content.replace('Troubleshooting Steps:', '{translate(\'support.faq\', lang)}:');
content = content.replace('Eco Recommendation:', '{translate(\'nav.recommendations\', lang)}:');

fs.writeFileSync(filepath, content, 'utf8');
console.log("SupportPage.js successfully updated and translated!");
