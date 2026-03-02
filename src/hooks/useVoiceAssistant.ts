import { useState, useCallback, useRef, useEffect } from 'react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionCtor = new () => any;

interface IWindow extends Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SpeechRecognition: SpeechRecognitionCtor;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webkitSpeechRecognition: SpeechRecognitionCtor;
}

type FieldType = 'text' | 'email' | 'tel' | 'select' | 'file' | 'password' | 'checkbox';

interface FieldConfig {
  field: string;
  label: string;
  question: string;
  type: FieldType;
  step: number;
  /** For select fields: how to match transcript → value */
  matchOptions?: (transcript: string, options: { id: string | number; name: string }[]) => string | null;
}

interface SelectOption {
  id: string | number;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;

interface VoiceAssistantOptions {
  setValue: AnyFn;
  trigger: AnyFn;
  watch: AnyFn;
  formState: { errors: Record<string, { message?: string }> };
  services: SelectOption[];
  governorates: SelectOption[];
}

// ─────────────────────────────────────────────
// Field Configurations
// ─────────────────────────────────────────────
const buildFieldConfigs = (
  services: SelectOption[],
  governorates: SelectOption[] // Removed underscore as we will use it
): FieldConfig[] => [
  {
    field: 'name',
    label: 'الاسم بالكامل',
    question: 'أهلاً بك في نظام التسجيل السريع. ما هو اسمك بالكامل؟',
    type: 'text',
    step: 1,
  },
  {
    field: 'phone',
    label: 'رقم الهاتف',
    question: 'ما هو رقم هاتفك؟ قل الأرقام بوضوح، مثلاً: صفر واحد صفر واحد مليون...',
    type: 'tel',
    step: 1,
  },
  {
    field: 'email',
    label: 'البريد الإلكتروني',
    question: 'ما هو بريدك الإلكتروني؟ إذا لم يكن لديك، قل: تخطي',
    type: 'email',
    step: 1,
  },
  {
    field: 'service_id',
    label: 'المهنة',
    question: `ما هي مهنتك؟ الاختيارات المتاحة: ${services.slice(0, 5).map(s => s.name).join('، ')}، أو قل: أخرى`,
    type: 'select',
    step: 2,
    matchOptions: (transcript, options) => {
      const lower = transcript.trim().toLowerCase();
      if (lower.includes('أخر') || lower.includes('اخر')) return 'other';
      const found = options.find(o =>
        lower.includes(o.name.toLowerCase()) || o.name.toLowerCase().includes(lower)
      );
      return found ? String(found.id) : null;
    },
  },
  {
    field: 'governorate_id',
    label: 'المحافظة',
    question: `في أي محافظة تسكن؟ الاختيارات المتاحة: ${governorates.slice(0, 5).map(g => g.name).join('، ')}، أو قل: غير ذلك.`,
    type: 'select',
    step: 2,
    matchOptions: (transcript, options) => {
      const lower = transcript.trim().toLowerCase();
      const found = options.find(o =>
        lower === o.name.toLowerCase() || 
        lower.includes(o.name.toLowerCase()) || 
        o.name.toLowerCase().includes(lower)
      );
      return found ? String(found.id) : null;
    },
  },
  {
    field: 'price_range',
    label: 'نطاق الأسعار',
    question: 'ما هو نطاق أسعار خدماتك؟ مثلاً: قل "مئة إلى مئتين" أو اكتب الأرقام مثل "100 إلى 300"',
    type: 'text',
    step: 2,
  },
  {
    field: 'front_identity_photo',
    label: 'صورة البطاقة (أمام)',
    question: 'الآن نحتاج صورة وجه بطاقتك الشخصية. هذا الحقل يتطلب رفع صورة يدوياً، يرجى الضغط على زر الرفع واختيار الصورة من جهازك.',
    type: 'file',
    step: 3,
  },
  {
    field: 'back_identity_photo',
    label: 'صورة البطاقة (خلف)',
    question: 'ممتاز، والآن نحتاج صورة ظهر البطاقة أيضاً. ارفع الصورة يدوياً من جهازك.',
    type: 'file',
    step: 3,
  },
  {
    field: 'password',
    label: 'كلمة المرور',
    question: 'لأسباب أمنية، كلمة المرور لا تُملى صوتياً. يرجى كتابتها يدوياً. يجب أن تكون 8 أحرف على الأقل.',
    type: 'password',
    step: 4,
  },
  {
    field: 'password_confirmation',
    label: 'تأكيد كلمة المرور',
    question: 'يرجى تأكيد كلمة المرور بكتابتها مرة أخرى يدوياً.',
    type: 'password',
    step: 4,
  },
  {
    field: 'terms',
    label: 'الموافقة على الشروط',
    question: 'الخطوة الأخيرة: اقرأ الشروط والأحكام ثم ضع علامة الموافقة يدوياً لإتمام التسجيل.',
    type: 'checkbox',
    step: 5,
  },
];

// ─────────────────────────────────────────────
// Utility: convert Arabic numbers to Western
// ─────────────────────────────────────────────
const normalizeArabicNumbers = (text: string): string => {
  return text
    .replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => String(d.charCodeAt(0) - 1632))
    .replace(/صفر/g, '0').replace(/واحد/g, '1').replace(/اثنين|اتنين/g, '2')
    .replace(/ثلاثة|تلاتة/g, '3').replace(/أربعة|اربعة/g, '4').replace(/خمسة/g, '5')
    .replace(/ستة/g, '6').replace(/سبعة/g, '7').replace(/ثمانية|تمانية/g, '8')
    .replace(/تسعة/g, '9').replace(/مئة|مية/g, '100').replace(/مئتين|ميتين/g, '200')
    .replace(/ألف|الف/g, '000')
    .replace(/[-–إلى\s]+/g, '-')
    // Final check: if we have something like "100200" make it "100-200"
    .replace(/^(\d{2,})(\d{2,})$/, '$1-$2')
    .replace(/[^0-9-]/g, '');
};

