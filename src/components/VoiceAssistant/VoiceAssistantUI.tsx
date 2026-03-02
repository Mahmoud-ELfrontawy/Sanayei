import React from 'react';
import { FiMic, FiSquare, FiVolume2, FiActivity } from 'react-icons/fi';
import './VoiceAssistant.css';

interface VoiceAssistantUIProps {
    isActive: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    status: string;
    onStart: () => void;
    onStop: () => void;
    onSpeak: () => void;
}

const VoiceAssistantUI: React.FC<VoiceAssistantUIProps> = ({
    isActive,
    isListening,
    isSpeaking,
    status,
    onStart,
    onStop,
    onSpeak,
}) => {
    return (
        <div className={`voice-assistant-container ${isActive ? 'active' : ''}`}>
            {!isActive ? (
                <div className="voice-trigger-group-wrapper">
                    {status === 'عذراً، يجب السماح بالوصول للميكروفون' && (
                        <div className="voice-error-msg">{status}</div>
                    )}
                    <div className="voice-trigger-group">
                        <button type="button" className="voice-trigger-btn primary-gradient" onClick={onStart}>
                            <FiMic />
                            <span>ابدأ المساعد الصوتي</span>
                        </button>
                        <button type="button" className="voice-help-btn outline-primary" onClick={onSpeak} title="اسمعه بالعربي">
                            <FiVolume2 />
                            <span>ما المطلوب؟</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="voice-active-panel">
                    <div className="voice-header">
                        <div className="voice-branding">
                            <FiActivity className={`recording-icon ${isListening ? 'active-listening' : ''}`} />
                            <span>المساعد النشط</span>
                        </div>
                        <button type="button" className="voice-close-mini" onClick={onStop}>
                            <FiSquare /> إغلاق
                        </button>
                    </div>

                    <div className="voice-visualizer">
                        <div className={`wave-bar ${isListening ? 'animate' : ''} ${isSpeaking ? 'speaking' : ''}`}></div>
                        <div className={`wave-bar ${isListening ? 'animate' : ''} ${isSpeaking ? 'speaking' : ''}`}></div>
                        <div className={`wave-bar ${isListening ? 'animate' : ''} ${isSpeaking ? 'speaking' : ''}`}></div>
                        <div className={`wave-bar ${isListening ? 'animate' : ''} ${isSpeaking ? 'speaking' : ''}`}></div>
                        <div className={`wave-bar ${isListening ? 'animate' : ''} ${isSpeaking ? 'speaking' : ''}`}></div>
                    </div>

                    <div className="voice-content">
                        <p className="voice-status-text">
                            {isListening ? (
                                <span className="listening-text"><FiMic className="mic-icon" /> أنا أسمعك الآن...</span>
                            ) : isSpeaking ? (
                                <span className="speaking-text"><FiVolume2 className="vol-icon" /> جاري التحدث...</span>
                            ) : (
                                <span className="idle-text">استعد...</span>
                            )}
                        </p>
                        <p className="voice-transcript">{status}</p>
                    </div>

                    <div className="voice-footer">
                        <p className="voice-hint-pro">تحدث بوضوح، سأقوم بكتابة ما تقوله في الحقل الحالي</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceAssistantUI;
