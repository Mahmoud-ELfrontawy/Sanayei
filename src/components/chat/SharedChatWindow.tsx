import React, { useState, useRef, useMemo, useEffect, Suspense, lazy } from "react";
import {
    HiPhotograph,
} from "react-icons/hi";
import { FaArrowRight, FaMicrophone, FaPaperPlane, FaPlus, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BsEmojiSmile } from "react-icons/bs";
import { type EmojiClickData } from "emoji-picker-react";

// Lazy load EmojiPicker to improve performance
const EmojiPicker = lazy(() => import("emoji-picker-react"));
import { getFullImageUrl, getAvatarUrl } from "../../utils/imageUrl";
import { toast } from "react-toastify";
import "./Chat.css";

/* ================= Types ================= */

interface Message {
    id: number;
    sender_id: number;
    created_at: string;
    message?: string;
    message_type?: "text" | "image" | "audio";
    media_path?: string | null;
}

interface ChatUser {
    id: number;
    name: string;
    avatar?: string;
}

interface Props {
    activeChat: ChatUser | null;
    messages: Message[];
    sendMessage: (text: string) => Promise<void>;
    sendImage?: (file: File) => Promise<void>;
    sendAudio?: (file: Blob) => Promise<void>;
    profileLink?: string;
    onBack?: () => void;
}

/* ================= Helpers ================= */



/* ================= Component ================= */

