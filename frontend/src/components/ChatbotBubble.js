import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Box, IconButton, Typography, TextField, Paper, Avatar, 
  CircularProgress, Button, Chip, List, ListItem, ListItemText, 
  ListItemButton, Divider, Tooltip, InputAdornment, useTheme,
  Menu, MenuItem, LinearProgress, Badge, Dialog, Skeleton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, LineChart, Line
} from 'recharts';

import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MinimizeIcon from '@mui/icons-material/Minimize';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';

import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// --- Multi-language UI Dictionary ---
const UI_TRANSLATIONS = {
  es: {
    title: "Asistente de Carbono IA",
    adminTitle: "Administrador de Carbono IA",
    placeholder: "Haz una pregunta...",
    searchPlaceholder: "Buscar chats...",
    uploadTooltip: "Subir documento para análisis",
    clearTooltip: "Limpiar chat",
    newChatTooltip: "Nuevo chat",
    thinking: "El asistente de IA está pensando...",
    emptyTitle: "Pregunta a tu asistente en vivo",
    emptySubtitle: "Consulta emisiones, tendencias, objetivos o estadísticas de administración.",
    renameTitle: "Renombrar conversación",
    cancel: "Cancelar",
    save: "Guardar",
    confirmCreateGoal: "Confirmar: Crear un objetivo",
    downloadPdf: "Descargar PDF",
    logActivity: "Registrar actividad",
    editProfile: "Editar perfil",
    confirm: "Confirmar",
    shareAlert: "¡El contenido del chat se ha copiado al portapapeles!",
    newConversation: "Nueva conversación",
    systemContext: "Contexto de base de datos en vivo"
  },
  fr: {
    title: "Assistant Carbone IA",
    adminTitle: "Administrateur Carbone IA",
    placeholder: "Poser une question...",
    searchPlaceholder: "Rechercher des chats...",
    uploadTooltip: "Télécharger le document",
    clearTooltip: "Effacer le chat",
    newChatTooltip: "Nouveau chat",
    thinking: "L'assistant IA réfléchit...",
    emptyTitle: "Demander à l'assistant carbone",
    emptySubtitle: "Consultez les émissions, les objectifs ou les statistiques d'administration.",
    renameTitle: "Renommer la conversation",
    cancel: "Annuler",
    save: "Enregistrer",
    confirmCreateGoal: "Confirmer: Créer un objectif",
    downloadPdf: "Télécharger le PDF",
    logActivity: "Enregistrer l'activité",
    editProfile: "Modifier le profil",
    confirm: "Confirmer",
    shareAlert: "Le contenu du chat a été copié dans le presse-papiers !",
    newConversation: "Nouvelle conversation",
    systemContext: "Contexte de base de données en direct"
  },
  de: {
    title: "Kohlenstoff-Assistent KI",
    adminTitle: "Kohlenstoff-Admin KI",
    placeholder: "Frage stellen...",
    searchPlaceholder: "Chats durchsuchen...",
    uploadTooltip: "Dokument hochladen",
    clearTooltip: "Chat leeren",
    newChatTooltip: "Neuer Chat",
    thinking: "KI-Assistent denkt nach...",
    emptyTitle: "Fragen Sie den KI-Assistenten",
    emptySubtitle: "Fragen Sie nach Emissionen, Zielen oder Admin-Statistiken.",
    renameTitle: "Konversation umbenennen",
    cancel: "Abbrechen",
    save: "Speichern",
    confirmCreateGoal: "Bestätigen: Ziel erstellen",
    downloadPdf: "PDF herunterladen",
    logActivity: "Aktivität protokollieren",
    editProfile: "Profil bearbeiten",
    confirm: "Bestätigen",
    shareAlert: "Chat-Inhalt wurde in die Zwischenablage kopiert!",
    newConversation: "Neue Konversation",
    systemContext: "Live-Datenbankkontext"
  },
  ar: {
    title: "مساعد الكربون بالذكاء الاصطناعي",
    adminTitle: "مشرف الكربون بالذكاء الاصطناعي",
    placeholder: "اسأل سؤالاً...",
    searchPlaceholder: "البحث في المحادثات...",
    uploadTooltip: "تحميل مستند للتحليل",
    clearTooltip: "مسح المحادثة",
    newChatTooltip: "محادثة جديدة",
    thinking: "المساعد الذكي يفكر...",
    emptyTitle: "اسأل مساعد الكربون المباشر",
    emptySubtitle: "استعلم عن الانبعاثات، والاتجاهات، وحالة الأهداف، وإحصاءات المشرف.",
    renameTitle: "إعادة تسمية المحادثة",
    cancel: "إلغاء",
    save: "حفظ",
    confirmCreateGoal: "تأكيد: إنشاء هدف",
    downloadPdf: "تحميل PDF",
    logActivity: "تسجيل النشاط",
    editProfile: "تعديل الملف الشخصي",
    confirm: "تأكيد",
    shareAlert: "تم نسخ المحادثة إلى الحافظة!",
    newConversation: "محادثة جديدة",
    systemContext: "سياق قاعدة البيانات الحية"
  },
  hi: {
    title: "कार्बन सहायक एआई",
    adminTitle: "कार्बन एडमिन एआई",
    placeholder: "प्रश्न पूछें...",
    searchPlaceholder: "चैट खोजें...",
    uploadTooltip: "दस्तावेज़ अपलोड करें",
    clearTooltip: "चैट साफ़ करें",
    newChatTooltip: "नई चैट",
    thinking: "एआई सहायक सोच रहा है...",
    emptyTitle: "अपने कार्बन सहायक से पूछें",
    emptySubtitle: "उत्सर्जन, रुझान, लक्ष्यों की स्थिति, या एडमिन आंकड़े पूछें।",
    renameTitle: "चैट का नाम बदलें",
    cancel: "रद्द करें",
    save: "सहेजें",
    confirmCreateGoal: "पुष्टि करें: लक्ष्य बनाएं",
    downloadPdf: "पीडीएफ डाउनलोड",
    logActivity: "गतिविधि दर्ज करें",
    editProfile: "प्रोफ़ाइल संपादित करें",
    confirm: "पुष्टि करें",
    shareAlert: "चैट सामग्री क्लिपबोर्ड पर कॉपी हो गई है!",
    newConversation: "नई बातचीत",
    systemContext: "लाइव डेटाबेस संदर्भ"
  },
  kn: {
    title: "ಕಾರ್ಬನ್ ಸಹಾಯಕ ಎಐ",
    adminTitle: "ಕಾರ್ಬನ್ ಅಡ್ಮಿನ್ ಎಐ",
    placeholder: "ಪ್ರಶ್ನೆ ಕೇಳಿ...",
    searchPlaceholder: "ಚಾಟ್‌ಗಳನ್ನು ಹುಡುಕಿ...",
    uploadTooltip: "ದಾಖಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    clearTooltip: "ಚಾಟ್ ತೆರವುಗೊಳಿಸಿ",
    newChatTooltip: "ಹೊಸ ಚಾಟ್",
    thinking: "ಎಐ ಸಹಾಯಕ ಯೋಚಿಸುತ್ತಿದ್ದಾನೆ...",
    emptyTitle: "ಕಾರ್ಬನ್ ಸಹಾಯಕನನ್ನು ಕೇಳಿ",
    emptySubtitle: "ಕಾರ್ಬನ್ ಹೊರಸೂಸುವಿಕೆ, ಪ್ರಗತಿ ಅಥವಾ ನಿರ್ವಾಹಕ ಅಂಕಿಅಂಶಗಳನ್ನು ತಿಳಿಯಿರಿ.",
    renameTitle: "ಹೆಸರು ಬದಲಾಯಿಸಿ",
    cancel: "ರದ್ದುಗೊಳಿಸಿ",
    save: "ಉಳಿಸಿ",
    confirmCreateGoal: "ಖಚಿತಪಡಿಸಿ: ಗುರಿ ರಚಿಸಿ",
    downloadPdf: "ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್",
    logActivity: "ಚಟುವಟಿಕೆಯನ್ನು ದಾಖಲಿಸಿ",
    editProfile: "ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ",
    confirm: "ಖಚಿತಪಡಿಸಿ",
    shareAlert: "ಚಾಟ್ ವಿಷಯವನ್ನು ನಕಲಿಸಲಾಗಿದೆ!",
    newConversation: "ಹೊಸ ಸಂಭಾಷಣೆ",
    systemContext: "ಲೈವ್ ಡೇಟಾಬೇಸ್ ಸಂದರ್ಭ"
  },
  or: {
    title: "କାର୍ବନ ସହାୟକ ଏଆଇ",
    adminTitle: "କାର୍ବନ ଆଡମିନ ଏଆଇ",
    placeholder: "ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ...",
    searchPlaceholder: "ଚାଟ୍ ଖୋଜନ୍ତୁ...",
    uploadTooltip: "ଫାଇଲ୍ ଅପଲୋଡ୍ କରନ୍ତୁ",
    clearTooltip: "ଚାଟ୍ ସଫା କରନ୍ତୁ",
    newChatTooltip: "ନୂତନ ଚାଟ୍",
    thinking: "ଏଆଇ ସହାୟକ ଚିନ୍ତା କରୁଛି...",
    emptyTitle: "କାର୍ବନ ସହାୟକଙ୍କୁ ପଚାରନ୍ତୁ",
    emptySubtitle: "ନିଜର କାର୍ବନ ଉତ୍ସର୍ଜନ ଏବଂ ପ୍ରଗତି ବିଷୟରେ ଜାଣନ୍ତୁ।",
    renameTitle: "ନାମ ବଦଳାନ୍ତୁ",
    cancel: "ବାତିଲ୍ କରନ୍ତୁ",
    save: "ସଂରକ୍ଷଣ କରନ୍ତୁ",
    confirmCreateGoal: "ନିଶ୍ଚିତ କରନ୍ତୁ: ଲକ୍ଷ୍ୟ ସୃଷ୍ଟି କରନ୍ତୁ",
    downloadPdf: "ପିଡିଏଫ୍ ଡାଉନଲୋଡ୍",
    logActivity: "କାର୍ଯ୍ୟକଳାପ ଲଗ୍ କରନ୍ତୁ",
    editProfile: "ପ୍ରୋଫାଇଲ୍ ସଂଶୋଧନ",
    confirm: "ନିଶ୍ଚିତ",
    shareAlert: "ଚାଟ୍ ବିବରଣୀ କପି ହୋଇଗଲା!",
    newConversation: "ନୂତନ ବାର୍ତ୍ତାଳାପ",
    systemContext: "ଲାଇଭ୍ ଡାଟାବେସ୍ ସନ୍ଦର୍ଭ"
  }
};