// ─────────────────────────────────────────────
// Main Hook
// ─────────────────────────────────────────────
export const useVoiceAssistant = (
  form: VoiceAssistantOptions,
  setCurrentStep: (step: number | ((prev: number) => number)) => void,
  focusedField: string | null
) => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState<string>('متوقف');
  const [currentFieldLabel, setCurrentFieldLabel] = useState<string>('');
  const [lastTranscript, setLastTranscript] = useState<string>('');

  // Refs for stale-closure-safe access
  const isActiveRef = useRef(false);
  const isSpeakingRef = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const promptIndexRef = useRef(0);
  const focusedFieldRef = useRef<string | null>(null);
  const fieldConfigsRef = useRef<FieldConfig[]>([]);
  const startListeningRef = useRef<() => void>(() => {});
  const handleVoiceInputRef = useRef<(t: string) => Promise<void>>(async () => {});
  const presentFieldRef = useRef<(c: FieldConfig) => Promise<void>>(async () => {});

  // Keep fieldConfigs up to date with latest services/governorates
  useEffect(() => {
    fieldConfigsRef.current = buildFieldConfigs(form.services, form.governorates);
  }, [form.services, form.governorates]);

  // Keep focusedField ref in sync
  useEffect(() => {
    focusedFieldRef.current = focusedField;
  }, [focusedField]);

  // ──────────────────────────────────────────
  // Stop recognition safely
  // ──────────────────────────────────────────
  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // ──────────────────────────────────────────
  // Speak (returns promise, stops mic first)
  // ──────────────────────────────────────────
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      stopRecognition();
      window.speechSynthesis.cancel();

      isSpeakingRef.current = true;
      setIsSpeaking(true);
      setStatus('جاري التحدث...');

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.88;
      utterance.pitch = 1;

      const finish = () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        resolve();
      };

      utterance.onend = finish;
      utterance.onerror = finish;

      window.speechSynthesis.speak(utterance);
    });
  }, [stopRecognition]);

  // ──────────────────────────────────────────
  // Core Functions (Hoisted to handle circularity)
  // ──────────────────────────────────────────

  function startListening() {
    const SpeechRecognition = (window as unknown as IWindow).SpeechRecognition
      || (window as unknown as IWindow).webkitSpeechRecognition;

    if (!SpeechRecognition || !isActiveRef.current || isSpeakingRef.current) return;

    stopRecognition();

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('أنا أسمعك...');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = (event.results[0][0] as { transcript: string }).transcript.trim();
      setLastTranscript(transcript);
      setStatus(`سمعت: ${transcript}`);
      handleVoiceInputRef.current(transcript);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setStatus('عذراً، يجب السماح بالوصول للميكروفون');
        isActiveRef.current = false;
        setIsActive(false);
        return;
      }
      if (event.error === 'no-speech' || event.error === 'aborted') {
        if (isActiveRef.current && !isSpeakingRef.current) {
          setTimeout(() => startListeningRef.current(), 500);
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (isActiveRef.current && !isSpeakingRef.current) {
        setTimeout(() => startListeningRef.current(), 400);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch { /* ignored */ }
  }

  useEffect(() => {
    startListeningRef.current = startListening;
  }, []);

  async function presentField(config: FieldConfig) {
    if (!isActiveRef.current) return;
    setCurrentFieldLabel(config.label);
    setCurrentStep(config.step);
    await speak(config.question);
    if (isActiveRef.current) {
      if (config.type === 'file' || config.type === 'password' || config.type === 'checkbox') {
        setStatus(`يرجى الإجراء يدوياً ثم قل "تم" أو "التالي"`);
      }
      startListening();
    }
  }

  useEffect(() => {
    presentFieldRef.current = presentField;
  }, []);

  async function handleVoiceInput(transcript: string) {
    stopRecognition();

    const configs = fieldConfigsRef.current;
    const focusedFieldName = focusedFieldRef.current;

    const targetConfig = focusedFieldName
      ? configs.find(c => c.field === focusedFieldName) || configs[promptIndexRef.current]
      : configs[promptIndexRef.current];

    if (!targetConfig) return;

    // Navigation commands for manual fields or skipping
    if (/تم|خلصت|التالي|بعده|أكمل|نعم|تمام|done|next/i.test(transcript)) {
      if (targetConfig.type === 'file' || targetConfig.type === 'password' || targetConfig.type === 'checkbox') {
        await speak('حسناً، ننتقل للحقل التالي.');
        if (!focusedFieldName && promptIndexRef.current < configs.length - 1) {
          promptIndexRef.current += 1;
          await presentField(configs[promptIndexRef.current]);
          return;
        }
      }
    }

    // Skip command
    if (/تخطي|تجاوز|بلاش|skip/i.test(transcript)) {
      await speak('حسناً، تم التخطي.');
      if (!focusedFieldName && promptIndexRef.current < configs.length - 1) {
        promptIndexRef.current += 1;
        await presentField(configs[promptIndexRef.current]);
      }
      return;
    }

    // Explicit check for manual fields again if transcript wasn't a navigation command
    if (targetConfig.type === 'file' || targetConfig.type === 'password' || targetConfig.type === 'checkbox') {
      await speak('هذا الحقل يتطلب إجراءً يدوياً. بمجرد الانتهاء قل "تم".');
      startListening();
      return;
    }

    let valueToSet: string = transcript;

    if (targetConfig.type === 'select' && targetConfig.matchOptions) {
      const options = targetConfig.field === 'service_id' ? form.services : form.governorates;
      const matched = targetConfig.matchOptions(
        transcript,
        options.map(o => ({ id: o.id, name: o.name }))
      );
      if (!matched) {
        await speak(`عذراً، لم أتعرف على "${transcript}". حاول مرة أخرى أو قل "تخطي".`);
        startListening();
        return;
      }
      valueToSet = matched;
    }

    if (targetConfig.type === 'tel') {
      valueToSet = transcript.replace(/\D/g, '').replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632));
      if (!valueToSet) {
        await speak('لم أسمع أرقاماً واضحة، يرجى المحاولة مرة أخرى.');
        startListening();
        return;
      }
    }

    if (targetConfig.field === 'price_range') {
      const normalized = normalizeArabicNumbers(transcript);
      if (normalized && normalized.includes('-')) {
        valueToSet = normalized;
      } else if (transcript.match(/\d+\s*[-–]\s*\d+/)) {
        valueToSet = transcript.replace(/\s/g, '');
      } else if (normalized.length >= 4) {
        valueToSet = normalized.replace(/^(\d{2,})(\d{2,})$/, '$1-$2');
      }
    }

    form.setValue(targetConfig.field, valueToSet);
    const isValid = await form.trigger(targetConfig.field);

    if (!isValid) {
      const errorMsg = form.formState.errors[targetConfig.field]?.message || 'قيمة غير صحيحة';
      await speak(`عذراً، ${errorMsg}. يرجى المحاولة مرة أخرى.`);
      if (isActiveRef.current) startListening();
      return;
    }

    if (targetConfig.type === 'select') {
      await speak('تم الاختيار بنجاح.');
    } else {
      await speak('تم التسجيل بنجاح.');
    }

    if (!focusedFieldName) {
      const nextIdx = promptIndexRef.current + 1;
      if (nextIdx < configs.length) {
        promptIndexRef.current = nextIdx;
        await presentField(configs[nextIdx]);
      } else {
        await speak('رائع! أتممت جميع الحقول. راجع بياناتك وأكمل التسجيل.');
        setStatus('اكتمل التسجيل');
        isActiveRef.current = false;
        setIsActive(false);
      }
    } else {
      if (isActiveRef.current) startListening();
    }
  }

  useEffect(() => {
    handleVoiceInputRef.current = handleVoiceInput;
  }, []);

  // ──────────────────────────────────────────
  // Cleanup on unmount
  // ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      stopRecognition();
      window.speechSynthesis.cancel();
    };
  }, [stopRecognition]);

  // ──────────────────────────────────────────
  // Public API
  // ──────────────────────────────────────────
  const startAssistant = useCallback(async () => {
    isActiveRef.current = true;
    setIsActive(true);

    const configs = fieldConfigsRef.current;
    const focusedFieldName = focusedFieldRef.current;

    // Smart logic: find index of focused field, or default to 0
    let startIndex = 0;
    if (focusedFieldName) {
      const idx = configs.findIndex(c => c.field === focusedFieldName);
      if (idx !== -1) startIndex = idx;
    }

    promptIndexRef.current = startIndex;
    setStatus('جاري البدء...');

    if (configs.length > 0) {
      await presentFieldRef.current(configs[startIndex]);
    }
  }, []);
 // dependencies removed as we use presentFieldRef

  const stopAssistant = useCallback(() => {
    isActiveRef.current = false;
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setStatus('متوقف');
    setCurrentFieldLabel('');
    stopRecognition();
    window.speechSynthesis.cancel();
  }, [stopRecognition]);

  /**
   * يُستدعى عند onFocus لحقل — يقرأ تعليمات الحقل فقط إذا كان المساعد فعّالاً
   */
  const speakFieldHelp = useCallback(async (fieldName: string) => {
    if (!isActiveRef.current || isSpeakingRef.current) return;
    const config = fieldConfigsRef.current.find(c => c.field === fieldName);
    if (!config) return;
    setCurrentFieldLabel(config.label);
    await speak(config.question);
    if (isActiveRef.current) startListeningRef.current();
  }, [speak]); // removed startListening from deps

  /**
   * زر "ما المطلوب؟" — يقرأ الحقل الحالي مرة أخرى
   */
  const speakCurrentField = useCallback(async () => {
    if (!isActiveRef.current) return;
    const configs = fieldConfigsRef.current;
    const focusedFieldName = focusedFieldRef.current;
    const config = focusedFieldName
      ? configs.find(c => c.field === focusedFieldName) || configs[promptIndexRef.current]
      : configs[promptIndexRef.current];
    if (!config) return;
    setCurrentFieldLabel(config.label);
    await speak(config.question);
    if (isActiveRef.current && config.type !== 'file' && config.type !== 'password' && config.type !== 'checkbox') {
      startListeningRef.current();
    }
  }, [speak]); // removed startListening from deps

  return {
    isActive,
    isListening,
    isSpeaking,
    status,
    currentFieldLabel,
    lastTranscript,
    startAssistant,
    stopAssistant,
    speakFieldHelp,
    speakCurrentField,
  };
};
