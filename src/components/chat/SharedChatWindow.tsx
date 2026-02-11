import React, { useState, useRef, useMemo, useEffect } from "react";
import {
    HiPhotograph,
} from "react-icons/hi";
import { FaMicrophone, FaPaperPlane, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { getFullImageUrl } from "../../utils/imageUrl";
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
}

/* ================= Helpers ================= */

const buildFallbackAvatar = (name?: string) => {
    const safeName = name && name.trim().length ? name : "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        safeName
    )}&background=FF8031&color=fff&bold=true`;
};

/* ================= Component ================= */

const SharedChatWindow: React.FC<Props> = ({
    activeChat,
    messages,
    sendMessage,
    sendImage,
    sendAudio,
    profileLink,
}) => {
    const [text, setText] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
        await sendMessage(text.trim());
        setText("");
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
    const startRecording = async () => {
        if (!sendAudio) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: "audio/webm",
                });

                await sendAudio(audioBlob);
                stream.getTracks().forEach((t) => t.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch {
            console.error("Microphone permission denied");
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
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

    const avatarSrc =
        activeChat.avatar || buildFallbackAvatar(activeChat.name);

    return (
        <div className="chat-window">
            {/* ===== Header ===== */}
            <header className="chat-window-header">
                {profileLink ? (
                    <Link to={profileLink} className="chat-header-link">
                        <div className="avatar-wrapper-chat">
                            <img
                                src={avatarSrc}
                                alt={activeChat.name}
                                className="contact-avatar"
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
                            />
                        </div>
                        <h4>{activeChat.name}</h4>
                    </>
                )}

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
            <div className="chat-input-area">

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
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        className={`icon-btn ${isRecording ? "recording" : ""}`}
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
                        <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            width={320}
                            height={400}
                        />
                    </div>
                )}

                {/* النص */}
                <div className="chat-input-wrapper">
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

                    {/* <button
                        onClick={() => setShowEmojis((p) => !p)}
                        className="emoji-btn"
                        title="إيموجي"
                    >
                        <HiEmojiHappy />
                    </button> */}
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