const getLocalString = (key, lang) => {
  const currentLang = lang || 'en';
  const translations = UI_TRANSLATIONS[currentLang];
  if (translations && translations[key]) {
    return translations[key];
  }
  // English fallback translations
  const en = {
    title: "Carbon Assistant AI",
    adminTitle: "Carbon Admin AI",
    placeholder: "Ask a question...",
    searchPlaceholder: "Search chats...",
    uploadTooltip: "Upload Document for Analysis",
    clearTooltip: "Clear Chat",
    newChatTooltip: "New Chat",
    thinking: "AI Assistant is thinking...",
    emptyTitle: "Ask your live Carbon Tracker Assistant",
    emptySubtitle: "Query emissions, trends, goal completion status, or administrative statistics.",
    renameTitle: "Rename Conversation",
    cancel: "Cancel",
    save: "Save",
    confirmCreateGoal: "Confirm: Create a Goal",
    downloadPdf: "Download PDF",
    logActivity: "Log Activity",
    editProfile: "Edit Profile Details",
    confirm: "Confirm",
    shareAlert: "Chat content copied to clipboard!",
    newConversation: "New Conversation",
    systemContext: "Live Database Context"
  };
  return en[key] || key;
};

// --- Custom Recharts Renderers ---

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'];

const PieChartCard = ({ data }) => {
  const chartData = data.labels.map((label, i) => ({
    name: label,
    value: data.values[i]
  }));
  return (
    <Paper elevation={0} sx={{ p: 2, my: 1, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper' }}>
      <Typography variant="caption" fontWeight={700} display="block" mb={1} color="text.secondary">
        📊 Distribution Breakdown
      </Typography>
      <Box sx={{ width: '100%', height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Box display="flex" flexWrap="wrap" justifyContent="center" gap={1} mt={1}>
        {chartData.map((item, i) => (
          <Box key={i} display="flex" alignItems="center" gap={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
            <Typography sx={{ fontSize: '10px', fontWeight: 600 }} color="text.secondary">
              {item.name}: {item.value} kg
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

const BarChartCard = ({ data }) => {
  const chartData = data.labels.map((label, i) => ({
    name: label,
    value: data.values[i]
  }));
  return (
    <Paper elevation={0} sx={{ p: 2, my: 1, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper' }}>
      <Typography variant="caption" fontWeight={700} display="block" mb={1} color="text.secondary">
        📊 Distribution Projections
      </Typography>
      <Box sx={{ width: '100%', height: 150 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9 }} />
            <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

const LineChartCard = ({ data }) => {
  const chartData = data.labels.map((label, i) => ({
    name: label,
    value: data.values[i]
  }));
  return (
    <Paper elevation={0} sx={{ p: 2, my: 1, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper' }}>
      <Typography variant="caption" fontWeight={700} display="block" mb={1} color="text.secondary">
        📈 Footprint Trend Analysis
      </Typography>
      <Box sx={{ width: '100%', height: 150 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9 }} />
            <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

const GaugeCard = ({ data }) => {
  const percent = Math.min(100, Math.max(0, Math.round((data.value / data.max) * 100)));
  return (
    <Paper elevation={0} sx={{ p: 2, my: 1, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress variant="determinate" value={100} sx={{ color: 'action.hover' }} size={56} thickness={4} />
        <CircularProgress variant="determinate" value={percent} sx={{ color: '#10b981', position: 'absolute', left: 0 }} size={56} thickness={4} />
        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" color="text.primary" fontWeight={700} fontSize="0.75rem">
            {data.value}
          </Typography>
        </Box>
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>
          {data.label}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Out of: {data.max} kg CO₂e
        </Typography>
      </Box>
    </Paper>
  );
};

const ProgressCard = ({ data }) => {
  return (
    <Paper elevation={0} sx={{ p: 2, my: 1, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper' }}>
      <Box display="flex" justifyContent="space-between" mb={0.5}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
          {data.label}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }} color="primary.main">
          {data.value}%
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={data.value} sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: '#10b981' } }} />
    </Paper>
  );
};

// --- Custom Action Button Trigger ---
const ActionButton = ({ data, onTrigger }) => {
  return (
    <Box sx={{ my: 0.5 }}>
      <Button 
        variant="contained" 
        size="small" 
        onClick={() => onTrigger(data.action)}
        sx={{ 
          borderRadius: 2, 
          textTransform: 'none',
          fontWeight: 700,
          px: 2,
          py: 0.5,
          fontSize: '0.75rem',
          background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
          '&:hover': {
            background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
            boxShadow: '0 6px 16px rgba(16, 185, 129, 0.3)',
          }
        }}
      >
        {data.label}
      </Button>
    </Box>
  );
};

// --- Main Chatbot Component ---

export const ChatbotBubble = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang } = useTranslation();

  // Dialog & Visibility State
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  // Chat Conversations & Messages State
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  // Text Selection & Menu anchors
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameTitle, setRenameTitle] = useState('');

  // Audio / Speech State
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const recognitionRef = useRef(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const userRole = user ? (user.role || 'USER') : 'USER';

  // Load conversations on Mount
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, userRole]);

  // Scroll messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-US';

      rec.onstart = () => setIsRecording(true);
      rec.onresult = (e) => setInputMsg(e.results[0][0].transcript);
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      recognitionRef.current = rec;
    }
  }, [lang]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const toggleSpeech = (text, msgId) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/:::[a-z-]+ [\s\S]*?:::/g, '')
      .replace(/[\*#_\-`]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-US';
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const fetchConversations = async () => {
    setInitialLoading(true);
    try {
      const res = await api.get(`/api/chatbot/conversations?role=${userRole}`);
      if (res.data.success) {
        setConversations(res.data.data);
        if (res.data.data.length > 0) {
          loadConversation(res.data.data[0].id);
        } else {
          handleNewConversation();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadConversation = async (id) => {
    try {
      const res = await api.get(`/api/chatbot/conversations/${id}`);
      if (res.data.success) {
        setActiveConversation(res.data.data);
        setMessages(res.data.data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewConversation = async () => {
    try {
      const res = await api.post(`/api/chatbot/conversations?role=${userRole}`, { title: getLocalString('newConversation', lang) });
      if (res.data.success) {
        setConversations(prev => [res.data.data, ...prev]);
        setActiveConversation(res.data.data);
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (customMessage) => {
    const text = customMessage || inputMsg;
    if (!text.trim()) return;

    let convId = activeConversation ? activeConversation.id : null;
    if (!convId) {
      setLoading(true);
      try {
        const createRes = await api.post(`/api/chatbot/conversations?role=${userRole}`, { title: getLocalString('newConversation', lang) });
        if (createRes.data.success) {
          setActiveConversation(createRes.data.data);
          setConversations(prev => [createRes.data.data, ...prev]);
          convId = createRes.data.data.id;
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
        return;
      }
    }

    const userMessage = { sender: 'USER', content: text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInputMsg('');
    setLoading(true);

    try {
      const res = await api.post(`/api/chatbot/conversations/${convId}/query`, { message: text });
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data]);
        // Refresh titles in sidebar
        const listRes = await api.get(`/api/chatbot/conversations?role=${userRole}`);
        if (listRes.data.success) setConversations(listRes.data.data);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        sender: 'BOT',
        content: "⚠️ **System Connection Error:** Failed to generate AI reply.",
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/api/chatbot/conversations/${id}`);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversation && activeConversation.id === id) {
        setMessages([]);
        setActiveConversation(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearChat = async () => {
    if (!activeConversation) return;
    try {
      await api.delete(`/api/chatbot/conversations/${activeConversation.id}`);
      handleNewConversation();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleTogglePin = async (e) => {
    e.stopPropagation();
    if (!activeConversation) return;
    const nextPinned = !activeConversation.pinned;
    try {
      const res = await api.put(`/api/chatbot/conversations/${activeConversation.id}/pin`, { pinned: nextPinned });
      if (res.data.success) {
        setActiveConversation(res.data.data);
        setConversations(prev => prev.map(c => c.id === activeConversation.id ? res.data.data : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    if (!activeConversation) return;
    const nextFav = !activeConversation.favorite;
    try {
      const res = await api.put(`/api/chatbot/conversations/${activeConversation.id}/favorite`, { favorite: nextFav });
      if (res.data.success) {
        setActiveConversation(res.data.data);
        setConversations(prev => prev.map(c => c.id === activeConversation.id ? res.data.data : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameClick = () => {
    if (!activeConversation) return;
    setRenameTitle(activeConversation.title);
    setRenameDialogOpen(true);
  };

  const handleRenameSave = async () => {
    if (!activeConversation || !renameTitle.trim()) return;
    try {
      const res = await api.put(`/api/chatbot/conversations/${activeConversation.id}/rename`, { title: renameTitle });
      if (res.data.success) {
        setActiveConversation(res.data.data);
        setConversations(prev => prev.map(c => c.id === activeConversation.id ? res.data.data : c));
        setRenameDialogOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessageFeedback = async (msg, liked, disliked) => {
    if (!msg.id) return;
    try {
      const res = await api.put(`/api/chatbot/messages/${msg.id}/feedback`, { liked, disliked });
      if (res.data.success) {
        setMessages(prev => prev.map(m => m.id === msg.id ? res.data.data : m));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileUploadChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    let convId = activeConversation ? activeConversation.id : null;
    if (!convId) {
      setLoading(true);
      try {
        const createRes = await api.post(`/api/chatbot/conversations?role=${userRole}`, { title: getLocalString('newConversation', lang) });
        if (createRes.data.success) {
          setActiveConversation(createRes.data.data);
          setConversations(prev => [createRes.data.data, ...prev]);
          convId = createRes.data.data.id;
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/api/chatbot/conversations/${convId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        loadConversation(convId);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        sender: 'BOT',
        content: "⚠️ **File Parsing Failure**: Failed to analyze file details.",
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSmartAction = async (action) => {
    if (action === 'create-goal') {
      navigate('/goals');
    } else if (action === 'log-transport' || action === 'log-activity') {
      navigate('/activities/log');
    } else if (action === 'open-profile') {
      navigate('/profile');
    } else if (action === 'view-leaderboard') {
      navigate('/leaderboard');
    } else if (action === 'export-pdf') {
      try {
        const res = await api.get('/api/v1/exports/user?format=pdf', { responseType: 'blob' });
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sustainability_report.pdf`;
        link.click();
      } catch (err) {
        console.error("PDF export failed", err);
      }
    }
  };

  const handleShareChat = () => {
    if (!activeConversation) return;
    const textToShare = messages.map(m => `[${m.sender}] ${m.content}`).join('\n\n');
    navigator.clipboard.writeText(textToShare);
    alert(getLocalString('shareAlert', lang));
  };

  const sortedConversations = useMemo(() => {
    let list = conversations;
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q));
    }

    const pinnedList = list.filter(c => c.pinned);
    const favoriteList = list.filter(c => c.favorite && !c.pinned);
    const recentList = list.filter(c => !c.pinned && !c.favorite);

    return [...pinnedList, ...favoriteList, ...recentList];
  }, [conversations, historySearch]);

  const suggestedPrompts = useMemo(() => {
    if (userRole === 'ADMIN') {
      return [
        "Show active users today",
        "Total platform registrations",
        "Pending support tickets",
        "Platform category breakdown",
        "System health check"
      ];
    } else {
      return [
        "What are my emissions today?",
        "Show my weekly carbon trend",  
        "How can I reduce my footprint?",
        "Show my goal progress",
        "Summarize my carbon data"
      ];
    }
  }, [userRole]);

  const renderMessageContent = (text, msgId) => {
    if (!text) return null;
    const parsedBlocks = parseMessage(text);

    return (
      <Box sx={{ fontSize: '0.875rem', lineHeight: 1.6, '& p': { m: 0 } }}>
        {parsedBlocks.map((block, i) => {
          if (block.type === 'text') {
            return (
              <ReactMarkdown key={i} components={{
                table: ({node, ...props}) => <table style={{ borderCollapse: 'collapse', width: '100%', margin: '12px 0', fontSize: '0.75rem' }} {...props} />,
                th: ({node, ...props}) => <th style={{ border: '1px solid #ddd', padding: '6px', background: theme.palette.mode === 'dark' ? '#333' : '#eee', fontWeight: 'bold' }} {...props} />,
                td: ({node, ...props}) => <td style={{ border: '1px solid #ddd', padding: '6px' }} {...props} />,
                a: ({node, ...props}) => <a style={{ color: '#10b981', fontWeight: 600 }} target="_blank" rel="noopener noreferrer" {...props} />
              }}>
                {block.data}
              </ReactMarkdown>
            );
          } else if (block.type === 'chart-pie') {
            return <PieChartCard key={i} data={block.data} />;
          } else if (block.type === 'chart-bar') {
            return <BarChartCard key={i} data={block.data} />;
          } else if (block.type === 'chart-line') {
            return <LineChartCard key={i} data={block.data} />;
          } else if (block.type === 'chart-gauge') {
            return <GaugeCard key={i} data={block.data} />;
          } else if (block.type === 'chart-progress') {
            return <ProgressCard key={i} data={block.data} />;
          } else if (block.type === 'action-link') {
            return <ActionButton key={i} data={block.data} onTrigger={handleSmartAction} />;
          }
          return null;
        })}
      </Box>
    );
  };

  const parseMessage = (text) => {
    if (!text) return [];
    const parts = text.split(':::');
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        try {
          if (part.startsWith('chart-pie')) {
            return { type: 'chart-pie', data: JSON.parse(part.substring(9).trim()) };
          } else if (part.startsWith('chart-bar')) {
            return { type: 'chart-bar', data: JSON.parse(part.substring(9).trim()) };
          } else if (part.startsWith('chart-line')) {
            return { type: 'chart-line', data: JSON.parse(part.substring(10).trim()) };
          } else if (part.startsWith('chart-gauge')) {
            return { type: 'chart-gauge', data: JSON.parse(part.substring(11).trim()) };
          } else if (part.startsWith('chart-progress')) {
            return { type: 'chart-progress', data: JSON.parse(part.substring(14).trim()) };
          } else if (part.startsWith('action-link')) {
            return { type: 'action-link', data: JSON.parse(part.substring(11).trim()) };
          }
        } catch (e) {
          console.error(e);
        }
      }
      return { type: 'text', data: part };
    });
  };

  if (!user) return null;

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1100 }}>
      {/* Premium Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <Tooltip title={userRole === 'ADMIN' ? getLocalString('adminTitle', lang) : getLocalString('title', lang)} placement="left">
              <IconButton
                onClick={() => setIsOpen(true)}
                sx={{
                  width: 60,
                  height: 60,
                  background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  color: '#ffffff',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
                  position: 'relative',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    border: '2px solid #10b981',
                    animation: 'pulse 2s infinite',
                    opacity: 0
                  },
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)', opacity: 0.8 },
                    '100%': { transform: 'scale(1.4)', opacity: 0 }
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'scale(1.1) translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(16, 185, 129, 0.6)',
                  }
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Redesigned Glassmorphic Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Paper
              elevation={24}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                width: isMaximized ? 'min(92vw, 900px)' : 'min(92vw, 410px)',
                height: isMaximized ? 'min(86vh, 700px)' : 'min(80vh, 560px)',
                borderRadius: 5,
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                background: theme.palette.mode === 'dark' ? 'rgba(17, 24, 39, 0.82)' : 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: '0 24px 50px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                overflow: 'hidden',
                flexDirection: 'row',
                transition: 'width 0.3s ease, height 0.3s ease'
              }}
            >
              {/* Sidebar Panel for History */}
              {((isMaximized || showHistory)) && (
                <Box
                  sx={{
                    width: 250,
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(10, 15, 25, 0.45)' : 'rgba(240, 244, 248, 0.5)',
                  }}
                >
                  <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={getLocalString('searchPlaceholder', lang)}
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 2.5, fontSize: '0.8rem', bgcolor: 'background.paper' }
                      }}
                    />
                    <Tooltip title={getLocalString('newChatTooltip', lang)}>
                      <IconButton size="small" onClick={handleNewConversation} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: 'background.paper' }}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <List sx={{ flex: 1, overflowY: 'auto', px: 1, py: 0 }}>
                    {sortedConversations.map(c => {
                      const isActive = activeConversation && activeConversation.id === c.id;
                      return (
                        <ListItem
                          key={c.id}
                          disablePadding
                          secondaryAction={
                            <IconButton size="small" onClick={(e) => handleDeleteConversation(c.id, e)} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          }
                          sx={{ mb: 0.5, borderRadius: 2.5, overflow: 'hidden' }}
                        >
                          <ListItemButton
                            selected={isActive}
                            onClick={() => loadConversation(c.id)}
                            sx={{
                              py: 1,
                              px: 1.5,
                              '&.Mui-selected': {
                                bgcolor: 'primary.main',
                                color: '#ffffff',
                                '&:hover': { bgcolor: 'primary.dark' },
                                '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' },
                                '& svg': { color: '#ffffff' }
                              }
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1} width="80%">
                              {c.pinned && <PushPinIcon sx={{ fontSize: 13, color: isActive ? '#fff' : 'primary.main' }} />}
                              {c.favorite && !c.pinned && <FavoriteIcon sx={{ fontSize: 13, color: isActive ? '#fff' : 'error.main' }} />}
                              <ListItemText
                                primary={c.title}
                                secondary={new Date(c.createdAt).toLocaleDateString()}
                                primaryTypographyProps={{ noWrap: true, variant: 'body2', fontWeight: 700 }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                              />
                            </Box>
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              )}

              {/* Main Chat Panel */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box 
                  sx={{ 
                    p: 2, 
                    borderBottom: '1px solid', 
                    borderColor: 'divider', 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.4)'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Badge variant="dot" color="success" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} overlap="circular">
                      <Avatar sx={{ bgcolor: 'primary.main', width: 38, height: 38 }}>
                        <AutoAwesomeIcon sx={{ fontSize: 20, color: '#ffffff' }} />
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>
                        {userRole === 'ADMIN' ? getLocalString('adminTitle', lang) : getLocalString('title', lang)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {activeConversation ? activeConversation.title : getLocalString('systemContext', lang)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={0.5}>
                    {activeConversation && (
                      <>
                        <IconButton size="small" onClick={handleTogglePin}>
                          {activeConversation.pinned ? <PushPinIcon fontSize="small" color="primary" /> : <PushPinOutlinedIcon fontSize="small" />}
                        </IconButton>
                        <IconButton size="small" onClick={handleToggleFavorite}>
                          {activeConversation.favorite ? <FavoriteIcon fontSize="small" color="error" /> : <FavoriteBorderIcon fontSize="small" />}
                        </IconButton>
                      </>
                    )}
                    <IconButton size="small" onClick={() => setShowHistory(!showHistory)}>
                      <HistoryIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleRenameClick}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setIsMaximized(!isMaximized)}>
                      {isMaximized ? <MinimizeIcon fontSize="small" /> : <OpenInFullIcon fontSize="small" />}
                    </IconButton>
                    <IconButton size="small" onClick={handleShareChat}>
                      <ShareIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setIsOpen(false)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Messages Area */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {initialLoading ? (
                    <Box display="flex" flexDirection="column" gap={2} p={2}>
                      <Skeleton variant="text" width="60%" height={20} />
                      <Skeleton variant="rectangular" width="85%" height={80} sx={{ borderRadius: 3 }} />
                      <Skeleton variant="text" width="40%" height={20} />
                    </Box>
                  ) : messages.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" textAlign="center" p={3}>
                      <AutoAwesomeIcon sx={{ fontSize: 44, color: 'primary.main', mb: 2, opacity: 0.8 }} />
                      <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                        {getLocalString('emptyTitle', lang)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" maxWidth={280}>
                        {getLocalString('emptySubtitle', lang)}
                      </Typography>
                    </Box>
                  ) : (
                    messages.map((m, idx) => (
                      <Box 
                        key={idx} 
                        display="flex" 
                        flexDirection="column"
                        alignItems={m.sender === 'USER' ? 'flex-end' : 'flex-start'}
                      >
                        <Box 
                          sx={{
                            maxWidth: '85%',
                            p: 1.8,
                            px: 2.2,
                            borderRadius: 4,
                            bgcolor: m.sender === 'USER' 
                              ? 'primary.main' 
                              : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'),
                            color: m.sender === 'USER' ? '#ffffff' : 'text.primary',
                            border: m.sender === 'USER' ? 'none' : '1px solid',
                            borderColor: 'divider',
                            position: 'relative',
                            boxShadow: m.sender === 'USER' ? '0 4px 12px rgba(16,185,129,0.15)' : 'none'
                          }}
                        >
                          {renderMessageContent(m.content, m.id)}

                          {m.sender === 'BOT' && (
                            <Box display="flex" gap={0.5} justifyContent="flex-end" mt={1} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                              <IconButton size="small" onClick={() => toggleSpeech(m.content, m.id)}>
                                {speakingMessageId === m.id ? <VolumeOffIcon sx={{ fontSize: 13 }} /> : <VolumeUpIcon sx={{ fontSize: 13 }} />}
                              </IconButton>
                              <IconButton size="small" onClick={() => handleCopyText(m.content)}>
                                <ContentCopyIcon sx={{ fontSize: 13 }} />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleMessageFeedback(m, true, false)}>
                                {m.liked ? <ThumbUpIcon sx={{ fontSize: 13, color: 'primary.main' }} /> : <ThumbUpOutlinedIcon sx={{ fontSize: 13 }} />}
                              </IconButton>
                              <IconButton size="small" onClick={() => handleMessageFeedback(m, false, true)}>
                                {m.disliked ? <ThumbDownIcon sx={{ fontSize: 13, color: 'error.main' }} /> : <ThumbDownOutlinedIcon sx={{ fontSize: 13 }} />}
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    ))
                  )}

                  {loading && (
                    <Box display="flex" gap={1.5} alignItems="center" sx={{ pl: 1 }}>
                      <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', width: 28, height: 28 }}>
                        <AutoAwesomeIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                      </Avatar>
                      <Box display="flex" gap={0.5}>
                        <Box sx={{ width: 6, height: 6, bgcolor: 'primary.main', borderRadius: '50%', animation: 'bounce 1.4s infinite alternate' }} />
                        <Box sx={{ width: 6, height: 6, bgcolor: 'primary.main', borderRadius: '50%', animation: 'bounce 1.4s infinite alternate', animationDelay: '0.2s' }} />
                        <Box sx={{ width: 6, height: 6, bgcolor: 'primary.main', borderRadius: '50%', animation: 'bounce 1.4s infinite alternate', animationDelay: '0.4s' }} />
                      </Box>
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Suggestions List */}
                {messages.length === 0 && (
                  <Box sx={{ px: 2, pb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {suggestedPrompts.map(p => (
                      <Chip
                        key={p}
                        label={p}
                        clickable
                        size="small"
                        onClick={() => handleSendMessage(p)}
                        sx={{
                          fontSize: '0.75rem',
                          borderColor: 'divider',
                          bgcolor: 'background.paper',
                          fontWeight: 600,
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      />
                    ))}
                  </Box>
                )}

                {/* Input Bar */}
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255,255,255,0.3)' }}>
                  <Box display="flex" gap={1} alignItems="center">
                    <Tooltip title={getLocalString('uploadTooltip', lang)}>
                      <IconButton size="small" onClick={handleFileUploadClick} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: 'background.paper' }}>
                        <CloudUploadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      onChange={handleFileUploadChange}
                      accept=".pdf,.csv,.txt,image/*"
                    />

                    <Tooltip title={getLocalString('clearTooltip', lang)}>
                      <IconButton size="small" onClick={handleClearChat} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: 'background.paper' }}>
                        <ClearAllIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={getLocalString('placeholder', lang)}
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={toggleRecording}>
                              {isRecording ? <MicOffIcon color="error" fontSize="small" /> : <MicIcon fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 3.5, fontSize: '0.875rem', bgcolor: 'background.paper' }
                      }}
                    />

                    <IconButton 
                      color="primary" 
                      disabled={!inputMsg.trim() || loading}
                      onClick={() => handleSendMessage()}
                      sx={{
                        bgcolor: inputMsg.trim() ? 'primary.main' : 'transparent',
                        color: inputMsg.trim() ? '#ffffff' : 'text.disabled',
                        '&:hover': {
                          bgcolor: inputMsg.trim() ? 'primary.dark' : 'transparent',
                        }
                      }}
                    >
                      <SendIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
        <Box sx={{ p: 3, width: 300 }}>
          <Typography variant="subtitle2" fontWeight={800} mb={2}>
            {getLocalString('renameTitle', lang)}
          </Typography>
          <TextField 
            fullWidth 
            size="small" 
            value={renameTitle} 
            onChange={(e) => setRenameTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button size="small" onClick={() => setRenameDialogOpen(false)}>{getLocalString('cancel', lang)}</Button>
            <Button size="small" variant="contained" onClick={handleRenameSave}>{getLocalString('save', lang)}</Button>
          </Box>
        </Box>
      </Dialog>

      {/* CSS Keyframes for Bounce */}
      <style>{`
        @keyframes bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-6px); }
        }
      `}</style>
    </Box>
  );
};

export default ChatbotBubble;
