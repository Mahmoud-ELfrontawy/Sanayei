import React from 'react';
import { FiMic, FiSquare, FiVolume2 } from 'react-icons/fi';
import './VoiceAssistant.css';

interface VoiceAssistantUIProps {
    isActive: boolean;
    isListening: boolean;
    status: string;
    onStart: () => void;
    onStop: () => void;
}

const VoiceAssistantUI: React.FC<VoiceAssistantUIProps> = ({
    isActive,
    isListening,
    status,
    onStart,
    onStop,
}) => {
    return (
        <div className={`voice-assistant-container ${isActive ? 'active' : ''}`}>
            {!isActive ? (
                <button type="button" className="voice-trigger-btn" onClick={onStart}>
                    <FiMic />
                    <span>مساعد تسجيل صوتي (لغير المتعلمين)</span>
                </button>
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
                        <p className="voice-hint">تحدث بوضوح، أو قل "توقف" للإغلاق</p>
                    </div>

                    <button type="button" className="voice-stop-btn" onClick={onStop}>
                        <FiSquare /> إيقاف المساعد
                    </button>
                </div>
            )}
        </div>
    );
};

export default VoiceAssistantUI;
