import React, { useState, useRef, useMemo, useEffect } from "react";
import {
    HiPhotograph,
    HiPaperClip,
    // HiEmojiHappy,
} from "react-icons/hi";
import { FaMicrophone, FaPaperPlane } from "react-icons/fa";
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
}) => {
    const [text, setText] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    // const [showEmojis, setShowEmojis] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    /* ===== ترتيب الرسائل ===== */
    const sortedMessages = useMemo(() => {
        return [...messages].sort(
            (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
        );
    }, [messages]);

    /* ===== Auto Scroll ===== */
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [sortedMessages]);

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
                <div className="avatar-wrapper-chat">
                    <img
                        src={avatarSrc}
                        alt={activeChat.name}
                        className="contact-avatar"
                    />
                </div>
                <h4>{activeChat.name}</h4>
            </header>

            {/* ===== Messages ===== */}
            <div className="messages-container">
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

                    <button className="icon-btn" title="إرسال ملف">
                        <HiPaperClip />
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

