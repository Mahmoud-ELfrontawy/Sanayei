import { useState, useCallback, useEffect, useRef } from 'react';

interface IWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

const { webkitSpeechRecognition } = window as unknown as IWindow;

export const useVoiceAssistant = (form: any, setCurrentStep: (step: number) => void) => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [status, setStatus] = useState<string>('');

  const recognitionRef = useRef<any>(null);

  const prompts = [
    { field: 'name', question: 'أهلاً بك في صنايعي. ما هو اسمك بالكامل؟', step: 1 },
    { field: 'phone', question: 'شكراً لك. ما هو رقم هاتفك؟', step: 1 },
    { field: 'email', question: 'حسناً، ما هو بريدك الإلكتروني؟ إذا لم يكن لديك، قل: خطوة تالية', step: 1 },
    { field: 'service_id', question: 'ما هي مهنتك؟ سأقرأ لك الخيارات: سباكة، نجارة، كهرباء، أو قل: أخرى', step: 2 },
    { field: 'governorate_id', question: 'في أي محافظة تسكن؟', step: 2 },
    { field: 'price_range', question: 'ما هو متوسط أسعار خدماتك؟ مثلاً: مئة إلى مئتين', step: 2 },
  ];

  const speak = useCallback((text: string) => {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.onend = resolve;
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const startListening = useCallback(() => {
    if (!webkitSpeechRecognition) {
        setStatus('متصفحك لا يدعم التعرف على الصوت');
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('أنا أسمعك الآن...');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setStatus(`سمعت: ${transcript}`);
      handleResponse(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      speak('عذراً، لم أسمعك جيداً. هل يمكنك التكرار؟').then(startListening);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [speak]);

  const handleResponse = useCallback(async (transcript: string) => {
    const currentPrompt = prompts[currentPromptIndex];
    
    if (transcript.includes('التالي') || transcript.includes('تخطي') || transcript.includes('خطوة تالية')) {
        if (currentPromptIndex < prompts.length - 1) {
            setCurrentPromptIndex(prev => prev + 1);
        }
        return;
    }

    // Logic to map transcript to field
    form.setValue(currentPrompt.field as any, transcript);
    
    // Trigger validation
    const isValid = await form.trigger(currentPrompt.field);
    
    if (!isValid) {
        const error = form.formState.errors[currentPrompt.field]?.message || 'القيمة غير صحيحة';
        await speak(`هناك مشكلة: ${error}. يرجى التكرار.`);
        startListening();
        return;
    }

    await speak(`تم تسجيل ${transcript}.`);
    
    if (currentPromptIndex < prompts.length - 1) {
        setCurrentPromptIndex(prev => prev + 1);
    } else {
        setIsActive(false);
        speak('شكراً لك، لقد أكملنا البيانات الأساسية. يمكنك متابعة التسجيل الآن.');
    }
  }, [currentPromptIndex, form, speak]);

  useEffect(() => {
    if (isActive) {
      const currentPrompt = prompts[currentPromptIndex];
      setCurrentStep(currentPrompt.step);
      speak(currentPrompt.question).then(startListening);
    } else {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  }, [isActive, currentPromptIndex]);

  return {
    isActive,
    setIsActive,
    isListening,
    status,
    startAssistant: () => {
        setIsActive(true);
        setCurrentPromptIndex(0);
    },
    stopAssistant: () => {
        setIsActive(false);
        window.speechSynthesis.cancel();
    },
    speakFieldHelp: (fieldName: string) => {
        // Only speak if the full assistant is NOT already running
        if (isActive) return;
        
        const prompt = prompts.find(p => p.field === fieldName);
        if (prompt) {
            speak(prompt.question);
        }
    }
  };
};
