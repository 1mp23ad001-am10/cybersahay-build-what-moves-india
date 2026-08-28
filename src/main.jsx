import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  COPY,
  LANGS,
  buildReport,
  classify,
  extractCaseDetails,
} from './reportEngine.js';
import './styles.css';

const APP_VERSION = 'cyber-report-v5-portal-intake';
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MAX_ATTACHMENTS = 10;
const emptyCaseDetails = () => ({ incidentDate: '', incidentTime: '', state: '', paymentSource: '', transactionId: '', amount: '', transactionCount: '1', payerBank: '', payeeBank: '', payeeUpi: '', paymentApp: '', suspectPhone: '', suspectUpi: '', suspectAccount: '', platform: '', url: '', handle: '', syntheticType: '', syntheticHarm: '' });
const INTAKE_GUIDE = {
  en: {
    title: 'Before you begin',
    body: 'Tell your story in your own words first. We will keep it unchanged, map the facts we can find, then ask only for the next missing detail.',
    required: 'Needed to create a reviewable local draft',
    optional: 'Helpful when available',
    base: 'What happened, incident date and time, and State / UT',
    financial: 'Exact loss amount, bank/wallet or merchant, and transaction / UTR reference',
    other: 'Platform or app involved if known',
    optionalItems: 'Suspect handle, URLs, screenshots, chats, emails, and other evidence. Never include OTPs, PINs, passwords, full card numbers, or remote-access approvals.',
    analyse: 'Map my report',
    frozen: 'Your original account is saved and frozen. It will not be overwritten while we collect the remaining facts.',
    changeStory: 'Change original account',
    missing: 'One detail still needed',
    allPresent: 'Core details are complete. You can add optional evidence or review the report.',
    correctionLabel: 'Correct one detail',
    correctionHint: 'Type a natural-language correction, for example “change the loss amount to 2300” or “set incident time to 5:30 pm”. You can also edit any field below directly.',
    correctionPlaceholder: 'Describe one correction…',
    applyCorrection: 'Apply correction',
    correctionNeedField: 'Say which field to change (for example date, time, State, amount, bank, transaction ID, name, phone, or email), or edit it directly below.',
    correctionApplied: 'Updated only the requested field.',
    reviewCorrection: 'Make a correction',
    finalCheck: 'Before local submission, check the category, public narrative, protected details, contact details, and evidence. If anything is wrong, make a correction before confirming.',
  },
  hi: {
    title: 'शुरू करने से पहले', body: 'पहले अपनी बात अपने शब्दों में बताएं। हम उसे बिना बदले रखेंगे, मिले हुए तथ्य मैप करेंगे और केवल अगली छूटी हुई जानकारी पूछेंगे।', required: 'समीक्षा योग्य स्थानीय ड्राफ्ट के लिए जरूरी', optional: 'मिले तो उपयोगी', base: 'क्या हुआ, घटना की तारीख और समय, तथा राज्य / केंद्रशासित प्रदेश', financial: 'सटीक नुकसान, बैंक/वॉलेट या मर्चेंट, और ट्रांज़ैक्शन / UTR रेफरेंस', other: 'प्लेटफ़ॉर्म या ऐप, यदि पता हो', optionalItems: 'संदिग्ध हैंडल, URL, स्क्रीनशॉट, चैट, ईमेल और अन्य सबूत। OTP, PIN, पासवर्ड, पूरे कार्ड नंबर या रिमोट-ऐक्सेस अनुमति कभी न दें।', analyse: 'मेरी रिपोर्ट मैप करें', frozen: 'आपका मूल विवरण सुरक्षित और स्थिर है। बाकी तथ्य लेते समय इसे बदला नहीं जाएगा।', changeStory: 'मूल विवरण बदलें', missing: 'एक जानकारी अभी चाहिए', allPresent: 'मुख्य जानकारी पूरी है। वैकल्पिक सबूत जोड़ें या रिपोर्ट की समीक्षा करें।', correctionLabel: 'एक जानकारी सुधारें', correctionHint: 'साधारण भाषा में सुधार लिखें, जैसे “नुकसान 2300 करें” या “समय 5:30 pm करें”। नीचे किसी भी फ़ील्ड को सीधे भी बदल सकते हैं।', correctionPlaceholder: 'एक सुधार लिखें…', applyCorrection: 'सुधार लागू करें', correctionNeedField: 'बदलने वाला फ़ील्ड बताएं या नीचे सीधे बदलें।', correctionApplied: 'केवल मांगा गया फ़ील्ड बदला गया।', reviewCorrection: 'सुधार करें', finalCheck: 'स्थानीय सबमिशन से पहले श्रेणी, सार्वजनिक विवरण, सुरक्षित विवरण, संपर्क और सबूत जांचें। कुछ गलत हो तो पहले सुधार करें।',
  },
  kn: {
    title: 'ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು', body: 'ಮೊದಲು ನಿಮ್ಮ ಕಥೆಯನ್ನು ನಿಮ್ಮ ಮಾತುಗಳಲ್ಲಿ ಹೇಳಿ. ಅದನ್ನು ಬದಲಿಸದೆ ಇಟ್ಟುಕೊಂಡು, ಸಿಕ್ಕ ವಿವರಗಳನ್ನು ಮ್ಯಾಪ್ ಮಾಡಿ, ತಪ್ಪಿರುವ ಮುಂದಿನ ಮಾಹಿತಿಯನ್ನು ಮಾತ್ರ ಕೇಳುತ್ತೇವೆ.', required: 'ಪರಿಶೀಲಿಸಬಹುದಾದ ಸ್ಥಳೀಯ ಡ್ರಾಫ್ಟ್‌ಗೆ ಬೇಕಾದವು', optional: 'ಇದ್ದರೆ ಸಹಾಯಕ', base: 'ಏನಾಯಿತು, ಘಟನೆಯ ದಿನಾಂಕ ಮತ್ತು ಸಮಯ, ಹಾಗೂ ರಾಜ್ಯ / ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶ', financial: 'ನಿಖರ ನಷ್ಟ, ಬ್ಯಾಂಕ್/ವಾಲೆಟ್ ಅಥವಾ ವ್ಯಾಪಾರಿ, ಮತ್ತು ವಹಿವಾಟು / UTR ಉಲ್ಲೇಖ', other: 'ತಿಳಿದಿದ್ದರೆ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಅಥವಾ ಆ್ಯಪ್', optionalItems: 'ಶಂಕಿತ ಹ್ಯಾಂಡಲ್, URL, ಸ್ಕ್ರೀನ್‌ಶಾಟ್, ಚಾಟ್, ಇಮೇಲ್ ಮತ್ತು ಇತರೆ ಸಾಕ್ಷ್ಯ. OTP, PIN, ಪಾಸ್‌ವರ್ಡ್, ಸಂಪೂರ್ಣ ಕಾರ್ಡ್ ಸಂಖ್ಯೆ ಅಥವಾ ರಿಮೋಟ್-ಆಕ್ಸೆಸ್ ಅನುಮತಿ ಎಂದಿಗೂ ನೀಡಬೇಡಿ.', analyse: 'ನನ್ನ ವರದಿಯನ್ನು ಮ್ಯಾಪ್ ಮಾಡಿ', frozen: 'ನಿಮ್ಮ ಮೂಲ ಹೇಳಿಕೆ ಉಳಿಸಲಾಗಿದೆ ಮತ್ತು ಸ್ಥಿರವಾಗಿದೆ. ಉಳಿದ ವಿವರಗಳನ್ನು ಕೇಳುವಾಗ ಅದನ್ನು ಬದಲಿಸಲಾಗುವುದಿಲ್ಲ.', changeStory: 'ಮೂಲ ಹೇಳಿಕೆ ಬದಲಿಸಿ', missing: 'ಇನ್ನೂ ಒಂದು ವಿವರ ಬೇಕು', allPresent: 'ಮುಖ್ಯ ವಿವರಗಳು ಪೂರ್ಣವಾಗಿವೆ. ಐಚ್ಛಿಕ ಸಾಕ್ಷ್ಯ ಸೇರಿಸಿ ಅಥವಾ ವರದಿ ಪರಿಶೀಲಿಸಿ.', correctionLabel: 'ಒಂದು ವಿವರ ಸರಿಪಡಿಸಿ', correctionHint: 'ಸಹಜ ಭಾಷೆಯಲ್ಲಿ ಸರಿಪಡಿಸುವುದನ್ನು ಬರೆಯಿರಿ ಅಥವಾ ಕೆಳಗಿನ ಫೀಲ್ಡ್ ಅನ್ನು ನೇರವಾಗಿ ಬದಲಿಸಿ.', correctionPlaceholder: 'ಒಂದು ತಿದ್ದುಪಡಿ ಬರೆಯಿರಿ…', applyCorrection: 'ತಿದ್ದುಪಡಿ ಅನ್ವಯಿಸಿ', correctionNeedField: 'ಯಾವ ಫೀಲ್ಡ್ ಬದಲಿಸಬೇಕೆಂದು ತಿಳಿಸಿ ಅಥವಾ ಕೆಳಗೆ ನೇರವಾಗಿ ಬದಲಿಸಿ.', correctionApplied: 'ಕೇಳಿದ ಫೀಲ್ಡ್ ಮಾತ್ರ ನವೀಕರಿಸಲಾಗಿದೆ.', reviewCorrection: 'ತಿದ್ದುಪಡಿ ಮಾಡಿ', finalCheck: 'ಸ್ಥಳೀಯ ಸಲ್ಲಿಕೆಗೆ ಮೊದಲು ವರ್ಗ, ಸಾರ್ವಜನಿಕ ವಿವರ, ಸುರಕ್ಷಿತ ವಿವರ, ಸಂಪರ್ಕ ಮತ್ತು ಸಾಕ್ಷ್ಯ ಪರಿಶೀಲಿಸಿ. ತಪ್ಪಿದ್ದರೆ ಮೊದಲು ಸರಿಪಡಿಸಿ.',
  },
};
const isSupportedLanguage = (value) => LANGS.some(([code]) => code === value);
const languageLabel = (value) => LANGS.find(([code]) => code === value)?.[1] || 'English';
const supportedVoiceLanguage = (value) => (isSupportedLanguage(value) ? value : 'en-IN');
const detectBrowserLanguage = () => {
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const candidate of candidates) {
    const match = LANGS.find(([code]) => code.slice(0, 2) === String(candidate).slice(0, 2).toLowerCase());
    if (match) return match[0];
  }
  return 'en-IN';
};
const hasExpectedScript = (text, language) => {
  if (language === 'hi') return (String(text).match(/[\u0900-\u097F]/g) || []).length >= 2;
  if (language === 'kn') return (String(text).match(/[\u0C80-\u0CFF]/g) || []).length >= 2;
  if (language === 'en') return /[a-z]/i.test(String(text));
  return true;
};
const langKey = (lang) => (lang || 'en-IN').slice(0, 2);
const copyFor = (lang) => COPY[langKey(lang)] || COPY.en;
const storedDraftValue = (key) => (
  localStorage.getItem('bwm-app-version') === APP_VERSION ? localStorage.getItem(key) || '' : ''
);

