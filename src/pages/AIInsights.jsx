
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  Brain,
  CheckCircle2,
  Clock3,
  FileSearch,
  FileText,
  Languages,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  getHealthRecords,
  summarizeHealthRecord,
  getSavedHealthSummary,
} from "../services/healthService";

import ReportTextTools from "../components/ReportTextTools";
import "./AIInsights.css";

const translations = {
  en: {
    title: "AI Health Insights",
    subtitle: "Understand your health reports with intelligent analysis.",
    records: "Health Records",
    analyzed: "Analyzed Reports",
    status: "Analysis Status",
    ready: "Ready to analyze",
    select: "Select a health report",
    analyze: "Analyze Report",
    analyzing: "Analyzing...",
    refresh: "Refresh",
    overview: "Report Overview",
    keyFindings: "Key Findings",
    labResults: "Lab Results",
    medicines: "Medicines",
    diagnoses: "Diagnoses",
    dates: "Important Dates",
    questions: "Questions for Your Doctor",
    limitations: "Important Information",
    extracted: "Extracted Report Text",
    noRecords: "No health records found.",
    uploadFirst: "Upload a health report before starting your analysis.",
    noSummary: "Select a report to view its analysis.",
    noFindings: "No key findings were extracted.",
    noLab: "No lab results found.",
    noMedicine: "No medicines identified.",
    noDiagnosis: "No diagnoses identified.",
    noDates: "No dates identified.",
    disclaimer:
      "This tool organizes information from your records. It does not diagnose conditions, prescribe medicines, or replace professional medical advice.",
    saved: "Previously saved analysis loaded successfully.",
    success: "Report analysis completed successfully.",
    failed: "Unable to load the health report.",
    analyzeFailed: "Unable to analyze this report. Please try again.",
    report: "Report",
    loading: "Loading health records...",
    notAnalyzed: "Not analyzed",
    completed: "Completed",
    failedStatus: "Failed",
    noText: "No extracted text available.",
    extractionTime: "Analysis date",
    language: "Language",
    limitationsText:
      "Automated extraction may miss information or interpret medical text incorrectly. Verify important results with a qualified healthcare professional.",
    questionsList: [
      "What do these report findings mean for my health?",
      "Do I need any additional tests or follow-up?",
      "Are there any results that need prompt medical attention?",
    ],
  },

  ta: {
    title: "AI உடல்நல நுண்ணறிவுகள்",
    subtitle: "உங்கள் மருத்துவ அறிக்கைகளை எளிதாகப் புரிந்துகொள்ளுங்கள்.",
    records: "மருத்துவ பதிவுகள்",
    analyzed: "பகுப்பாய்வு செய்யப்பட்ட அறிக்கைகள்",
    status: "பகுப்பாய்வு நிலை",
    ready: "பகுப்பாய்வுக்கு தயார்",
    select: "மருத்துவ அறிக்கையைத் தேர்ந்தெடுக்கவும்",
    analyze: "அறிக்கையை பகுப்பாய்வு செய்",
    analyzing: "பகுப்பாய்வு செய்கிறது...",
    refresh: "புதுப்பி",
    overview: "அறிக்கை சுருக்கம்",
    keyFindings: "முக்கிய கண்டுபிடிப்புகள்",
    labResults: "ஆய்வக முடிவுகள்",
    medicines: "மருந்துகள்",
    diagnoses: "நோய் தொடர்பான குறிப்புகள்",
    dates: "முக்கிய தேதிகள்",
    questions: "மருத்துவரிடம் கேட்க வேண்டிய கேள்விகள்",
    limitations: "முக்கிய தகவல்",
    extracted: "அறிக்கையிலிருந்து பெறப்பட்ட உரை",
    noRecords: "மருத்துவ பதிவுகள் இல்லை.",
    uploadFirst: "முதலில் மருத்துவ அறிக்கையைப் பதிவேற்றவும்.",
    noSummary: "பகுப்பாய்வைப் பார்க்க அறிக்கையைத் தேர்ந்தெடுக்கவும்.",
    noFindings: "முக்கிய தகவல்கள் எதுவும் கிடைக்கவில்லை.",
    noLab: "ஆய்வக முடிவுகள் இல்லை.",
    noMedicine: "மருந்துகள் கண்டறியப்படவில்லை.",
    noDiagnosis: "நோய் தொடர்பான குறிப்புகள் இல்லை.",
    noDates: "தேதிகள் கண்டறியப்படவில்லை.",
    disclaimer:
      "இந்த கருவி மருத்துவப் பதிவுகளை ஒழுங்குபடுத்த உதவும். இது நோயைக் கண்டறியவோ மருந்துகளைப் பரிந்துரைக்கவோ மருத்துவரின் ஆலோசனைக்கு மாற்றாகவோ செயல்படாது.",
    saved: "சேமிக்கப்பட்ட பகுப்பாய்வு ஏற்றப்பட்டது.",
    success: "அறிக்கை பகுப்பாய்வு முடிந்தது.",
    failed: "மருத்துவ அறிக்கையை ஏற்ற முடியவில்லை.",
    analyzeFailed: "பகுப்பாய்வு செய்ய முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    report: "அறிக்கை",
    loading: "மருத்துவ பதிவுகள் ஏற்றப்படுகின்றன...",
    notAnalyzed: "பகுப்பாய்வு செய்யப்படவில்லை",
    completed: "முடிந்தது",
    failedStatus: "தோல்வியடைந்தது",
    noText: "பெறப்பட்ட உரை இல்லை.",
    extractionTime: "பகுப்பாய்வு தேதி",
    language: "மொழி",
    limitationsText:
      "தானியங்கி தகவல் பிரித்தெடுப்பு சில தகவல்களைத் தவறவிடலாம். முக்கிய முடிவுகளை மருத்துவ நிபுணரிடம் உறுதிப்படுத்தவும்.",
    questionsList: [
      "இந்த அறிக்கை முடிவுகள் எனது உடல்நலத்திற்கு என்ன அர்த்தம்?",
      "மேலும் பரிசோதனைகள் தேவையா?",
      "உடனடி மருத்துவ கவனம் தேவைப்படும் முடிவுகள் உள்ளனவா?",
    ],
  },

  hi: {
    title: "AI स्वास्थ्य जानकारी",
    subtitle: "अपनी स्वास्थ्य रिपोर्ट को आसानी से समझें।",
    records: "स्वास्थ्य रिकॉर्ड",
    analyzed: "विश्लेषित रिपोर्ट",
    status: "विश्लेषण स्थिति",
    ready: "विश्लेषण के लिए तैयार",
    select: "स्वास्थ्य रिपोर्ट चुनें",
    analyze: "रिपोर्ट का विश्लेषण करें",
    analyzing: "विश्लेषण हो रहा है...",
    refresh: "रिफ्रेश करें",
    overview: "रिपोर्ट का सारांश",
    keyFindings: "मुख्य निष्कर्ष",
    labResults: "लैब परिणाम",
    medicines: "दवाइयाँ",
    diagnoses: "निदान संबंधी जानकारी",
    dates: "महत्वपूर्ण तिथियाँ",
    questions: "डॉक्टर से पूछने वाले प्रश्न",
    limitations: "महत्वपूर्ण जानकारी",
    extracted: "निकाला गया रिपोर्ट टेक्स्ट",
    noRecords: "कोई स्वास्थ्य रिकॉर्ड नहीं मिला।",
    uploadFirst: "पहले स्वास्थ्य रिपोर्ट अपलोड करें।",
    noSummary: "विश्लेषण देखने के लिए रिपोर्ट चुनें।",
    noFindings: "कोई मुख्य निष्कर्ष नहीं मिला।",
    noLab: "कोई लैब परिणाम नहीं मिला।",
    noMedicine: "कोई दवा नहीं मिली।",
    noDiagnosis: "निदान संबंधी जानकारी नहीं मिली।",
    noDates: "कोई तारीख नहीं मिली।",
    disclaimer:
      "यह टूल रिकॉर्ड व्यवस्थित करता है। यह बीमारी का निदान या दवा की सलाह नहीं देता और डॉक्टर की सलाह का विकल्प नहीं है।",
    saved: "पहले से सेव किया गया विश्लेषण लोड हुआ।",
    success: "रिपोर्ट का विश्लेषण पूरा हुआ।",
    failed: "रिपोर्ट लोड नहीं हो सकी।",
    analyzeFailed: "विश्लेषण विफल हुआ। फिर से प्रयास करें।",
    report: "रिपोर्ट",
    loading: "रिकॉर्ड लोड हो रहे हैं...",
    notAnalyzed: "विश्लेषण नहीं हुआ",
    completed: "पूरा हुआ",
    failedStatus: "विफल",
    noText: "निकाला गया टेक्स्ट उपलब्ध नहीं है।",
    extractionTime: "विश्लेषण की तारीख",
    language: "भाषा",
    limitationsText:
      "स्वचालित विश्लेषण में गलतियाँ हो सकती हैं। महत्वपूर्ण परिणाम डॉक्टर से सत्यापित करें।",
    questionsList: [
      "इन परिणामों का मेरे स्वास्थ्य के लिए क्या अर्थ है?",
      "क्या अतिरिक्त जाँच की आवश्यकता है?",
      "क्या किसी परिणाम पर तुरंत ध्यान देना चाहिए?",
    ],
  },

  te: {
    title: "AI ఆరోగ్య సమాచారం",
    subtitle: "మీ ఆరోగ్య నివేదికలను సులభంగా అర్థం చేసుకోండి.",
    records: "ఆరోగ్య రికార్డులు",
    analyzed: "విశ్లేషించిన నివేదికలు",
    status: "విశ్లేషణ స్థితి",
    ready: "విశ్లేషణకు సిద్ధంగా ఉంది",
    select: "ఆరోగ్య నివేదికను ఎంచుకోండి",
    analyze: "నివేదికను విశ్లేషించండి",
    analyzing: "విశ్లేషిస్తోంది...",
    refresh: "రిఫ్రెష్",
    overview: "నివేదిక సారాంశం",
    keyFindings: "ముఖ్యమైన వివరాలు",
    labResults: "ల్యాబ్ ఫలితాలు",
    medicines: "మందులు",
    diagnoses: "వ్యాధి సంబంధిత వివరాలు",
    dates: "ముఖ్యమైన తేదీలు",
    questions: "వైద్యుడిని అడగాల్సిన ప్రశ్నలు",
    limitations: "ముఖ్యమైన సమాచారం",
    extracted: "నివేదిక నుండి పొందిన టెక్స్ట్",
    noRecords: "ఆరోగ్య రికార్డులు లేవు.",
    uploadFirst: "ముందుగా ఆరోగ్య నివేదికను అప్‌లోడ్ చేయండి.",
    noSummary: "విశ్లేషణ చూడటానికి నివేదికను ఎంచుకోండి.",
    noFindings: "ముఖ్యమైన వివరాలు కనుగొనబడలేదు.",
    noLab: "ల్యాబ్ ఫలితాలు లేవు.",
    noMedicine: "మందులు గుర్తించబడలేదు.",
    noDiagnosis: "వ్యాధి వివరాలు గుర్తించబడలేదు.",
    noDates: "తేదీలు గుర్తించబడలేదు.",
    disclaimer:
      "ఈ సాధనం ఆరోగ్య రికార్డులను క్రమబద్ధీకరిస్తుంది. ఇది వ్యాధిని నిర్ధారించదు లేదా వైద్యుడి సలహాకు ప్రత్యామ్నాయం కాదు.",
    saved: "సేవ్ చేసిన విశ్లేషణ లోడ్ అయింది.",
    success: "నివేదిక విశ్లేషణ పూర్తయింది.",
    failed: "నివేదికను లోడ్ చేయలేకపోయాము.",
    analyzeFailed: "విశ్లేషణ విఫలమైంది. మళ్లీ ప్రయత్నించండి.",
    report: "నివేదిక",
    loading: "ఆరోగ్య రికార్డులు లోడ్ అవుతున్నాయి...",
    notAnalyzed: "విశ్లేషించలేదు",
    completed: "పూర్తయింది",
    failedStatus: "విఫలమైంది",
    noText: "టెక్స్ట్ అందుబాటులో లేదు.",
    extractionTime: "విశ్లేషణ తేదీ",
    language: "భాష",
    limitationsText:
      "ఆటోమేటిక్ విశ్లేషణలో తప్పులు ఉండవచ్చు. ముఖ్యమైన ఫలితాలను వైద్యుడితో నిర్ధారించండి.",
    questionsList: [
      "ఈ ఫలితాలు నా ఆరోగ్యానికి ఏమి సూచిస్తున్నాయి?",
      "ఇంకా పరీక్షలు అవసరమా?",
      "తక్షణ వైద్య శ్రద్ధ అవసరమైన ఫలితాలు ఉన్నాయా?",
    ],
  },

  kn: {
    title: "AI ಆರೋಗ್ಯ ಮಾಹಿತಿ",
    subtitle: "ನಿಮ್ಮ ಆರೋಗ್ಯ ವರದಿಗಳನ್ನು ಸುಲಭವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.",
    records: "ಆರೋಗ್ಯ ದಾಖಲೆಗಳು",
    analyzed: "ವಿಶ್ಲೇಷಿಸಿದ ವರದಿಗಳು",
    status: "ವಿಶ್ಲೇಷಣೆಯ ಸ್ಥಿತಿ",
    ready: "ವಿಶ್ಲೇಷಣೆಗೆ ಸಿದ್ಧ",
    select: "ಆರೋಗ್ಯ ವರದಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    analyze: "ವರದಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
    analyzing: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    refresh: "ರಿಫ್ರೆಶ್",
    overview: "ವರದಿಯ ಸಾರಾಂಶ",
    keyFindings: "ಪ್ರಮುಖ ಅಂಶಗಳು",
    labResults: "ಪ್ರಯೋಗಾಲಯ ಫಲಿತಾಂಶಗಳು",
    medicines: "ಔಷಧಿಗಳು",
    diagnoses: "ರೋಗನಿರ್ಣಯದ ಮಾಹಿತಿ",
    dates: "ಪ್ರಮುಖ ದಿನಾಂಕಗಳು",
    questions: "ವೈದ್ಯರನ್ನು ಕೇಳಬೇಕಾದ ಪ್ರಶ್ನೆಗಳು",
    limitations: "ಪ್ರಮುಖ ಮಾಹಿತಿ",
    extracted: "ವರದಿಯಿಂದ ಪಡೆದ ಪಠ್ಯ",
    noRecords: "ಆರೋಗ್ಯ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
    uploadFirst: "ಮೊದಲು ಆರೋಗ್ಯ ವರದಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    noSummary: "ವಿಶ್ಲೇಷಣೆಯನ್ನು ನೋಡಲು ವರದಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    noFindings: "ಪ್ರಮುಖ ಅಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
    noLab: "ಪ್ರಯೋಗಾಲಯ ಫಲಿತಾಂಶಗಳಿಲ್ಲ.",
    noMedicine: "ಔಷಧಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
    noDiagnosis: "ರೋಗನಿರ್ಣಯದ ಮಾಹಿತಿ ಕಂಡುಬಂದಿಲ್ಲ.",
    noDates: "ದಿನಾಂಕಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
    disclaimer:
      "ಈ ಸಾಧನವು ದಾಖಲೆಗಳನ್ನು ಸಂಘಟಿಸುತ್ತದೆ. ಇದು ರೋಗನಿರ್ಣಯ ಅಥವಾ ಔಷಧಿ ಸಲಹೆ ನೀಡುವುದಿಲ್ಲ.",
    saved: "ಉಳಿಸಿದ ವಿಶ್ಲೇಷಣೆ ಲೋಡ್ ಆಗಿದೆ.",
    success: "ವರದಿಯ ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ.",
    failed: "ವರದಿಯನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    analyzeFailed: "ವಿಶ್ಲೇಷಣೆ ವಿಫಲವಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    report: "ವರದಿ",
    loading: "ಆರೋಗ್ಯ ದಾಖಲೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    notAnalyzed: "ವಿಶ್ಲೇಷಿಸಿಲ್ಲ",
    completed: "ಪೂರ್ಣಗೊಂಡಿದೆ",
    failedStatus: "ವಿಫಲವಾಗಿದೆ",
    noText: "ಪಠ್ಯ ಲಭ್ಯವಿಲ್ಲ.",
    extractionTime: "ವಿಶ್ಲೇಷಣೆಯ ದಿನಾಂಕ",
    language: "ಭಾಷೆ",
    limitationsText:
      "ಸ್ವಯಂಚಾಲಿತ ವಿಶ್ಲೇಷಣೆಯಲ್ಲಿ ತಪ್ಪುಗಳಿರಬಹುದು. ಪ್ರಮುಖ ಫಲಿತಾಂಶಗಳನ್ನು ವೈದ್ಯರೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ.",
    questionsList: [
      "ಈ ಫಲಿತಾಂಶಗಳು ನನ್ನ ಆರೋಗ್ಯಕ್ಕೆ ಏನು ಅರ್ಥ ನೀಡುತ್ತವೆ?",
      "ಹೆಚ್ಚುವರಿ ಪರೀಕ್ಷೆಗಳು ಬೇಕೇ?",
      "ತಕ್ಷಣ ವೈದ್ಯಕೀಯ ಗಮನ ಅಗತ್ಯವಿರುವ ಫಲಿತಾಂಶಗಳಿವೆಯೇ?",
    ],
  },

  ml: {
    title: "AI ആരോഗ്യ വിവരങ്ങൾ",
    subtitle: "നിങ്ങളുടെ ആരോഗ്യ റിപ്പോർട്ടുകൾ എളുപ്പത്തിൽ മനസ്സിലാക്കുക.",
    records: "ആരോഗ്യ രേഖകൾ",
    analyzed: "വിശകലനം ചെയ്ത റിപ്പോർട്ടുകൾ",
    status: "വിശകലന നില",
    ready: "വിശകലനത്തിന് തയ്യാറാണ്",
    select: "ആരോഗ്യ റിപ്പോർട്ട് തിരഞ്ഞെടുക്കുക",
    analyze: "റിപ്പോർട്ട് വിശകലനം ചെയ്യുക",
    analyzing: "വിശകലനം ചെയ്യുന്നു...",
    refresh: "പുതുക്കുക",
    overview: "റിപ്പോർട്ട് സംഗ്രഹം",
    keyFindings: "പ്രധാന കണ്ടെത്തലുകൾ",
    labResults: "ലാബ് ഫലങ്ങൾ",
    medicines: "മരുന്നുകൾ",
    diagnoses: "രോഗനിർണയ വിവരങ്ങൾ",
    dates: "പ്രധാന തീയതികൾ",
    questions: "ഡോക്ടറോട് ചോദിക്കേണ്ട ചോദ്യങ്ങൾ",
    limitations: "പ്രധാന വിവരം",
    extracted: "റിപ്പോർട്ടിൽ നിന്ന് ലഭിച്ച ടെക്സ്റ്റ്",
    noRecords: "ആരോഗ്യ രേഖകൾ കണ്ടെത്തിയില്ല.",
    uploadFirst: "ആദ്യം ആരോഗ്യ റിപ്പോർട്ട് അപ്‌ലോഡ് ചെയ്യുക.",
    noSummary: "വിശകലനം കാണാൻ റിപ്പോർട്ട് തിരഞ്ഞെടുക്കുക.",
    noFindings: "പ്രധാന കണ്ടെത്തലുകളൊന്നും ലഭിച്ചില്ല.",
    noLab: "ലാബ് ഫലങ്ങൾ കണ്ടെത്തിയില്ല.",
    noMedicine: "മരുന്നുകൾ കണ്ടെത്തിയില്ല.",
    noDiagnosis: "രോഗനിർണയ വിവരങ്ങൾ കണ്ടെത്തിയില്ല.",
    noDates: "തീയതികൾ കണ്ടെത്തിയില്ല.",
    disclaimer:
      "ഈ ഉപകരണം ആരോഗ്യ രേഖകൾ ക്രമീകരിക്കാൻ സഹായിക്കുന്നു. ഇത് രോഗനിർണയത്തിനോ മരുന്ന് നിർദേശിക്കാനോ ഡോക്ടറുടെ ഉപദേശത്തിന് പകരമായോ ഉപയോഗിക്കരുത്.",
    saved: "സംരക്ഷിച്ച വിശകലനം ലോഡ് ചെയ്തു.",
    success: "റിപ്പോർട്ട് വിശകലനം പൂർത്തിയായി.",
    failed: "റിപ്പോർട്ട് ലോഡ് ചെയ്യാനായില്ല.",
    analyzeFailed: "വിശകലനം പരാജയപ്പെട്ടു. വീണ്ടും ശ്രമിക്കുക.",
    report: "റിപ്പോർട്ട്",
    loading: "ആരോഗ്യ രേഖകൾ ലോഡ് ചെയ്യുന്നു...",
    notAnalyzed: "വിശകലനം ചെയ്തിട്ടില്ല",
    completed: "പൂർത്തിയായി",
    failedStatus: "പരാജയപ്പെട്ടു",
    noText: "ടെക്സ്റ്റ് ലഭ്യമല്ല.",
    extractionTime: "വിശകലന തീയതി",
    language: "ഭാഷ",
    limitationsText:
      "ഓട്ടോമാറ്റിക് വിശകലനത്തിൽ പിശകുകൾ ഉണ്ടാകാം. പ്രധാന ഫലങ്ങൾ ഡോക്ടറുമായി പരിശോധിക്കുക.",
    questionsList: [
      "ഈ ഫലങ്ങൾ എന്റെ ആരോഗ്യത്തിന് എന്താണ് അർത്ഥമാക്കുന്നത്?",
      "കൂടുതൽ പരിശോധനകൾ ആവശ്യമുണ്ടോ?",
      "ഉടൻ വൈദ്യസഹായം ആവശ്യമായ ഫലങ്ങളുണ്ടോ?",
    ],
  },
};

