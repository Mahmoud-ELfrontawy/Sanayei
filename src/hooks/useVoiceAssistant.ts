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
  _governorates: SelectOption[]
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
    question: 'في أي محافظة تسكن؟ مثلاً: القاهرة، الجيزة، الإسكندرية...',
    type: 'select',
    step: 2,
    matchOptions: (transcript, options) => {
      const lower = transcript.trim().toLowerCase();
      const found = options.find(o =>
        lower.includes(o.name.toLowerCase()) || o.name.toLowerCase().includes(lower)
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
  // Start listening
  // ──────────────────────────────────────────
  const startListening = useCallback(() => {
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
      handleVoiceInput(transcript);
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
        // Restart quietly
        if (isActiveRef.current && !isSpeakingRef.current) {
          setTimeout(startListening, 500);
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart only if still active and not speaking
      if (isActiveRef.current && !isSpeakingRef.current) {
        setTimeout(startListening, 400);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch { /* already started */ }
  }, [stopRecognition]);

  // ──────────────────────────────────────────
  // Present a field (speak its question then listen)
  // ──────────────────────────────────────────
  const presentField = useCallback(async (config: FieldConfig) => {
    if (!isActiveRef.current) return;
    setCurrentFieldLabel(config.label);
    setCurrentStep(config.step);
    await speak(config.question);
    if (isActiveRef.current) {
      // For file/password/checkbox fields, just wait — user acts manually
      if (config.type === 'file' || config.type === 'password' || config.type === 'checkbox') {
        setStatus(`يرجى اتخاذ الإجراء يدوياً للحقل: ${config.label}`);
        // Don't listen — user will do it manually; auto-advance after delay
        await new Promise(r => setTimeout(r, 1500));
        // Advance to next field automatically
        const idx = promptIndexRef.current;
        if (idx < fieldConfigsRef.current.length - 1) {
          promptIndexRef.current = idx + 1;
          await presentField(fieldConfigsRef.current[idx + 1]);
        }
      } else {
        startListening();
      }
    }
  }, [speak, startListening, setCurrentStep]);

  // ──────────────────────────────────────────
  // Handle voice input for a given field
  // ──────────────────────────────────────────
  const handleVoiceInput = useCallback(async (transcript: string) => {
    stopRecognition();

    const configs = fieldConfigsRef.current;
    const focusedFieldName = focusedFieldRef.current;

    // Determine which field to fill
    const targetConfig = focusedFieldName
      ? configs.find(c => c.field === focusedFieldName) || configs[promptIndexRef.current]
      : configs[promptIndexRef.current];

    if (!targetConfig) return;

    // Skip command
    if (/تخطي|تجاوز|التالي|skip/i.test(transcript)) {
      await speak('حسناً، تم التخطي.');
      if (!focusedFieldName && promptIndexRef.current < configs.length - 1) {
        promptIndexRef.current += 1;
        await presentField(configs[promptIndexRef.current]);
      }
      return;
    }

    // File / password / checkbox — shouldn't receive voice input, but just in case
    if (targetConfig.type === 'file' || targetConfig.type === 'password' || targetConfig.type === 'checkbox') {
      await speak('هذا الحقل يتطلب إجراءً يدوياً.');
      startListening();
      return;
    }

    let valueToSet: string = transcript;

    // Handle select fields
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

    // Handle tel: extract digits only
    if (targetConfig.type === 'tel') {
      valueToSet = transcript.replace(/\D/g, '').replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632));
      if (!valueToSet) {
        await speak('لم أسمع أرقاماً واضحة، يرجى المحاولة مرة أخرى.');
        startListening();
        return;
      }
    }

    // Handle price_range: normalize arabic text to number range
    if (targetConfig.field === 'price_range') {
      const normalized = normalizeArabicNumbers(transcript);
      if (normalized && normalized.includes('-')) {
        valueToSet = normalized;
      } else if (transcript.match(/\d+\s*[-–]\s*\d+/)) {
        valueToSet = transcript.replace(/\s/g, '');
      }
    }

    // Set value and trigger validation
    form.setValue(targetConfig.field, valueToSet);
    const isValid = await form.trigger(targetConfig.field);

    if (!isValid) {
      const errorMsg = form.formState.errors[targetConfig.field]?.message || 'قيمة غير صحيحة';
      await speak(`عذراً، ${errorMsg}. يرجى المحاولة مرة أخرى.`);
      if (isActiveRef.current) startListening();
      return;
    }

    // Success feedback
    if (targetConfig.type === 'select') {
      await speak('تم الاختيار بنجاح.');
    } else {
      await speak('تم التسجيل بنجاح.');
    }

    // Advance to next field (only in sequential mode — not focus mode)
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
      // Focus mode: stay listening for this field
      if (isActiveRef.current) startListening();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, speak, stopRecognition, startListening, presentField]);

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
    promptIndexRef.current = 0;
    setStatus('جاري البدء...');
    const configs = fieldConfigsRef.current;
    if (configs.length > 0) {
      await presentField(configs[0]);
    }
  }, [presentField]);

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
    if (isActiveRef.current) startListening();
  }, [speak, startListening]);

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
      startListening();
    }
  }, [speak, startListening]);

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