function App() {
  const [languagePreference, setLanguagePreference] = useState(() => localStorage.getItem('bwm-language-preference') || 'auto');
  const [lang, setLang] = useState(() => {
    const preference = localStorage.getItem('bwm-language-preference') || 'auto';
    return preference === 'auto' ? detectBrowserLanguage() : supportedVoiceLanguage(preference);
  });
  const [translatedCopy, setTranslatedCopy] = useState(null);
  const [route, setRoute] = useState(localStorage.getItem('bwm-route') || 'other');
  const [input, setInput] = useState(storedDraftValue('bwm-input'));
  const [sensitive, setSensitive] = useState(storedDraftValue('bwm-sensitive'));
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [caseDetails, setCaseDetails] = useState(emptyCaseDetails);
  const [intakeLocked, setIntakeLocked] = useState(false);
  const [correction, setCorrection] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [draftSaveState, setDraftSaveState] = useState('');
  const [highContrast, setHighContrast] = useState(localStorage.getItem('bwm-contrast') === 'true');
  const [fontSize, setFontSize] = useState(localStorage.getItem('bwm-font-size') || 'normal');
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const incidentStopTimerRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const languageSelectRef = useRef(null);
  const ui = translatedCopy || copyFor(lang);
  const intakeGuide = INTAKE_GUIDE[langKey(lang)] || INTAKE_GUIDE.en;
  const voiceLanguage = { name: languageLabel(lang), code: lang.split('-')[0] };

  const draftId = useMemo(() => {
    let stored = localStorage.getItem('bwm-id');
    if (!stored) {
      stored = crypto.randomUUID();
      localStorage.setItem('bwm-id', stored);
    }
    return stored;
  }, []);

  useEffect(() => {
    if (localStorage.getItem('bwm-app-version') !== APP_VERSION) {
      localStorage.setItem('bwm-app-version', APP_VERSION);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bwm-lang', lang);
    localStorage.setItem('bwm-language-preference', languagePreference);
    localStorage.setItem('bwm-route', route);
    localStorage.setItem('bwm-input', input);
    localStorage.setItem('bwm-sensitive', sensitive);
    document.documentElement.lang = lang;
  }, [lang, languagePreference, route, input, sensitive]);

  useEffect(() => {
    let active = true;
    setTranslatedCopy(null);
    if (COPY[langKey(lang)]) return undefined;
    fetch('/api/ui-translate', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ language: lang, strings: COPY.en }),
    })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => { if (active && data.copy) setTranslatedCopy({ ...COPY.en, ...data.copy }); })
      .catch(() => { /* English remains usable when translation is unavailable. */ });
    return () => { active = false; };
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('bwm-contrast', String(highContrast));
    localStorage.setItem('bwm-font-size', fontSize);
  }, [highContrast, fontSize]);

  useEffect(() => {
    let active = true;
    async function restoreDraft() {
      try {
        const response = await fetch(`/api/draft/${draftId}`);
        if (!response.ok) return;
        const saved = (await response.json()).data?.form;
        if (!saved || !active) return;
        const savedPreference = localStorage.getItem('bwm-language-preference') || 'auto';
        if (savedPreference !== 'auto') setLang(supportedVoiceLanguage(savedPreference));
        setRoute(saved.route || 'other');
        setInput(saved.input || '');
        setCaseDetails((current) => ({ ...current, ...(saved.caseDetails || {}) }));
        setContact((current) => ({ ...current, ...(saved.contact || {}) }));
        setDraftSaveState(`${copyFor(saved.lang || 'en-IN').saved} ✓`);
      } catch {
        // Typing remains fully usable if the local draft service is unavailable.
      } finally {
        if (active) setDraftHydrated(true);
      }
    }
    restoreDraft();
    return () => { active = false; };
  }, [draftId]);

  function chooseLanguage(value) {
    setLanguagePreference(value);
    setLang(value === 'auto' ? detectBrowserLanguage() : supportedVoiceLanguage(value));
  }

  useEffect(() => {
    if (recording) return undefined;
    const timer = window.setInterval(() => {
      const selected = languageSelectRef.current?.value;
      if (selected && selected !== languagePreference) chooseLanguage(selected);
    }, 250);
    return () => window.clearInterval(timer);
  }, [languagePreference, recording]);

  function resolveTranscriptionLanguage(language) {
    if (languagePreference !== 'auto') return lang;
    if (!isSupportedLanguage(language)) {
      throw new Error(ui.detectLanguageError || 'Could not confidently detect the spoken language. Choose it manually and retry.');
    }
    setLang(language);
    return language;
  }

  useEffect(() => {
    if (!draftHydrated || report || reference) return undefined;
    setDraftSaveState(ui.saving);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/draft/${draftId}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            step: input.trim() ? 2 : 1,
            data: { form: { lang, route, input, contact, caseDetails } },
          }),
        });
        if (!response.ok) throw new Error('Draft save failed');
        if (response.ok) setDraftSaveState(`${ui.saved} ✓`);
      } catch {
        if (draftHydrated) setDraftSaveState('Draft is stored in this browser until the local service returns.');
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [draftHydrated, draftId, lang, route, input, contact, caseDetails, report, reference, ui.saving, ui.saved]);

  async function recordIncident() {
    setError('');
    if (recording) {
      window.clearTimeout(incidentStopTimerRef.current);
      recorderRef.current?.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      recorderRef.current = recorder;
      chunksRef.current = [];
      setRecording(true);
      setStatus(ui.listening);

      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        window.clearTimeout(incidentStopTimerRef.current);
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
        setStatus(ui.transcribing);

        try {
          const requestedLanguage = languagePreference === 'auto' ? 'unknown' : lang;
          const response = await fetch(`/api/transcribe?lang=${encodeURIComponent(requestedLanguage)}`, {
            method: 'POST',
            headers: { 'content-type': mime },
            body: new Blob(chunksRef.current, { type: mime }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Transcription failed.');

          const transcript = String(data.text || '').trim();
          if (!transcript) throw new Error('No speech was detected. Check your microphone and try again, or type your report.');
          const detectedLanguage = resolveTranscriptionLanguage(data.language);
          if (!hasExpectedScript(transcript, detectedLanguage.split('-')[0])) throw new Error(`${languageLabel(detectedLanguage)} speech was not recognised correctly. It was not added; please retry.`);
          setInput(transcript);
          setStatus(ui.transcript);
        } catch (err) {
          setStatus('');
          setError(err.message || 'Transcription failed. You can type instead.');
        }
      };

      recorder.start();
      incidentStopTimerRef.current = window.setTimeout(() => recorder.stop(), 28000);
    } catch (err) {
      setRecording(false);
      setError(
        err.name === 'NotAllowedError'
          ? 'Microphone permission was blocked. Allow it in the address bar.'
          : 'Microphone could not start. You can type instead.',
      );
    }
  }

  function makeReport() {
    if (!input.trim()) {
      setError(ui.addIncidentError || 'Add the incident details first.');
      return;
    }
    if (!contact.name.trim() || !/^\d{10}$/.test(contact.phone.replace(/\D/g, ''))) {
      setError(ui.contactRequired || 'Enter your name and a valid 10-digit Indian mobile number for this tracked local draft.');
      return;
    }
    if (!caseDetails.incidentDate || !caseDetails.incidentTime || !caseDetails.state.trim()) {
      setError(ui.coreRequired || 'Add incident date, time, and State / UT before review.');
      return;
    }
    if (route === 'financial' && (!caseDetails.amount || !caseDetails.transactionId.trim() || !caseDetails.paymentSource.trim())) {
      setError(ui.financialRequired || 'For financial fraud, add exact loss amount, bank/wallet, and transaction / UTR reference.');
      return;
    }
    setError('');
    setReference('');
    const inferred = extractCaseDetails(input);
    const resolvedDetails = {
      ...caseDetails,
      incidentDate: caseDetails.incidentDate || inferred.incidentDate,
      incidentTime: caseDetails.incidentTime || inferred.incidentTime,
      paymentSource: caseDetails.paymentSource || inferred.paymentSource,
      transactionId: caseDetails.transactionId || inferred.transactionId,
    };
    setCaseDetails(resolvedDetails);
    setReport(buildReport({ text: input, sensitive, caseDetails: resolvedDetails, attachments, route, contact }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function mapIncident() {
    if (!input.trim()) {
      setError(ui.addIncidentError || 'Add the incident details first.');
      return;
    }
    const inferred = extractCaseDetails(input);
    setCaseDetails((current) => ({
      ...current,
      incidentDate: current.incidentDate || inferred.incidentDate,
      incidentTime: current.incidentTime || inferred.incidentTime,
      paymentSource: current.paymentSource || inferred.paymentSource,
      transactionId: current.transactionId || inferred.transactionId,
    }));
    setIntakeLocked(true);
    setError('');
    setStatus('Report mapped. Complete the requested detail below.');
  }

  function normaliseDate(value) {
    const match = String(value).trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (!match) return String(value).trim();
    const [, day, month, rawYear] = match;
    return `${rawYear.length === 2 ? `20${rawYear}` : rawYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  function normaliseTime(value) {
    const match = String(value).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
    if (!match) return String(value).trim();
    let hour = Number(match[1]);
    if (match[3]?.toLowerCase() === 'pm' && hour < 12) hour += 12;
    if (match[3]?.toLowerCase() === 'am' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${match[2] || '00'}`;
  }

  function applyCorrection() {
    const request = correction.trim();
    const match = request.match(/(?:change|set|update|correct)\s+(?:the\s+)?(incident\s+date|date|incident\s+time|time|state|location|loss(?:\s+amount)?|amount|bank|wallet|merchant|transaction(?:\s*(?:id|reference))?|utr|name|phone|mobile|email)\s*(?:to|as|is)?\s+(.+)/i);
    if (!match) {
      setError(intakeGuide.correctionNeedField);
      return;
    }
    const field = match[1].toLowerCase();
    const value = match[2].trim().replace(/[.。]$/, '');
    if (/date/.test(field)) updateCaseDetail('incidentDate', normaliseDate(value));
    else if (/time/.test(field)) updateCaseDetail('incidentTime', normaliseTime(value));
    else if (/state|location/.test(field)) updateCaseDetail('state', value);
    else if (/loss|amount/.test(field)) updateCaseDetail('amount', value.replace(/[₹,]/g, ''));
    else if (/bank|wallet|merchant/.test(field)) updateCaseDetail('paymentSource', value);
    else if (/transaction|utr/.test(field)) updateCaseDetail('transactionId', value);
    else if (/name/.test(field)) updateContact('name', value);
    else if (/phone|mobile/.test(field)) updateContact('phone', value);
    else if (/email/.test(field)) updateContact('email', value);
    setCorrection('');
    setError('');
    setStatus(intakeGuide.correctionApplied);
  }

  const missingFields = useMemo(() => {
    if (!intakeLocked) return [];
    const missing = [];
    if (!caseDetails.incidentDate) missing.push(ui.incidentDate);
    if (!caseDetails.incidentTime) missing.push(ui.incidentTime);
    if (!caseDetails.state.trim()) missing.push(ui.state);
    if (route === 'financial') {
      if (!caseDetails.amount) missing.push(ui.exactAmount);
      if (!caseDetails.paymentSource.trim()) missing.push(ui.paymentSource);
      if (!caseDetails.transactionId.trim()) missing.push(ui.transactionId);
    }
    return missing;
  }, [intakeLocked, caseDetails, route, ui]);

  function updateCaseDetail(key, value) {
    setCaseDetails((current) => ({ ...current, [key]: value }));
  }
  function updateContact(key, value) {
    setContact((current) => ({ ...current, [key]: value }));
  }

  function addAttachments(event) {
    const selected = Array.from(event.target.files || []);
    const accepted = [];
    const rejected = [];
    for (const file of selected) {
      if (file.size > MAX_ATTACHMENT_BYTES) rejected.push(`${file.name} is larger than 10 MB`);
      else if (attachments.length + accepted.length >= MAX_ATTACHMENTS) rejected.push(`Only ${MAX_ATTACHMENTS} evidence files can be attached`);
      else accepted.push(file);
    }
    if (accepted.length) setAttachments((current) => [...current, ...accepted]);
    if (rejected.length) setError(rejected.join('. '));
    event.target.value = '';
  }

  function removeAttachment(index) {
    setAttachments((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  async function uploadAttachments(files) {
    return Promise.all(files.map(async (attachment) => {
      const response = await fetch(`/api/evidence/${draftId}`, {
        method: 'POST',
        headers: {
          'content-type': attachment.type || 'application/octet-stream',
          'x-file-name': encodeURIComponent(attachment.name),
        },
        body: attachment.file,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Could not attach ${attachment.name}`);
      return data;
    }));
  }

  async function submitReport() {
    if (!report || !confirmed) return;
    setSubmitting(true);
    setError('');
    try {
      const uploadedEvidence = await uploadAttachments(report.attachments || []);
      const { attachments: _attachments, ...reportData } = report;
      const payload = {
        ...reportData,
        evidenceAttachments: uploadedEvidence,
        officialPayload: {
          contact: report.contact,
          category: report.category,
          complaintText: report.originalText,
          protectedDetails: report.protectedDetails,
          location: report.location,
          amount: report.amount,
          incidentDate: report.caseDetails.incidentDate,
          incidentTime: report.caseDetails.incidentTime,
          paymentSource: report.caseDetails.paymentSource,
          transactionId: report.caseDetails.transactionId,
          evidenceChecklist: report.evidence,
          evidenceAttachments: uploadedEvidence,
        },
      };
      const response = await fetch(`/api/submit/${draftId}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ data: payload }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Submit failed.');
      setReference(data.reference);
      setStatus(`${ui.submitted}: ${data.reference}`);
      setConfirmOpen(false);
      setConfirmed(false);
      setReport(null);
      setInput('');
      setSensitive('');
      setCaseDetails(emptyCaseDetails());
      setContact({ name: '', phone: '', email: '' });
      setAttachments([]);
      setIntakeLocked(false);
      setCorrection('');
      localStorage.removeItem('bwm-input');
      localStorage.removeItem('bwm-sensitive');
    } catch (err) {
      setError(err.message || 'Submit failed.');
    } finally {
      setSubmitting(false);
    }
  }

  function clearAll() {
    setInput('');
    setSensitive('');
    setCaseDetails(emptyCaseDetails());
    setContact({ name: '', phone: '', email: '' });
    setAttachments([]);
    setIntakeLocked(false);
    setCorrection('');
    if (attachmentInputRef.current) attachmentInputRef.current.value = '';
    setReport(null);
    setReference('');
    setStatus('');
    setError('');
  }

  if (report) {
    return (
      <main className={`bwm review-page ${highContrast ? 'high-contrast' : ''} font-${fontSize}`}>
        <header>
          <div className="brand"><span className="mark">+</span>{ui.brand}</div>
          <div className="header-tools"><span className="pill">{ui.reviewPill}</span><button className="access-button" onClick={() => setHighContrast((value) => !value)}>{ui.contrast}</button></div>
        </header>

        <section className="finish">
          <div className="eyebrow">{ui.reviewPill}</div>
          <h1>
            {ui.title}
            <br />
            <em>{ui.titleAccent}</em>
          </h1>

          <div className="alert">
            <strong>{report.urgency}</strong>
            <span>{report.category.includes('Financial') || report.category.includes('UPI') ? ui.urgent1930 : ui.safety}</span>
          </div>

          <article className="report">
            <small>{ui.category}</small>
            <h2>{report.category}</h2>

            <small>{ui.words}</small>
            <p>{report.publicText}</p>

            <div className="report-grid">
              <div>
                <small>{ui.location}</small>
                <p>{report.location}</p>
              </div>
              <div>
                <small>{ui.amount}</small>
                <p>{report.amount}</p>
              </div>
            </div>

            <small>{ui.evidence}</small>
            <ul>
              {report.evidence.map((item) => <li key={item}>{item}</li>)}
            </ul>

            <small>{ui.attachedEvidence}</small>
            {report.attachments?.length ? (
              <ul className="attached-list">
                {report.attachments.map((attachment) => <li key={`${attachment.name}-${attachment.size}`}>{attachment.name} ({Math.ceil(attachment.size / 1024)} KB)</li>)}
              </ul>
            ) : <p>{ui.noAttachments}</p>}

            <small>{ui.protected}</small>
            <p>{report.maskedProtectedDetails || ui.noProtected}</p>

            <small>{ui.next}</small>
            <p>{report.nextStep}</p>
          </article>

          {reference && (
            <div className="reference-box">
              <small>{ui.reference}</small>
              <strong>{reference}</strong>
            </div>
          )}

          <p className="disclaimer">{ui.draftNote}</p>
          <div className="actions">
            <button className="secondary" onClick={() => { setReport(null); setIntakeLocked(true); setStatus(intakeGuide.frozen); }}>{ui.edit}</button>
            <button className="primary" onClick={() => setConfirmOpen(true)}>{ui.submit}</button>
          </div>
        </section>

        {confirmOpen && (
          <div className="modal-backdrop" role="presentation">
            <section className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
              <h2 id="confirm-title">{ui.confirmTitle}</h2>
              <p>{ui.confirmBody}</p>
              <div className="confirm-row">
                <small>{ui.category}</small>
                <strong>{report.category}</strong>
              </div>
              <div className="confirm-row">
                <small>{ui.protected}</small>
                <strong>{report.protectedDetails || ui.noProtected}</strong>
              </div>
              <div className="confirm-row">
                <small>{ui.attachedEvidence}</small>
                <strong>{report.attachments?.length ? report.attachments.map((file) => file.name).join(', ') : ui.noAttachments}</strong>
              </div>
              <label className="checkline">
                <input checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} type="checkbox" />
                <span>{ui.confirmCheck}</span>
              </label>
              <p className="final-check">{intakeGuide.finalCheck}</p>
              <div className="modal-actions">
                <button className="secondary" onClick={() => { setConfirmOpen(false); setReport(null); setIntakeLocked(true); setStatus(intakeGuide.frozen); }}>{intakeGuide.reviewCorrection}</button>
                <button className="quiet" onClick={() => setConfirmOpen(false)}>{ui.cancel}</button>
                <button className="primary" disabled={!confirmed || submitting} onClick={submitReport}>
                  {submitting ? ui.submitting : ui.confirmSubmit}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className={`bwm ${highContrast ? 'high-contrast' : ''} font-${fontSize}`}>
      <header>
        <div className="brand"><span className="mark">+</span>{ui.brand}</div>
        <div className="header-tools">
          <span className="pill">{ui.intakePill}</span>
          <button className="access-button" onClick={() => setHighContrast((value) => !value)}>{ui.contrast}</button>
          <div className="font-tools" aria-label={ui.textSize}>
            <button className="access-button" onClick={() => setFontSize('small')}>A−</button>
            <button className="access-button" onClick={() => setFontSize('normal')}>A</button>
            <button className="access-button" onClick={() => setFontSize('large')}>A+</button>
          </div>
        </div>
      </header>

      <section className="single">
        <div className="eyebrow">{ui.eyebrow}</div>
        <h1>
          {ui.title}
          <br />
          <em>{ui.titleAccent}</em>
        </h1>
        <p>{ui.intro}</p>

        <div className="language">
          <label htmlFor="language">{ui.language}</label>
          <select
            id="language"
            ref={languageSelectRef}
            value={languagePreference}
            onChange={(event) => chooseLanguage(event.currentTarget.value)}
            onInput={(event) => chooseLanguage(event.currentTarget.value)}
            disabled={recording}
          >
            <option value="auto">{ui.autoDetect || 'Auto-detect spoken language'}</option>
            {LANGS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </div>

        <div className="route-picker">
          <label htmlFor="route">{ui.route}</label>
          <select id="route" value={route} onChange={(event) => setRoute(event.target.value)}>
            <option value="financial">{ui.routeFinancial}</option>
            <option value="women-child">{ui.routeWomenChild}</option>
            <option value="other">{ui.routeOther}</option>
          </select>
          <span className="draft-state" aria-live="polite">{draftSaveState}</span>
        </div>

        {route === 'financial' && <div className="golden-hour"><strong>{ui.goldenHour || 'Financial fraud: act in the golden hour.'}</strong><span>{ui.urgent1930}</span></div>}

        <section className="intake-guide" aria-labelledby="intake-guide-title">
          <div className="guide-number">01</div>
          <div>
            <h2 id="intake-guide-title">{intakeGuide.title}</h2>
            <p>{intakeGuide.body}</p>
            <div className="guide-columns">
              <div><strong>{intakeGuide.required}</strong><span>{intakeGuide.base}{route === 'financial' ? `; ${intakeGuide.financial}` : `; ${intakeGuide.other}`}</span></div>
              <div><strong>{intakeGuide.optional}</strong><span>{intakeGuide.optionalItems}</span></div>
            </div>
          </div>
        </section>

        <section className="case-panel core-panel">
          <label>{ui.contact || 'Contact for a tracked local draft'}</label>
          <p>{ui.contactHint || 'The official portal verifies a mobile number by OTP. This local demo cannot verify or submit to government; enter a contact only so this local draft is reviewable.'}</p>
          <div className="detail-grid">
            <label>{ui.name || 'Full name'}<input value={contact.name} onChange={(event) => updateContact('name', event.target.value)} autoComplete="name" /></label>
            <label>{ui.mobile || 'Indian mobile number'}<input inputMode="tel" value={contact.phone} onChange={(event) => updateContact('phone', event.target.value)} autoComplete="tel" /></label>
            <label>{ui.email || 'Email (optional)'}<input type="email" value={contact.email} onChange={(event) => updateContact('email', event.target.value)} autoComplete="email" /></label>
          </div>
        </section>

        <section className="command-panel">
          <label htmlFor="incident">{ui.mainLabel}</label>
          <p>{ui.mainHint}</p>
          <div className="input-wrap">
            <textarea
              id="incident"
              value={input}
              onChange={(event) => { setInput(event.target.value); setIntakeLocked(false); }}
              placeholder={ui.placeholder}
              readOnly={intakeLocked}
              aria-describedby={intakeLocked ? 'story-frozen-note' : undefined}
            />
            {!intakeLocked && <button className={recording ? 'recording mic' : 'mic'} onClick={recordIncident} type="button" aria-pressed={recording} aria-label={`${recording ? 'Stop' : 'Start'} ${voiceLanguage.name} voice input`}>
              {recording ? ui.stop : ui.speak}
            </button>}
          </div>
          {intakeLocked ? <div className="frozen-note" id="story-frozen-note"><span>{intakeGuide.frozen}</span><button className="quiet" type="button" onClick={() => setIntakeLocked(false)}>{intakeGuide.changeStory}</button></div> : <button className="map-button" type="button" onClick={mapIncident}>{intakeGuide.analyse}</button>}
        </section>

        {intakeLocked && <section className={`missing-panel ${missingFields.length ? '' : 'complete'}`} aria-live="polite">
          <div><strong>{missingFields.length ? intakeGuide.missing : intakeGuide.allPresent}</strong><span>{missingFields.length ? missingFields[0] : ' '}</span></div>
          {missingFields.length > 1 && <small>{missingFields.slice(1).join(' · ')}</small>}
        </section>}

        <section className="sensitive-panel">
          <label htmlFor="protected">{ui.sensitiveLabel}</label>
          <p>{ui.sensitiveTypedHint || 'Type identifiers exactly. Voice transcription is disabled for UPI IDs, UTRs, account numbers, phone numbers, and URLs because even one wrong character makes them unsafe.'}</p>
          <div>
            <input
              id="protected"
              value={sensitive}
              onChange={(event) => setSensitive(event.target.value)}
              placeholder={ui.sensitivePlaceholder}
            />
          </div>
        </section>

        {intakeLocked && <section className="correction-panel">
          <label htmlFor="correction">{intakeGuide.correctionLabel}</label>
          <p>{intakeGuide.correctionHint}</p>
          <div className="correction-row"><input id="correction" value={correction} onChange={(event) => setCorrection(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') applyCorrection(); }} placeholder={intakeGuide.correctionPlaceholder} /><button className="secondary" type="button" onClick={applyCorrection}>{intakeGuide.applyCorrection}</button></div>
        </section>}

        <details className="case-panel advanced-details" open={intakeLocked}>
          <summary>{ui.caseDetails}</summary>
          <p>{ui.caseHint}</p>
          <div className="detail-grid">
            <label>{ui.incidentDate}<input type="date" value={caseDetails.incidentDate} onChange={(event) => updateCaseDetail('incidentDate', event.target.value)} /></label>
            <label>{ui.incidentTime}<input type="time" value={caseDetails.incidentTime} onChange={(event) => updateCaseDetail('incidentTime', event.target.value)} /></label>
            <label>{ui.state}<input value={caseDetails.state} onChange={(event) => updateCaseDetail('state', event.target.value)} placeholder={ui.statePlaceholder} /></label>
            <label>{ui.exactAmount}<input inputMode="decimal" value={caseDetails.amount} onChange={(event) => updateCaseDetail('amount', event.target.value)} placeholder={ui.amountPlaceholder} /></label>
            <label>{ui.paymentSource}<input value={caseDetails.paymentSource} onChange={(event) => updateCaseDetail('paymentSource', event.target.value)} placeholder={ui.paymentPlaceholder} /></label>
            <label>{ui.transactionId}<input value={caseDetails.transactionId} onChange={(event) => updateCaseDetail('transactionId', event.target.value)} placeholder={ui.transactionPlaceholder} /></label>
            {route === 'financial' && <>
              <label>{ui.transactionCount || 'Number of transactions'}<input inputMode="numeric" value={caseDetails.transactionCount} onChange={(event) => updateCaseDetail('transactionCount', event.target.value)} /></label>
              <label>{ui.paymentApp || 'Payment app used'}<input value={caseDetails.paymentApp} onChange={(event) => updateCaseDetail('paymentApp', event.target.value)} placeholder="GPay / PhonePe / Paytm / bank" /></label>
              <label>{ui.payerBank || 'Payer bank / wallet'}<input value={caseDetails.payerBank} onChange={(event) => updateCaseDetail('payerBank', event.target.value)} /></label>
              <label>{ui.payeeBank || 'Payee bank / wallet'}<input value={caseDetails.payeeBank} onChange={(event) => updateCaseDetail('payeeBank', event.target.value)} /></label>
              <label>{ui.payeeUpi || 'Payee UPI ID / account (type exactly)'}<input value={caseDetails.payeeUpi} onChange={(event) => updateCaseDetail('payeeUpi', event.target.value)} /></label>
            </>}
            {route !== 'financial' && <>
              <label>{ui.platform || 'Platform / app involved'}<input value={caseDetails.platform} onChange={(event) => updateCaseDetail('platform', event.target.value)} /></label>
              <label>{ui.url || 'URL or profile link'}<input type="url" value={caseDetails.url} onChange={(event) => updateCaseDetail('url', event.target.value)} /></label>
              <label>{ui.handle || 'Suspect handle / account name'}<input value={caseDetails.handle} onChange={(event) => updateCaseDetail('handle', event.target.value)} /></label>
              <label>{ui.suspectPhone || 'Suspect phone / UPI / account'}<input value={caseDetails.suspectPhone} onChange={(event) => updateCaseDetail('suspectPhone', event.target.value)} /></label>
            </>}
          </div>
        </details>

        <section className="evidence-panel">
          <label htmlFor="evidence-files">{ui.attachments}</label>
          <p>{route === 'financial' ? (ui.financialEvidenceHint || 'Attach bank/wallet statement, payment receipt, UTR screenshot, QR/payment link, chats, and call screenshots.') : (ui.attachmentHint)}</p>
          <input ref={attachmentInputRef} id="evidence-files" className="file-input" type="file" multiple accept="image/*,video/*,.pdf,.txt,.eml,.msg" onChange={addAttachments} />
          <label className="file-button" htmlFor="evidence-files">{ui.attachmentChoose}</label>
          {attachments.length ? (
            <ul className="upload-list">
              {attachments.map((file, index) => <li key={`${file.name}-${file.size}-${index}`}><span>{file.name} · {Math.ceil(file.size / 1024)} KB</span><button type="button" onClick={() => removeAttachment(index)}>{ui.remove}</button></li>)}
            </ul>
          ) : <p className="empty-upload">{ui.noAttachments}</p>}
        </section>

        <div className="status" aria-live="polite">
          <span>{status || ui.ready}</span>
          {input && <b>{classify(input)}</b>}
          {error && <strong>{error}</strong>}
        </div>

        <div className="actions">
          <button className="quiet" onClick={clearAll}>{ui.clear}</button>
          <button className="primary" onClick={makeReport} disabled={!intakeLocked || missingFields.length > 0}>{ui.build}</button>
        </div>
      </section>


      <footer>
        <span>{ui.safety}</span>
        <span>{ui.urgent1930}</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