const languageOptions = [
  { value: "en", label: "English" },
  { value: "ta", label: "தமிழ்" },
  { value: "hi", label: "हिन्दी" },
  { value: "te", label: "తెలుగు" },
  { value: "kn", label: "ಕನ್ನಡ" },
  { value: "ml", label: "മലയാളം" },
];

function getRecordId(record) {
  return record?.id == null ? "" : String(record.id);
}

function isAnalyzed(record) {
  return record?.extraction_status === "completed";
}

function getRecordName(record) {
  return record?.name || record?.title || `Health Report #${record?.id}`;
}

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.entries(value);
  return [];
}

function makeSummaryFromSavedData(data, t) {
  const structured = data?.structured_data || {};
  const text = data?.extracted_text || "";

  const keyLines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && /\d/.test(line))
    .slice(0, 20);

  return {
    record_id: data?.record_id,
    record_name: data?.record_name,
    extracted_text: text,
    truncated: false,
    extraction_status: data?.extraction_status || "completed",
    extracted_at: data?.extracted_at || null,
    message: t.saved,
    summary: {
      overview:
        "Previously extracted information has been loaded from your saved health record.",
      key_lines: keyLines,
      structured_data: structured,
      doctor_questions: t.questionsList,
      limitations: t.limitationsText,
    },
  };
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString();
}