const SharedChatWindow: React.FC<Props> = ({
    activeChat,
    messages,
    sendMessage,
    sendImage,
    sendAudio,
    profileLink,
    onBack,
}) => {
    const [text, setText] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isSendingAudio, setIsSendingAudio] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMobileActions, setShowMobileActions] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    /* ===== ترتيب الرسائل ===== */
    const sortedMessages = useMemo(() => {
        return [...messages].sort(
            (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
        );
    }, [messages]);

    /* ===== Timer for Recording ===== */
    useEffect(() => {
        let interval: any;
        if (isRecording) {
            setRecordingDuration(0);
            interval = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    /* ===== Auto Scroll (داخل الشات فقط) ===== */
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [sortedMessages]);

    /* ===== Close emoji picker when clicking outside ===== */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target as Node) &&
                !(event.target as HTMLElement).closest('.icon-btn')
            ) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    /* ===== إرسال نص ===== */
    const handleSendText = async () => {
        if (!text.trim()) return;
        const msg = text.trim();
        setText("");
        try {
            await sendMessage(msg);
        } catch {
            // Error handled by mutation onError — message likely saved
        }
    };

    /* ===== رفع صورة ===== */
    const handleFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file || !sendImage) return;

        await sendImage(file);
        e.target.value = "";
    };

    /* ===== تسجيل صوت ===== */
    const getSupportedMimeType = () => {
        const types = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav"];
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) return type;
        }
        return "";
    };

    const startRecording = async (e: React.MouseEvent | React.TouchEvent) => {
        if (!sendAudio) return;

        // Prevent default browser behaviors on mobile/desktop
        e.preventDefault();
        e.stopPropagation();

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast.error("المتصفح لا يدعم التسجيل الصوتي أو ينقصك اتصال آمن (HTTPS)");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = getSupportedMimeType();

            if (!mimeType) {
                toast.error("تنسيق الصوت غير مدعوم في هذا المتصفح");
                return;
            }

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (ev) => {
                if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

                try {
                    setIsSendingAudio(true);
                    await sendAudio(audioBlob);
                } catch (err) {
                    console.error("Audio upload failed", err);
                    toast.error("فشل إرسال التسجيل الصوتي");
                } finally {
                    setIsSendingAudio(false);
                }
                stream.getTracks().forEach((t) => t.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Microphone access failed", err);
            toast.error("يرجى السماح بالوصول إلى المايكروفون");
        }
    };

    const stopRecording = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isRecording) return;
        e.preventDefault();
        e.stopPropagation();

        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    const cancelRecording = () => {
        if (!isRecording) return;
        mediaRecorderRef.current!.onstop = () => { }; // Ignore the stop event
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    /* ===== Emoji Handler ===== */
    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setText((prev) => prev + emojiData.emoji);
    };

    /* ===== بدون محادثة ===== */
    if (!activeChat) {
        return (
            <div className="chat-window empty-chat">
                اختر محادثة للبدء في الدردشة
            </div>
        );
    }

    const avatarSrc = getAvatarUrl(activeChat.avatar, activeChat.name);

    return (
        <div className="chat-window">
            {/* ===== Header ===== */}
            <header className="chat-window-header">
                <div className="chat-header-user-info">
                    {onBack && (
                        <button onClick={onBack} className="chat-back-btn" title="العودة للقائمة">
                            <FaArrowRight />
                        </button>
                    )}

                    {profileLink ? (
                        <Link to={profileLink} className="chat-header-link">
                            <div className="avatar-wrapper-chat">
                                <img
                                    src={avatarSrc}
                                    alt={activeChat.name}
                                    className="contact-avatar"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = getAvatarUrl(null, activeChat.name);
                                    }}
                                />
                            </div>
                            <h4>{activeChat.name}</h4>
                        </Link>
                    ) : (
                        <>
                            <div className="avatar-wrapper-chat">
                                <img
                                    src={avatarSrc}
                                    alt={activeChat.name}
                                    className="contact-avatar"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = getAvatarUrl(null, activeChat.name);
                                    }}
                                />
                            </div>
                            <h4>{activeChat.name}</h4>
                        </>
                    )}
                </div>

                {/* Dedicated Profile Link Button */}
                {profileLink && (
                    <Link to={profileLink} className="view-profile-btn-header" title="عرض الملف الشخصي">
                        <FaUserCircle size={22} />
                        <span>الملف الشخصي</span>
                    </Link>
                )}
            </header>

            {/* ===== Messages ===== */}
            <div className="messages-container" ref={messagesContainerRef}>
                {sortedMessages.map((msg) => {
                    const isMine = msg.sender_id !== activeChat.id;

                    return (
                        <div
                            key={msg.id}
                            className={`message-bubble ${isMine ? "sent" : "received"
                                }`}
                        >
                            {msg.message_type === "image" ? (
                                <img
                                    src={getFullImageUrl(msg.media_path)}
                                    className="msg-image"
                                    alt="message"
                                />
                            ) : msg.message_type === "audio" ? (
                                <audio controls src={getFullImageUrl(msg.media_path)} />
                            ) : (
                                <div className="msg-text">{msg.message}</div>
                            )}

                            <span className="msg-time">
                                {new Date(msg.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                    );
                })}

                <div ref={bottomRef} />
            </div>

            {/* ===== Input Area ===== */}
            <div className={`chat-input-area ${showMobileActions ? "actions-expanded" : ""}`}>

                {/* زر الإضافة للموبايل */}
                <button
                    className={`mobile-actions-toggle ${showMobileActions ? "active" : ""}`}
                    onClick={() => setShowMobileActions(!showMobileActions)}
                    title="المزيد من الخيارات"
                >
                    <FaPlus />
                </button>

                {/* أزرار جانبية */}
                <div className="chat-actions">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="icon-btn"
                        title="إرسال صورة"
                    >
                        <HiPhotograph />
                    </button>

                    <button
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        className="icon-btn"
                        title="إيموجي"
                    >
                        <BsEmojiSmile />
                    </button>

                    <button
                        onMouseDown={(e) => startRecording(e)}
                        onMouseUp={(e) => stopRecording(e)}
                        onMouseLeave={(e) => isRecording && stopRecording(e)}
                        onTouchStart={(e) => startRecording(e)}
                        onTouchEnd={(e) => stopRecording(e)}
                        className={`icon-btn mic-btn-feedback ${isRecording ? "recording" : ""}`}
                        title="تسجيل صوتي"
                    >
                        <FaMicrophone />
                    </button>
                </div>

                {/* Hidden input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                />

                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <div className="emoji-picker-wrapper" ref={emojiPickerRef}>
                        <Suspense fallback={<div style={{ width: 320, height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>جاري التحميل...</div>}>
                            <EmojiPicker
                                onEmojiClick={handleEmojiClick}
                                width={320}
                                height={400}
                            />
                        </Suspense>
                    </div>
                )}

                {/* النص */}
                <div className="chat-input-wrapper">
                    {isRecording ? (
                        <div className="recording-status-bar">
                            <span className="recording-dot"></span>
                            <span className="recording-text">جاري التسجيل...</span>
                            <span className="recording-timer">{formatDuration(recordingDuration)}</span>
                            <button className="cancel-recording-btn" onClick={cancelRecording}>
                                إلغاء
                            </button>
                        </div>
                    ) : isSendingAudio ? (
                        <div className="sending-audio-status">
                            <span className="spinner-mini"></span>
                            جاري إرسال التسجيل...
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendText();
                                }
                            }}
                            placeholder="اكتب رسالتك هنا..."
                            className="chat-input"
                        />
                    )}
                </div>

                {/* إرسال */}
                <button
                    onClick={handleSendText}
                    disabled={!text.trim()}
                    className={`send-btn ${!text.trim() ? "disabled" : ""}`}
                    title="إرسال"
                >
                    <FaPaperPlane />
                </button>
            </div>
        </div>
    );
};

export default SharedChatWindow;

