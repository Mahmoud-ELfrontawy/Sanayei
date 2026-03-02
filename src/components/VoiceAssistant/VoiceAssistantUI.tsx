import React from 'react';
import { FiMic, FiSquare, FiVolume2, FiActivity, FiMessageSquare } from 'react-icons/fi';
import './VoiceAssistant.css';

interface VoiceAssistantUIProps {
    isActive: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    status: string;
    currentFieldLabel: string;
    lastTranscript: string;
    onStart: () => void;
    onStop: () => void;
    onSpeak: () => void;
}

const VoiceAssistantUI: React.FC<VoiceAssistantUIProps> = ({
    isActive,
    isListening,
    isSpeaking,
    status,
    currentFieldLabel,
    lastTranscript,
    onStart,
    onStop,
    onSpeak,
}) => {
    const isPermissionError = status === 'عذراً، يجب السماح بالوصول للميكروفون';

    return (
        <div className={`voice-assistant-container ${isActive ? 'va-active' : ''}`}>
            {!isActive ? (
                /* ── Idle State ── */
                <div className="va-idle-wrapper">
                    {isPermissionError && (
                        <div className="va-error-msg" role="alert">{status}</div>
                    )}
                    <div className="va-idle-group">
                        <button
                            type="button"
                            className="va-start-btn"
                            onClick={onStart}
                            aria-label="ابدأ المساعد الصوتي"
                        >
                            <span className="va-start-icon"><FiMic /></span>
                            <span>ابدأ المساعد الصوتي</span>
                        </button>

                        <button
                            type="button"
                            className="va-help-btn"
                            onClick={onSpeak}
                            title="اقرأ لي تعليمات الحقل الحالي"
                            disabled={!isActive}
                            aria-label="ما المطلوب في الحقل الحالي"
                        >
                            <FiVolume2 />
                            <span>ما المطلوب؟</span>
                        </button>
                    </div>
                </div>
            ) : (
                /* ── Active State ── */
                <div className="va-panel">
                    {/* Header */}
                    <div className="va-header">
                        <div className="va-brand">
                            <FiActivity className={`va-activity-icon ${isListening ? 'va-listening-pulse' : ''}`} />
                            <span>المساعد الصوتي</span>
                        </div>
                        <div className="va-header-actions">
                            <button
                                type="button"
                                className="va-repeat-btn"
                                onClick={onSpeak}
                                title="أعد السؤال"
                                aria-label="أعد قراءة السؤال"
                            >
                                <FiVolume2 />
                            </button>
                            <button
                                type="button"
                                className="va-stop-btn"
                                onClick={onStop}
                                aria-label="إيقاف المساعد"
                            >
                                <FiSquare />
                                <span>إيقاف</span>
                            </button>
                        </div>
                    </div>

                    {/* Current Field Pill */}
                    {currentFieldLabel && (
                        <div className="va-field-pill">
                            <span className="va-field-pill-label">الحقل الحالي:</span>
                            <span className="va-field-pill-name">{currentFieldLabel}</span>
                        </div>
                    )}

                    {/* Waveform Visualizer */}
                    <div className="va-visualizer" aria-hidden="true">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <div
                                key={i}
                                className={`va-bar ${isListening ? 'va-bar--listen' : ''} ${isSpeaking ? 'va-bar--speak' : ''}`}
                                style={{ animationDelay: `${i * 0.1}s` }}
                            />
                        ))}
                    </div>

                    {/* Status */}
                    <div className="va-status-row">
                        {isListening ? (
                            <span className="va-state-badge va-state-listen">
                                <FiMic /> أنا أسمعك...
                            </span>
                        ) : isSpeaking ? (
                            <span className="va-state-badge va-state-speak">
                                <FiVolume2 /> أتحدث إليك...
                            </span>
                        ) : (
                            <span className="va-state-badge va-state-idle">
                                استعد للحديث...
                            </span>
                        )}
                    </div>

                    {/* Last Heard Transcript */}
                    {lastTranscript && (
                        <div className="va-transcript-bubble" role="status">
                            <FiMessageSquare className="va-transcript-icon" />
                            <span>{lastTranscript}</span>
                        </div>
                    )}

                    {/* Footer hint */}
                    <p className="va-hint">
                        {isListening
                            ? 'تحدث بوضوح وانتظر تأكيد التسجيل'
                            : isSpeaking
                                ? 'انتظر حتى أنهي الحديث...'
                                : 'قل "تخطي" للانتقال، أو "التالي" للحقل التالي'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default VoiceAssistantUI;