function getDisplayValue(value) {
  if (value == null || value === "") return "—";

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "—";
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${String(item)}`)
      .join(" · ");
  }

  return String(value);
}

function DataList({ items, emptyText }) {
  const normalized = normalizeList(items);

  if (!normalized.length) {
    return <p className="ai-empty-message">{emptyText}</p>;
  }

  return (
    <ul className="ai-data-list">
      {normalized.map((item, index) => {
        const isPair = Array.isArray(item) && item.length === 2;
        const label = isPair ? item[0] : null;
        const value = isPair ? item[1] : item;

        return (
          <li key={`${String(label ?? value)}-${index}`}>
            {label != null && (
              <strong>{String(label).replaceAll("_", " ")}: </strong>
            )}
            <span>{getDisplayValue(value)}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function AIInsights() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const [language, setLanguage] = useState("en");

  const t = translations[language] || translations.en;
  const reportSummary = summary?.summary;
  const structured = reportSummary?.structured_data || {};
  const selectedRecord =
    records.find((record) => getRecordId(record) === selectedId) || null;

  const analyzedCount = records.filter(isAnalyzed).length;

  const loadRecords = useCallback(async () => {
    try {
      setError("");

      const response = await getHealthRecords();
      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.results)
          ? response.results
          : Array.isArray(response?.records)
            ? response.records
            : [];

      setRecords(items);

      setSelectedId((currentId) => {
        const stillExists = items.some(
          (record) => getRecordId(record) === currentId
        );

        if (stillExists) return currentId;

        const firstRecord = items[0];
        return firstRecord ? getRecordId(firstRecord) : "";
      });
    } catch (err) {
      setError(err.message || t.failed);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t.failed]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Load saved data only when the selected record changes.
  useEffect(() => {
    let cancelled = false;

    async function loadSelectedSummary() {
      setSummaryError("");

      if (!selectedId) {
        setSummary(null);
        return;
      }

      const record = records.find(
        (item) => getRecordId(item) === selectedId
      );

      if (!record) return;

      // Do not replace the full summary returned by the analyze endpoint.
      if (String(summary?.record_id ?? "") === selectedId) return;

      if (!isAnalyzed(record)) {
        setSummary(null);
        return;
      }

      try {
        const saved = await getSavedHealthSummary(selectedId);

        if (cancelled) return;

        setSummary(makeSummaryFromSavedData(saved, t));
      } catch (err) {
        if (cancelled) return;

        setSummaryError(err.message || t.failed);
        setSummary(null);
      }
    }

    loadSelectedSummary();

    return () => {
      cancelled = true;
    };
  }, [selectedId, records, summary?.record_id, t]);

  function handleRecordChange(event) {
    setSelectedId(event.target.value);
    setSummary(null);
    setSummaryError("");
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadRecords();
  }

  async function handleSummarize() {
    if (!selectedId) {
      setSummaryError(t.uploadFirst);
      return;
    }

    setSummarizing(true);
    setSummaryError("");
    setSummary(null);

    try {
      const result = await summarizeHealthRecord(selectedId);

      setSummary({
        ...result,
        record_id: result?.record_id ?? Number(selectedId),
        record_name:
          result?.record_name || getRecordName(selectedRecord),
      });

      // Refresh the list so its extraction status is up to date.
      const response = await getHealthRecords();

      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.results)
          ? response.results
          : Array.isArray(response?.records)
            ? response.records
            : [];

      setRecords(items);
    } catch (err) {
      setSummaryError(err.message || t.analyzeFailed);
    } finally {
      setSummarizing(false);
    }
  }

  const keyLines = reportSummary?.key_lines || [];
  const labResults = structured?.lab_results || [];
  const medicines = structured?.medicines || [];
  const diagnoses = structured?.diagnoses || [];
  const dates = structured?.dates || [];

  return (
    <main className="ai-insights-page">
      <header className="ai-insights-header">
        <div className="ai-header-title">
          <div className="ai-title-icon">
            <Brain size={26} />
          </div>

          <div>
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>
        </div>

        <div className="insights-header-actions">
          <label className="language-picker">
            <Languages size={17} />
            <span>{t.language}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              aria-label={t.language}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="ai-secondary-button"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "ai-spinning" : ""}
            />
            {t.refresh}
          </button>
        </div>
      </header>

      {error && (
        <div className="ai-alert ai-alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <section className="ai-stats-grid">
        <article className="ai-stat-card">
          <div className="ai-stat-icon ai-icon-blue">
            <FileText size={21} />
          </div>
          <div>
            <p>{t.records}</p>
            <h2>{loading ? "—" : records.length}</h2>
          </div>
        </article>

        <article className="ai-stat-card">
          <div className="ai-stat-icon ai-icon-green">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <p>{t.analyzed}</p>
            <h2>{loading ? "—" : analyzedCount}</h2>
          </div>
        </article>

        <article className="ai-stat-card">
          <div className="ai-stat-icon ai-icon-purple">
            <Activity size={21} />
          </div>
          <div>
            <p>{t.status}</p>
            <h2 className="ai-stat-status">
              {summarizing ? t.analyzing : t.ready}
            </h2>
          </div>
        </article>
      </section>

      <section className="ai-panel ai-report-selector">
        <div className="ai-panel-heading">
          <div className="ai-heading-icon">
            <FileSearch size={21} />
          </div>
          <div>
            <h2>{t.select}</h2>
            <p>{t.subtitle}</p>
          </div>
        </div>

        {loading ? (
          <p className="ai-loading-message">
            <RefreshCw size={17} className="ai-spinning" />
            {t.loading}
          </p>
        ) : records.length === 0 ? (
          <div className="ai-empty-state">
            <FileText size={32} />
            <h3>{t.noRecords}</h3>
            <p>{t.uploadFirst}</p>
          </div>
        ) : (
          <div className="ai-selector-controls">
            <select
              className="ai-record-select"
              value={selectedId}
              onChange={handleRecordChange}
              aria-label={t.select}
            >
              <option value="">{t.select}</option>
              {records.map((record) => (
                <option key={record.id} value={getRecordId(record)}>
                  {getRecordName(record)}
                  {isAnalyzed(record) ? ` — ${t.completed}` : ""}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="ai-primary-button"
              onClick={handleSummarize}
              disabled={!selectedId || summarizing}
            >
              {summarizing ? (
                <RefreshCw size={17} className="ai-spinning" />
              ) : (
                <Sparkles size={17} />
              )}
              {summarizing ? t.analyzing : t.analyze}
            </button>
          </div>
        )}

        {selectedRecord && (
          <div className="ai-selected-record-meta">
            <span>
              <FileText size={15} />
              {getRecordName(selectedRecord)}
            </span>

            <span
              className={`ai-status-badge ${
                isAnalyzed(selectedRecord)
                  ? "ai-status-completed"
                  : "ai-status-pending"
              }`}
            >
              {isAnalyzed(selectedRecord) ? t.completed : t.notAnalyzed}
            </span>
          </div>
        )}
      </section>

      {summaryError && (
        <div className="ai-alert ai-alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{summaryError}</span>
        </div>
      )}

      {!summary && !summarizing && selectedRecord && !summaryError && (
        <section className="ai-panel ai-empty-state">
          <Brain size={36} />
          <h3>{t.noSummary}</h3>
        </section>
      )}

      {summarizing && (
        <section className="ai-panel ai-analysis-loading">
          <div className="ai-loading-orb">
            <Brain size={30} />
          </div>
          <h3>{t.analyzing}</h3>
          <p>{t.subtitle}</p>
        </section>
      )}

      {summary && reportSummary && (
        <>
          <section className="ai-panel ai-overview-panel">
            <div className="ai-panel-heading">
              <div className="ai-heading-icon ai-heading-purple">
                <Sparkles size={21} />
              </div>
              <div>
                <h2>{t.overview}</h2>
                <p>
                  {summary.record_name ||
                    getRecordName(selectedRecord)}
                </p>
              </div>
            </div>

            <p className="ai-overview-text">
              {reportSummary.overview || t.noFindings}
            </p>

            {summary.message && (
              <p className="ai-success-message">
                <CheckCircle2 size={16} />
                {summary.message}
              </p>
            )}
          </section>

          <section className="ai-panel">
            <div className="ai-panel-heading">
              <div className="ai-heading-icon">
                <Activity size={21} />
              </div>
              <div>
                <h2>{t.keyFindings}</h2>
                <p>{t.extracted}</p>
              </div>
            </div>

            {keyLines.length ? (
              <ul className="ai-findings-list">
                {keyLines.map((line, index) => (
                  <li key={`${index}-${line}`}>
                    <span className="ai-finding-dot" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ai-empty-message">{t.noFindings}</p>
            )}
          </section>

          <section className="ai-data-grid">
            <article className="ai-panel ai-data-card">
              <div className="ai-panel-heading">
                <div className="ai-heading-icon ai-heading-blue">
                  <Activity size={20} />
                </div>
                <div>
                  <h2>{t.labResults}</h2>
                  <p>{normalizeList(labResults).length} items</p>
                </div>
              </div>
              <DataList items={labResults} emptyText={t.noLab} />
            </article>

            <article className="ai-panel ai-data-card">
              <div className="ai-panel-heading">
                <div className="ai-heading-icon ai-heading-green">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2>{t.medicines}</h2>
                  <p>{normalizeList(medicines).length} items</p>
                </div>
              </div>
              <DataList items={medicines} emptyText={t.noMedicine} />
            </article>

            <article className="ai-panel ai-data-card">
              <div className="ai-panel-heading">
                <div className="ai-heading-icon ai-heading-purple">
                  <FileText size={20} />
                </div>
                <div>
                  <h2>{t.diagnoses}</h2>
                  <p>{normalizeList(diagnoses).length} items</p>
                </div>
              </div>
              <DataList items={diagnoses} emptyText={t.noDiagnosis} />
            </article>

            <article className="ai-panel ai-data-card">
              <div className="ai-panel-heading">
                <div className="ai-heading-icon ai-heading-orange">
                  <Clock3 size={20} />
                </div>
                <div>
                  <h2>{t.dates}</h2>
                  <p>{normalizeList(dates).length} items</p>
                </div>
              </div>
              <DataList items={dates} emptyText={t.noDates} />
            </article>
          </section>

          <section className="ai-panel">
            <div className="ai-panel-heading">
              <div className="ai-heading-icon ai-heading-blue">
                <Brain size={21} />
              </div>
              <div>
                <h2>{t.questions}</h2>
                <p>Use these as discussion prompts with your doctor.</p>
              </div>
            </div>

            <ol className="ai-questions-list">
              {(reportSummary.doctor_questions?.length
                ? reportSummary.doctor_questions
                : t.questionsList
              ).map((question, index) => (
                <li key={`${index}-${question}`}>{question}</li>
              ))}
            </ol>
          </section>

          <section className="ai-panel ai-limitations-panel">
            <div className="ai-panel-heading">
              <div className="ai-heading-icon ai-heading-orange">
                <AlertCircle size={21} />
              </div>
              <div>
                <h2>{t.limitations}</h2>
              </div>
            </div>

            <p>
              {reportSummary.limitations || t.limitationsText}
            </p>
          </section>

          <section className="ai-panel">
            <div className="ai-panel-heading">
              <div className="ai-heading-icon">
                <FileText size={21} />
              </div>
              <div>
                <h2>{t.extracted}</h2>
                <p>
                  {t.extractionTime}:{" "}
                  {formatDate(summary.extracted_at)}
                </p>
              </div>
            </div>

            {summary.extracted_text ? (
              <>
                <pre className="ai-extracted-text">
                  {summary.extracted_text}
                </pre>
                <ReportTextTools text={summary.extracted_text} />
              </>
            ) : (
              <p className="ai-empty-message">{t.noText}</p>
            )}
          </section>
        </>
      )}

      <footer className="ai-disclaimer">
        <ShieldCheck size={20} />
        <p>{t.disclaimer}</p>
      </footer>
    </main>
  );
}
