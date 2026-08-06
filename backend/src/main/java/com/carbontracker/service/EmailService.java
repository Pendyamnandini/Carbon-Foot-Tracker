package com.carbontracker.service;

import com.carbontracker.entity.User;
import com.carbontracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository userRepository;

    private static final Map<String, Map<String, String>> DICT = new HashMap<>();

    static {
        // English
        Map<String, String> en = new HashMap<>();
        en.put("otp.subject", "Password Reset OTP");
        en.put("otp.dear", "Dear User,\n\nYour OTP is:\n\n%s\n\nThis OTP is valid for 10 minutes.\n\nRegards,\nCarbon Tracker Team");
        en.put("goal.subject", "🎉 Congratulations! Goal Achieved");
        en.put("goal.body", "Congratulations!\n\nYou have successfully achieved your sustainability goal: %s.\n\nYour efforts have reduced your carbon footprint and contributed positively to environmental sustainability.\n\nKeep up the excellent work!\n\nRegards,\nCarbon Tracker Team");
        en.put("milestone.subject", "🏆 Milestone Reached: %s");
        en.put("milestone.body", "Congratulations!\n\nYou have unlocked a new sustainability milestone: %s!\n\n%s\n\nThank you for leading the change towards a greener planet.\n\nRegards,\nCarbon Tracker Team");
        en.put("progress.ahead.subject", "🚀 Great Progress on Your Goal!");
        en.put("progress.ahead.body", "Great news!\n\nYou are currently ahead of your sustainability target for: %s.\n\nKeep maintaining your current habits to achieve even greater environmental impact.\n\nRegards,\nCarbon Tracker Team");
        en.put("progress.behind.subject", "⚠ Sustainability Goal Needs Attention");
        en.put("progress.behind.body", "Attention Required:\n\nYour goal '%s' is currently behind schedule.\n\nRecommended actions:\n• Reduce transport emissions\n• Lower electricity consumption\n• Follow personalized recommendations on your dashboard\n\nKeep tracking your activities and continue improving!\n\nRegards,\nCarbon Tracker Team");
        en.put("notif.subject", "🔔 Notification: %s");
        en.put("notif.body", "Dear User,\n\nYou have received a new notification on Carbon Tracker:\n\nTitle: %s\nDetails: %s\n\nTo view your notifications, please log in to the dashboard.\n\nRegards,\nCarbon Tracker Team");
        en.put("ticket.subject", "Your CarbonTracker Support Ticket Has Been Resolved");
        en.put("ticket.body", "Hello %s,\n\nYour support request has been successfully resolved.\n\nTicket ID:\n%s\n\nIssue:\n%s\n\nRoot Cause:\n%s\n\nResolution Steps:\n%s\n\nChanges Made:\n%s\n\nVerification:\n%s\n\nFinal Notes:\n%s\n\nResolved By:\n%s\n\nResolution Date:\n%s\n\nIf you continue experiencing the issue, you may reopen this ticket directly from your Support Dashboard.\n\nThank you,\nCarbonTracker Support Team");
        DICT.put("en", en);

        // Spanish (es)
        Map<String, String> es = new HashMap<>();
        es.put("otp.subject", "OTP para Restablecer Contraseña");
        es.put("otp.dear", "Estimado Usuario,\n\nSu OTP es:\n\n%s\n\nEste OTP es válido por 10 minutos.\n\nSaludos,\nEquipo de Carbon Tracker");
        es.put("goal.subject", "🎉 ¡Felicidades! Meta alcanzada");
        es.put("goal.body", "¡Felicidades!\n\nHa alcanzado con éxito su meta de sostenibilidad: %s.\n\nSus esfuerzos han reducido su huella de carbono y han contribuido positivamente a la sostenibilidad ambiental.\n\n¡Siga con el excelente trabajo!\n\nSaludos,\nEquipo de Carbon Tracker");
        es.put("milestone.subject", "🏆 Hito alcanzado: %s");
        es.put("milestone.body", "¡Felicidades!\n\n¡Ha desbloqueado un nuevo hito de sostenibilidad: %s!\n\n%s\n\nGracias por liderar el cambio hacia un planeta más verde.\n\nSaludos,\nEquipo de Carbon Tracker");
        es.put("progress.ahead.subject", "🚀 ¡Gran progreso en su meta!");
        es.put("progress.ahead.body", "¡Buenas noticias!\n\nActualmente está por delante de su objetivo de sostenibilidad para: %s.\n\nSiga manteniendo sus hábitos actuales para lograr un impacto ambiental aún mayor.\n\nSaludos,\nEquipo de Carbon Tracker");
        es.put("progress.behind.subject", "⚠ La meta de sostenibilidad necesita atención");
        es.put("progress.behind.body", "Atención requerida:\n\nSu meta '%s' está actualmente retrasada.\n\nAcciones recomendadas:\n• Reducir emisiones de transporte\n• Bajar consumo de electricidad\n• Siga las recomendaciones personalizadas en su panel\n\n¡Siga registrando sus actividades y continúe mejorando!\n\nSaludos,\nEquipo de Carbon Tracker");
        es.put("notif.subject", "🔔 Notificación: %s");
        es.put("notif.body", "Estimado Usuario,\n\nHa recibido una nueva notificación en Carbon Tracker:\n\nTítulo: %s\nDetalles: %s\n\nPara ver sus notificaciones, inicie sesión en el panel.\n\nSaludos,\nEquipo de Carbon Tracker");
        es.put("ticket.subject", "Su ticket de soporte de CarbonTracker ha sido resuelto");
        es.put("ticket.body", "Hola %s,\n\nSu solicitud de soporte ha sido resuelta con éxito.\n\nID del Ticket:\n%s\n\nAsunto:\n%s\n\nCausa Raíz:\n%s\n\nPasos de Resolución:\n%s\n\nCambios Realizados:\n%s\n\nVerificación Realizada:\n%s\n\nNotas Finales:\n%s\n\nResuelto Por:\n%s\n\nFecha de Resolución:\n%s\n\nSi continúa experimentando el problema, puede reabrir este ticket directamente desde su panel de soporte.\n\nGracias,\nEquipo de Soporte de CarbonTracker");
        DICT.put("es", es);

        // French (fr)
        Map<String, String> fr = new HashMap<>();
        fr.put("otp.subject", "Code de réinitialisation de mot de passe (OTP)");
        fr.put("otp.dear", "Cher utilisateur,\n\nVotre code OTP est :\n\n%s\n\nCe code est valide pendant 10 minutes.\n\nCordialement,\nL'équipe Carbon Tracker");
        fr.put("goal.subject", "🎉 Félicitations ! Objectif atteint");
        fr.put("goal.body", "Félicitations !\n\nVous avez atteint votre objectif de durabilité : %s.\n\nVos efforts contribuent à réduire l'empreinte carbone globale.\n\nCordialement,\nCarbon Tracker Team");
        fr.put("milestone.subject", "🏆 Jalon atteint : %s");
        fr.put("milestone.body", "Félicitations !\n\nVous avez débloqué un nouveau jalon : %s !\n\n%s\n\nCordialement,\nCarbon Tracker");
        fr.put("progress.ahead.subject", "🚀 Belle progression sur votre objectif !");
        fr.put("progress.ahead.body", "Bonne nouvelle !\n\nVous êtes en avance sur votre objectif de durabilité pour : %s.\n\nCordialement,\nCarbon Tracker");
        fr.put("progress.behind.subject", "⚠ Objectif de durabilité en retard");
        fr.put("progress.behind.body", "Attention requise :\n\nVotre objectif '%s' est en retard.\n\nCordialement,\nCarbon Tracker");
        fr.put("notif.subject", "🔔 Notification : %s");
        fr.put("notif.body", "Cher utilisateur,\n\nNouvelle notification sur Carbon Tracker :\n\nTitre : %s\nDétails : %s\n\nCordialement,\nCarbon Tracker");
        fr.put("ticket.subject", "Votre ticket de support CarbonTracker a été résolu");
        fr.put("ticket.body", "Bonjour %s,\n\nVotre demande de support a été résolue avec succès.\n\nTicket ID : %s\nSujet : %s\nCause : %s\nÉtapes : %s\n\nCordialement,\nL'équipe Carbon Tracker");
        DICT.put("fr", fr);

        // German (de)
        Map<String, String> de = new HashMap<>();
        de.put("otp.subject", "Einmalpasswort (OTP) zur Passwortzurücksetzung");
        de.put("otp.dear", "Sehr geehrter Nutzer,\n\nIhr OTP lautet:\n\n%s\n\nDieses OTP ist 10 Minuten gültig.\n\nMit freundlichen Grüßen,\nIhr Carbon Tracker Team");
        de.put("goal.subject", "🎉 Glückwunsch! Ziel erreicht");
        de.put("goal.body", "Herzlichen Glückwunsch!\n\nSie haben Ihr Nachhaltigkeitsziel erfolgreich erreicht: %s.\n\nMit freundlichen Grüßen,\nCarbon Tracker Team");
        de.put("milestone.subject", "🏆 Meilenstein erreicht: %s");
        de.put("milestone.body", "Glückwunsch!\n\nSie haben einen neuen Nachhaltigkeits-Meilenstein freigeschaltet: %s!\n\n%s\n\nMit freundlichen Grüßen,\nCarbon Tracker Team");
        de.put("progress.ahead.subject", "🚀 Toller Fortschritt bei Ihrem Ziel!");
        de.put("progress.ahead.body", "Gute Nachrichten!\n\nSie liegen aktuell über Ihrem Nachhaltigkeitsziel für: %s.\n\nMit freundlichen Grüßen,\nCarbon Tracker Team");
        de.put("progress.behind.subject", "⚠ Nachhaltigkeitsziel erfordert Aufmerksamkeit");
        de.put("progress.behind.body", "Aufmerksamkeit erforderlich:\n\nIhr Ziel '%s' liegt aktuell hinter dem Zeitplan.\n\nMit freundlichen Grüßen,\nCarbon Tracker Team");
        de.put("notif.subject", "🔔 Benachrichtigung: %s");
        de.put("notif.body", "Sehr geehrter Nutzer,\n\nSie haben eine neue Benachrichtigung erhalten:\n\nTitel: %s\nDetails: %s\n\nMit freundlichen Grüßen,\nCarbon Tracker Team");
        de.put("ticket.subject", "Ihr CarbonTracker Support-Ticket wurde gelöst");
        de.put("ticket.body", "Hallo %s,\n\nIhr Support-Ticket wurde erfolgreich gelöst.\n\nTicket ID: %s\nBetreff: %s\nUrsache: %s\nSchritte: %s\n\nMit freundlichen Grüßen,\nCarbon Tracker Team");
        DICT.put("de", de);

        // Hindi (hi)
        Map<String, String> hi = new HashMap<>();
        hi.put("otp.subject", "पासवर्ड रीसेट ओटीपी (OTP)");
        hi.put("otp.dear", "प्रिय उपयोगकर्ता,\n\nआपका ओटीपी है:\n\n%s\n\nयह ओटीपी 10 मिनट के लिए मान्य है।\n\nसादर,\nकार्बन ट्रैकर टीम");
        hi.put("goal.subject", "🎉 बधाई हो! लक्ष्य हासिल किया");
        hi.put("goal.body", "बधाई हो!\n\nआपने अपना स्थिरता लक्ष्य सफलतापूर्वक प्राप्त कर लिया है: %s।\n\nसादर,\nकार्बन ट्रैकर टीम");
        hi.put("milestone.subject", "🏆 मील का पत्थर हासिल किया: %s");
        hi.put("milestone.body", "बधाई हो!\n\nआपने एक नया मील का पत्थर अनलॉक किया है: %s!\n\n%s\n\nसादर,\nकार्बन ट्रैकर टीम");
        hi.put("progress.ahead.subject", "🚀 आपके लक्ष्य पर शानदार प्रगति!");
        hi.put("progress.ahead.body", "बड़ी खुशखबरी!\n\nआप वर्तमान में स्थिरता लक्ष्य से आगे चल रहे हैं: %s।\n\nसादर,\nकार्बन ट्रैकर टीम");
        hi.put("progress.behind.subject", "⚠ स्थिरता लक्ष्य पर ध्यान देने की आवश्यकता है");
        hi.put("progress.behind.body", "ध्यान दें:\n\nआपका लक्ष्य '%s' वर्तमान में पीछे चल रहा है।\n\nसादर,\nकार्बन ट्रैकर टीम");
        hi.put("notif.subject", "🔔 अधिसूचना: %s");
        hi.put("notif.body", "प्रिय उपयोगकर्ता,\n\nआपको एक नई अधिसूचना प्राप्त हुई है:\n\nशीर्षक: %s\nविवरण: %s\n\nसादर,\nकार्बन ट्रैकर टीम");
        hi.put("ticket.subject", "आपका कार्बनट्रैकर सहायता टिकट हल कर दिया गया है");
        hi.put("ticket.body", "नमस्ते %s,\n\nआपका सहायता टिकट सफलतापूर्वक हल हो गया है।\n\nटिकट आईडी: %s\nविषय: %s\nमूल कारण: %s\nसमाधान: %s\n\nसादर,\nकार्बनट्रैकर सहायता टीम");
        DICT.put("hi", hi);

        // Arabic (ar)
        Map<String, String> ar = new HashMap<>();
        ar.put("otp.subject", "رمز التحقق لإعادة تعيين كلمة المرور");
        ar.put("otp.dear", "عزيزي المستخدم،\n\nرمز التحقق الخاص بك هو:\n\n%s\n\nهذا الرمز صالح لمدة 10 دقائق.\n\nتحياتنا،\nفريق كربون تراكر");
        ar.put("goal.subject", "🎉 تهانينا! تم تحقيق الهدف");
        ar.put("goal.body", "تهانينا!\n\nلقد نجحت في تحقيق هدف الاستدامة الخاص بك: %s.\n\nتحياتنا،\nفريق كربون تراكر");
        ar.put("milestone.subject", "🏆 تم الوصول إلى إنجاز: %s");
        ar.put("milestone.body", "تهانينا!\n\nلقد قمت بفتح إنجاز استدامة جديد: %s!\n\n%s\n\nتحياتنا،\nفريق كربون تراكر");
        ar.put("progress.ahead.subject", "🚀 تقدم كبير في تحقيق هدفك!");
        ar.put("progress.ahead.body", "أخبار رائعة!\n\nأنت حاليًا متقدم على هدف الاستدامة الخاص بك لـ: %s.\n\nتحياتنا،\nفريق كربون تراكر");
        ar.put("progress.behind.subject", "⚠ هدف الاستدامة يحتاج إلى اهتمام");
        ar.put("progress.behind.body", "مطلوب الانتباه:\n\nهدفك '%s' متأخر حاليًا عن الجدول الزمني.\n\nتحياتنا،\nفريق كربون تراكر");
        ar.put("notif.subject", "🔔 إشعار: %s");
        ar.put("notif.body", "عزيزي المستخدم،\n\nلقد تلقيت إشعارًا جديدًا على كربون تراكر:\n\nالعنوان: %s\nالتفاصيل: %s\n\nتحياتنا،\nفريق كربون تراكر");
        ar.put("ticket.subject", "تم حل تذكرة الدعم الفني الخاصة بك");
        ar.put("ticket.body", "مرحباً %s،\n\nتم حل طلب الدعم الخاص بك بنجاح.\n\nرقم التذكرة: %s\nالموضوع: %s\nالسبب: %s\nخطوات الحل: %s\n\nتحياتنا،\nفريق دعم كربون تراكر");
        DICT.put("ar", ar);

        // Telugu (te)
        Map<String, String> te = new HashMap<>();
        te.put("otp.subject", "పాస్‌వర్డ్ రీసెట్ OTP");
        te.put("otp.dear", "ప్రియమైన వినియోగదారు,\n\nమీ OTP:\n\n%s\n\nఈ OTP 10 నిమిషాల పాటు చెల్లుతుంది.\n\nభవదీయులు,\nకార్బన్ ట్రాకర్ బృందం");
        te.put("goal.subject", "🎉 అభినందనలు! లక్ష్యం సాధించబడింది");
        te.put("goal.body", "అభినందనలు!\n\nమీరు మీ స్థిరత్వ లక్ష్యాన్ని విజయవంతంగా సాధించారు: %s.\n\nభవదీయులు,\nకార్బన్ ట్రాకర్ బృందం");
        te.put("milestone.subject", "🏆 మైలురాయి చేరింది: %s");
        te.put("milestone.body", "అభినందనలు!\n\nమీరు కొత్త స్థిరత్వ మైలురాయిని అన్‌లాక్ చేసారు: %s!\n\n%s\n\nభవదీయులు,\nకార్బన్ ట్రాకర్ బృందం");
        te.put("progress.ahead.subject", "🚀 మీ లక్ష్యం దిశగా గొప్ప పురోగతి!");
        te.put("progress.ahead.body", "గొప్ప వార్త!\n\nమీరు ప్రస్తుతం మీ స్థిరత్వ లక్ష్యం కంటే ముందడుగులో ఉన్నారు: %s.\n\nభవదీయులు,\nకార్బన్ ట్రాకర్ బృందం");
        te.put("progress.behind.subject", "⚠ స్థిరత్వ లక్ష్యంపై శ్రద్ధ అవసరం");
        te.put("progress.behind.body", "శ్రద్ధ అవసరం:\n\nమీ లక్ష్యం '%s' ప్రస్తుతం వెనుకబడి ఉంది.\n\nభవదీయులు,\nకార్బన్ ట్రాకర్ బృందం");
        te.put("notif.subject", "🔔 నోటిఫికేషన్: %s");
        te.put("notif.body", "ప్రియమైన వినియోగదారు,\n\nమీకు కార్బన్ ట్రాకర్‌లో కొత్త నోటిఫికేషన్ వచ్చింది:\n\nశీర్షిక: %s\nవివరాలు: %s\n\nభవదీయులు,\nకార్బన్ ట్రాకర్ బృందం");
        te.put("ticket.subject", "మీ సపోర్ట్ టికెట్ పరిష్కరించబడింది");
        te.put("ticket.body", "హలో %s,\n\nమీ సపోర్ట్ అభ్యర్థన విజయవంతంగా పరిష్కరించబడింది.\n\nటికెట్ ఐడి: %s\nసంగతి: %s\nకారణం: %s\nపరిష్కార దశలు: %s\n\nభవదీయులు,\nకార్బన్ ట్రాకర్ సపోర్ట్ బృందం");
        DICT.put("te", te);

        // Bengali (bn)
        Map<String, String> bn = new HashMap<>();
        bn.put("otp.subject", "পাসওয়ার্ড রিসেট ওটিপি (OTP)");
        bn.put("otp.dear", "প্রিয় ব্যবহারকারী,\n\nআপনার ওটিপি হলো:\n\n%s\n\nএই ওটিপিটি ১০ মিনিটের জন্য বৈধ।\n\nইতি,\nকার্বন ট্র্যাকার টিম");
        bn.put("goal.subject", "🎉 অভিনন্দন! লক্ষ্য অর্জিত হয়েছে");
        bn.put("goal.body", "অভিনন্দন!\n\nআপনি সফলভাবে আপনার স্থায়িত্বের লক্ষ্য অর্জন করেছেন: %s।\n\nইতি,\nকার্বন ট্র্যাকার টিম");
        bn.put("milestone.subject", "🏆 মাইলফলক অর্জিত হয়েছে: %s");
        bn.put("milestone.body", "অভিনন্দন!\n\nআপনি একটি নতুন মাইলফলক আনলক করেছেন: %s!\n\n%s\n\nইতি,\nকার্বন ট্র্যাকার টিম");
        bn.put("progress.ahead.subject", "🚀 আপনার লক্ষ্যের দিকে দুর্দান্ত অগ্রগতি!");
        bn.put("progress.ahead.body", "দারুণ খবর!\n\nআপনি বর্তমানে আপনার স্থায়িত্বের লক্ষ্য থেকে এগিয়ে আছেন: %s।\n\nইতি,\nকার্বন ট্র্যাকার টিম");
        bn.put("progress.behind.subject", "⚠ স্থায়িত্বের লক্ষ্যের প্রতি মনোযোগ দিন");
        bn.put("progress.behind.body", "মনোযোগ প্রয়োজন:\n\nআপনার লক্ষ্য '%s' বর্তমানে পিছিয়ে রয়েছে।\n\nইতি,\nকার্বন ট্র্যাকার টিম");
        bn.put("notif.subject", "🔔 বিজ্ঞপ্তি: %s");
        bn.put("notif.body", "প্রিয় ব্যবহারকারী,\n\nআপনি কার্বন ট্র্যাকার থেকে একটি নতুন বিজ্ঞপ্তি পেয়েছেন:\n\nশিরোনাম: %s\nবিস্তারিত: %s\n\nইতি,\nকার্বন ট্র্যাকার টিম");
        bn.put("ticket.subject", "আপনার সহায়তা টিকিট সমাধান করা হয়েছে");
        bn.put("ticket.body", "হ্যালো %s,\n\nআপনার সহায়তা টিকিটটি সফলভাবে সমাধান করা হয়েছে।\n\nটিকিট আইডি: %s\nবিষয়: %s\nমূল কারণ: %s\nসমাধান: %s\n\nইতি,\nকার্বন ট্র্যাকার সহায়তা দল");
        DICT.put("bn", bn);

        // Japanese (ja)
        Map<String, String> ja = new HashMap<>();
        ja.put("otp.subject", "パスワード再設定用ワンタイムパスワード (OTP)");
        ja.put("otp.dear", "ユーザー様、\n\nワンタイムパスワード（OTP）は以下の通りです：\n\n%s\n\nこのOTPは10分間有効です。\n\n敬具、\nCarbon Tracker チーム");
        ja.put("goal.subject", "🎉 おめでとうございます！目標達成");
        ja.put("goal.body", "おめでとうございます！\n\nサステナビリティ目標を達成しました： %s\n\n敬具、\nCarbon Tracker チーム");
        ja.put("milestone.subject", "🏆 マイルストーン達成： %s");
        ja.put("milestone.body", "おめでとうございます！\n\n新しいマイルストーンをアンロックしました： %s\n\n%s\n\n敬具、\nCarbon Tracker チーム");
        ja.put("progress.ahead.subject", "🚀 目標への順調な進捗！");
        ja.put("progress.ahead.body", "素晴らしいニュースです！\n\n現在目標より進んでいます： %s\n\n敬具、\nCarbon Tracker チーム");
        ja.put("progress.behind.subject", "⚠ 目標進捗に遅れが出ています");
        ja.put("progress.behind.body", "ご確認ください：\n\n目標 '%s' の進捗が遅れています。\n\n敬具、\nCarbon Tracker チーム");
        ja.put("notif.subject", "🔔 通知： %s");
        ja.put("notif.body", "ユーザー様、\n\n新しい通知が届いています：\n\nタイトル： %s\n詳細： %s\n\n敬具、\nCarbon Tracker チーム");
        ja.put("ticket.subject", "サポートチケットが解決されました");
        ja.put("ticket.body", "こんにちは %s 様、\n\nサポートリクエストが正常に解決されました。\n\nチケットID： %s\n件名： %s\n原因： %s\n解決手順： %s\n\n敬具、\nCarbon Tracker サポートチーム");
        DICT.put("ja", ja);

        // Chinese (zh)
        Map<String, String> zh = new HashMap<>();
        zh.put("otp.subject", "密码重置验证码 (OTP)");
        zh.put("otp.dear", "尊敬的用户，\n\n您的验证码是：\n\n%s\n\n该验证码在10分钟内有效。\n\n顺商祺、\nCarbon Tracker 团队");
        zh.put("goal.subject", "🎉 恭喜！目标已达成");
        zh.put("goal.body", "恭喜您！\n\n您已成功达成可持续发展目标：%s。\n\n顺商祺、\nCarbon Tracker 团队");
        zh.put("milestone.subject", "🏆 达成里程碑：%s");
        zh.put("milestone.body", "恭喜您！\n\n您已解锁新的可持续发展里程碑：%s！\n\n%s\n\n顺商祺、\nCarbon Tracker 团队");
        zh.put("progress.ahead.subject", "🚀 目标进度领先！");
        zh.put("progress.ahead.body", "好消息！\n\n您目前在以下目标上进度领先：%s。\n\n顺商祺、\nCarbon Tracker 团队");
        zh.put("progress.behind.subject", "⚠ 可持续发展目标进度落后");
        zh.put("progress.behind.body", "注意：\n\n您的目标“%s”目前进度落后。\n\n顺商祺、\nCarbon Tracker 团队");
        zh.put("notif.subject", "🔔 通知：%s");
        zh.put("notif.body", "尊敬的用户，\n\n您收到一条来自 Carbon Tracker 的新通知：\n\n标题：%s\n详情：%s\n\n顺商祺、\nCarbon Tracker 团队");
        zh.put("ticket.subject", "您的技术支持工单已解决");
        zh.put("ticket.body", "您好 %s，\n\n您的工单已成功解决。\n\n工单ID：%s\n主题：%s\n原因：%s\n解决步骤：%s\n\n顺商祺、\nCarbon Tracker 客服团队");
        DICT.put("zh", zh);
    }

    private String getLang(String toEmail) {
        if (userRepository == null) return "en";
        return userRepository.findByEmail(toEmail)
                .map(User::getLanguage)
                .orElse("en");
    }

    private String getVal(String key, String lang) {
        String baseLang = lang != null ? lang.split("_")[0] : "en";
        Map<String, String> map = DICT.get(baseLang);
        if (map == null) map = DICT.get("en");
        return map.getOrDefault(key, DICT.get("en").get(key));
    }

    public void sendOtpEmail(String toEmail, String otp) {
        String lang = getLang(toEmail);
        String subject = getVal("otp.subject", lang);
        String body = String.format(getVal("otp.dear", lang), otp);
        sendGenericEmail(toEmail, subject, body);
    }

    public void sendGoalAchievementEmail(String toEmail, String goalTitle) {
        String lang = getLang(toEmail);
        String subject = getVal("goal.subject", lang);
        String body = String.format(getVal("goal.body", lang), goalTitle);
        sendGenericEmail(toEmail, subject, body);
    }

    public void sendMilestoneAchievementEmail(String toEmail, String milestoneName, String description) {
        String lang = getLang(toEmail);
        String subject = String.format(getVal("milestone.subject", lang), milestoneName);
        String body = String.format(getVal("milestone.body", lang), milestoneName, description);
        sendGenericEmail(toEmail, subject, body);
    }

    public void sendGoalStatusAlertEmail(String toEmail, String goalTitle, boolean isAhead) {
        String lang = getLang(toEmail);
        String subject;
        String body;

        if (isAhead) {
            subject = getVal("progress.ahead.subject", lang);
            body = String.format(getVal("progress.ahead.body", lang), goalTitle);
        } else {
            subject = getVal("progress.behind.subject", lang);
            body = String.format(getVal("progress.behind.body", lang), goalTitle);
        }
        sendGenericEmail(toEmail, subject, body);
    }

    public void sendNotificationEmail(String toEmail, String title, String message) {
        String lang = getLang(toEmail);
        String subject = String.format(getVal("notif.subject", lang), title);
        String body = String.format(getVal("notif.body", lang), title, message);
        sendGenericEmail(toEmail, subject, body);
    }

    public void sendTicketResolutionEmail(
            String toEmail,
            String userName,
            String ticketId,
            String subject,
            String rootCause,
            String resolutionSteps,
            String changesMade,
            String verification,
            String finalNotes,
            String adminName,
            String resolutionDate) {
        String lang = getLang(toEmail);
        String emailSubject = getVal("ticket.subject", lang);
        String body = String.format(
                getVal("ticket.body", lang),
                userName, ticketId, subject, rootCause, resolutionSteps, changesMade, verification, finalNotes, adminName, resolutionDate
        );
        sendGenericEmail(toEmail, emailSubject, body);
    }

    private void sendGenericEmail(String toEmail, String subject, String body) {
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(body);
                message.setFrom("no-reply@carbontracker.com");
                mailSender.send(message);
                return;
            } catch (Exception e) {
                System.err.println("Failed to send email via SMTP, falling back to console print: " + e.getMessage());
            }
        }

        System.out.println("=================================================");
        System.out.println("MOCK EMAIL SENDER (No SMTP active)");
        System.out.println("To: " + toEmail);
        System.out.println("Subject: " + subject);
        System.out.println("Body:\n" + body);
        System.out.println("=================================================");
    }
}
