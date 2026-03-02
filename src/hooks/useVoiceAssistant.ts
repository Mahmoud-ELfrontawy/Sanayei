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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState<string>('متوقف');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef(false);

  const prompts = [
    { field: 'name', question: 'أهلاً بك في نظام التسجيل السريع. ما هو اسمك بالكامل؟', step: 1 },
    { field: 'phone', question: 'شكراً لك. ما هو رقم هاتفك؟', step: 1 },
    { field: 'email', question: 'حسناً، ما هو بريدك الإلكتروني؟ إذا لم يكن لديك، قل: تخطي', step: 1 },
    { field: 'service_id', question: 'ما هي مهنتك؟ سأقرأ لك الخيارات: سباكة، نجارة، كهرباء، أو قل: أخرى', step: 2 },
    { field: 'custom_service', question: 'ما هي مهنتك بالتحديد؟', step: 2 },
    { field: 'governorate_id', question: 'في أي محافظة تسكن؟', step: 2 },
    { field: 'price_range', question: 'ما هو متوسط أسعار خدماتك؟ مثلاً: مئة إلى مئتين', step: 2 },
  ];

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string) => {
    return new Promise((resolve) => {
      stopRecognition();
      isSpeakingRef.current = true;
      setIsSpeaking(true);
      setStatus('جاري التحدث...');

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      
      utterance.onend = () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        resolve(true);
      };

      utterance.onerror = () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        resolve(false);
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
  }, [stopRecognition]);

  const startListening = useCallback(() => {
    if (!webkitSpeechRecognition || isSpeakingRef.current || !isActive) return;

    if (recognitionRef.current) stopRecognition();

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

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      if (event.error === 'not-allowed') {
          setStatus('عذراً، يجب السماح بالوصول للميكروفون');
          setIsActive(false);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Only restart if active, not speaking, and it wasn't a fatal error
      if (isActive && !isSpeakingRef.current && status !== 'عذراً، يجب السماح بالوصول للميكروفون') {
          setTimeout(startListening, 300);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isActive, stopRecognition]);

  const handleResponse = useCallback(async (transcript: string) => {
    const fieldToUpdate = focusedField || prompts[currentPromptIndex].field;
    
    if (transcript.includes('التالي') || transcript.includes('تخطي') || transcript.includes('تجاوز')) {
        await speak('جاري التخطي');
        if (!focusedField && currentPromptIndex < prompts.length - 1) {
            setCurrentPromptIndex(prev => prev + 1);
        }
        return;
    }

    form.setValue(fieldToUpdate as any, transcript);
    const isValid = await form.trigger(fieldToUpdate);
    
    if (!isValid) {
        const error = form.formState.errors[fieldToUpdate]?.message || 'قيمة غير صحيحة';
        await speak(`عذراً، ${error}. يرجى المحاولة مرة أخرى.`);
        return;
    }

    await speak(`تم تسجيل ${transcript} بنجاح.`);
    
    if (!focusedField && currentPromptIndex < prompts.length - 1) {
        const nextPrompt = prompts[currentPromptIndex + 1];
        setCurrentPromptIndex(prev => prev + 1);
        setCurrentStep(nextPrompt.step);
    }
  }, [currentPromptIndex, form, speak, focusedField, setCurrentStep]);

  useEffect(() => {
    if (isActive) {
        if (!isSpeakingRef.current) {
            // If it's the very start (status is 'جاري البدء...')
            if (status === 'جاري البدء...') {
                const currentPrompt = prompts.find(p => p.field === focusedField) || prompts[currentPromptIndex];
                speak(currentPrompt.question).then(() => {
                   if (isActive) startListening();
                });
            } else {
                startListening();
            }
        }
    } else {
        stopRecognition();
        window.speechSynthesis.cancel();
    }
    return () => {
        stopRecognition();
        window.speechSynthesis.cancel();
    };
  }, [isActive, startListening, stopRecognition]);

  return {
    isActive,
    isListening,
    isSpeaking,
    status,
    startAssistant: () => {
        setIsActive(true);
        setStatus('جاري البدء...');
    },
    stopAssistant: () => {
        setIsActive(false);
        setStatus('متوقف');
        stopRecognition();
        window.speechSynthesis.cancel();
    },
    speakFieldHelp: async (fieldName: string) => {
        const prompt = prompts.find(p => p.field === fieldName);
        if (prompt) {
            await speak(prompt.question);
            if (isActive) startListening();
        }
    },
    speakCurrentField: async () => {
        const fieldToHelp = focusedField || prompts[currentPromptIndex].field;
        const prompt = prompts.find(p => p.field === fieldToHelp);
        if (prompt) {
            await speak(prompt.question);
            if (isActive) startListening();
        }
    }
  };
};
