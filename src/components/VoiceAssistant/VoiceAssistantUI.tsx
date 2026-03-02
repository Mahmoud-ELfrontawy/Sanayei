import React from 'react';
import { FiMic, FiSquare, FiVolume2 } from 'react-icons/fi';
import './VoiceAssistant.css';

interface VoiceAssistantUIProps {
    isActive: boolean;
    isListening: boolean;
    status: string;
    onStart: () => void;
    onStop: () => void;
    onSpeak: () => void;
}

const VoiceAssistantUI: React.FC<VoiceAssistantUIProps> = ({
    isActive,
    isListening,
    status,
    onStart,
    onStop,
    onSpeak,
}) => {
    return (
        <div className={`voice-assistant-container ${isActive ? 'active' : ''}`}>
            {!isActive ? (
                <div className="voice-trigger-group">
                    <button type="button" className="voice-trigger-btn" onClick={onStart}>
                        <FiMic />
                        <span>ابدأ الإملاء الصوتي</span>
                    </button>
                    <button type="button" className="voice-help-btn" onClick={onSpeak} title="اسمعه بالعربي">
                        <FiVolume2 />
                        <span>ما المطلوب هنا؟</span>
                    </button>
                </div>
            ) : (
                <div className="voice-active-panel">
                    <div className="voice-wave">
                        <span className={isListening ? 'animate' : ''}></span>
                        <span className={isListening ? 'animate' : ''}></span>
                        <span className={isListening ? 'animate' : ''}></span>
                    </div>

                    <div className="voice-info">
                        <div className="voice-status">
                            {isListening ? <FiMic className="pulse" /> : <FiVolume2 />}
                            <span>{status || (isListening ? 'أنا أسمعك...' : 'جاري التحدث...')}</span>
                        </div>
                        <p className="voice-hint">توجيه: سأكتب في الحقل الذي تقف عليه حالياً</p>
                    </div>

                    <div className="voice-actions-row">
                        <button type="button" className="voice-stop-btn" onClick={onStop}>
                            <FiSquare /> إيقاف المساعد
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceAssistantUI;
