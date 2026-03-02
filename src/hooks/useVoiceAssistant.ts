import { useState, useCallback, useEffect, useRef } from 'react';

interface IWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

const { webkitSpeechRecognition } = window as unknown as IWindow;

export const useVoiceAssistant = (
  form: any, 
  setCurrentStep: (step: number) => void,
  focusedField: string | null
) => {
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
    const fieldToUpdate = focusedField || prompts[currentPromptIndex].field;
    
    if (transcript.includes('التالي') || transcript.includes('تخطي') || transcript.includes('خطوة تالية')) {
        if (!focusedField && currentPromptIndex < prompts.length - 1) {
            setCurrentPromptIndex(prev => prev + 1);
        }
        return;
    }

    // Logic to map transcript to field
    form.setValue(fieldToUpdate as any, transcript);
    
    // Trigger validation
    const isValid = await form.trigger(fieldToUpdate);
    
    if (!isValid) {
        const error = form.formState.errors[fieldToUpdate]?.message || 'القيمة غير صحيحة';
        await speak(`هناك مشكلة في ال${fieldToUpdate}: ${error}. يرجى التكرار.`);
        startListening();
        return;
    }

    await speak(`تم تسجيل ${transcript}.`);
    
    // Only move index if we are in sequential mode (no specific field focused)
    if (!focusedField && currentPromptIndex < prompts.length - 1) {
        setCurrentPromptIndex(prev => prev + 1);
    }
  }, [currentPromptIndex, form, speak, focusedField]);

  useEffect(() => {
    if (isActive && !focusedField) {
      const currentPrompt = prompts[currentPromptIndex];
      setCurrentStep(currentPrompt.step);
      speak(currentPrompt.question).then(startListening);
    } 
    // If active but focused on a field, just listen
    else if (isActive && focusedField) {
        startListening();
    }
    else {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  }, [isActive, currentPromptIndex, focusedField]);

  return {
    isActive,
    setIsActive,
    isListening,
    status,
    startAssistant: () => {
        setIsActive(true);
        window.speechSynthesis.cancel();
    },
    stopAssistant: () => {
        setIsActive(false);
        window.speechSynthesis.cancel();
        if (recognitionRef.current) recognitionRef.current.stop();
    },
    speakFieldHelp: (fieldName: string) => {
        const prompt = prompts.find(p => p.field === fieldName);
        if (prompt) {
            speak(prompt.question);
        }
    },
    speakCurrentField: () => {
        if (focusedField) {
            const prompt = prompts.find(p => p.field === focusedField);
            if (prompt) speak(prompt.question);
        } else {
            speak("يرجى الضغط على حقل معين أولاً");
        }
    }
  };
};
