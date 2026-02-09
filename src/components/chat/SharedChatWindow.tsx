
// import React, { useState, useEffect, useRef } from "react";
// import { useChat } from "../../context/ChatContext";
// import { Send } from "lucide-react";
// import "./Chat.css";

// const buildFallbackAvatar = (name?: string) => {
//     const safeName = name && name.trim().length ? name : "User";
//     return `https://ui-avatars.com/api/?name=${encodeURIComponent(
//         safeName
//     )}&background=FF8031&color=fff&bold=true`;
// };

// const ChatWindow: React.FC = () => {
//     const { activeChat, messages, sendMessage } = useChat();

//     const [inputText, setInputText] = useState("");
//     const lastActiveChatId = useRef<number | null>(null);
//     const containerRef = useRef<HTMLDivElement>(null);

//     const scrollToBottom = (force = false) => {
//         if (!containerRef.current) return;

//         const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
//         const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

//         if (force || isNearBottom) {
//             containerRef.current.scrollTo({
//                 top: containerRef.current.scrollHeight,
//                 behavior: force ? "auto" : "smooth",
//             });
//         }
//     };

//     useEffect(() => {
//         const isNewChat = activeChat?.id !== lastActiveChatId.current;
//         scrollToBottom(isNewChat);
//         lastActiveChatId.current = activeChat?.id || null;
//     }, [messages, activeChat?.id]);

//     const handleSend = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!inputText.trim()) return;

//         await sendMessage(inputText);
//         setInputText("");
//     };

//     if (!activeChat) {
//         return (
//             <div className="chat-window empty-chat">
//                 <p>اختر محادثة للبدء في الدردشة</p>
//             </div>
//         );
//     }

//     const fallbackAvatar = buildFallbackAvatar(activeChat.name);
//     const avatarSrc = activeChat.avatar || fallbackAvatar;

//     return (
//         <div className="chat-window">
//             <header className="chat-window-header">
//                 <div className="avatar-wrapper-chat">
//                     <img
//                         src={avatarSrc}
//                         alt={activeChat.name}
//                         className="contact-avatar"
//                         onError={(e) => {
//                             (e.currentTarget as HTMLImageElement).src =
//                                 fallbackAvatar;
//                         }}
//                     />
//                 </div>
//                 <h4>{activeChat.name}</h4>
//             </header>

//             <div className="messages-container" ref={containerRef}>
//                 {messages.length > 0 ? (
//                     messages.map((msg) => {
//                         const isSentByMe = msg.is_mine;

//                         return (
//                             <div
//                                 key={msg.id}
//                                 className={`message-bubble ${
//                                     isSentByMe ? "sent" : "received"
//                                 }`}
//                             >
//                                 <div className="msg-text">{msg.message}</div>
//                                 <span className="msg-time">
//                                     {new Date(msg.created_at).toLocaleTimeString(
//                                         [],
//                                         { hour: "2-digit", minute: "2-digit" }
//                                     )}
//                                 </span>
//                             </div>
//                         );
//                     })
//                 ) : (
//                     <div className="empty-chat">
//                         لا توجد رسائل بعد.. ابدأ المحادثة الآن!
//                     </div>
//                 )}
//             </div>

//             <form className="chat-input-area" onSubmit={handleSend}>
//                 <input
//                     type="text"
//                     className="chat-input"
//                     placeholder="اكتب رسالتك هنا..."
//                     value={inputText}
//                     onChange={(e) => setInputText(e.target.value)}
//                 />
//                 <button type="submit" className="send-btn">
//                     <Send size={20} />
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default ChatWindow;










import React, { useState, useRef, useMemo } from "react";
import { Send } from "lucide-react";
import { getFullImageUrl } from "../../utils/imageUrl";
import "./Chat.css";

interface Props {
    activeChat: any;
    messages: any[];
    sendMessage: (text: string) => Promise<void>;
}

const buildFallbackAvatar = (name?: string) => {
    const safeName = name && name.trim().length ? name : "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        safeName
    )}&background=FF8031&color=fff&bold=true`;
};

const SharedChatWindow: React.FC<Props> = ({
    activeChat,
    messages,
    sendMessage,
}) => {
    const [inputText, setInputText] = useState("");

    /** مرجع لآخر عنصر علشان الـ auto scroll */
    const bottomRef = useRef<HTMLDivElement>(null);

    /** ترتيب الرسائل من الأقدم للأحدث */
    const sortedMessages = useMemo(() => {
        return [...messages].sort(
            (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
        );
    }, [messages]);

    /** النزول لآخر رسالة بعد أي تحديث */
    

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        await sendMessage(inputText.trim());
        setInputText("");
    };

    /** حالة عدم اختيار محادثة */
    if (!activeChat) {
        return (
            <div className="chat-window empty-chat">
                <p>اختر محادثة للبدء في الدردشة</p>
            </div>
        );
    }

    const fallbackAvatar = buildFallbackAvatar(activeChat.name);
    const avatarSrc = activeChat.avatar || fallbackAvatar;

    return (
        <div className="chat-window">
            {/* ===== Header ===== */}
            <header className="chat-window-header">
                <div className="avatar-wrapper-chat">
                    <img
                        src={avatarSrc}
                        alt={activeChat.name}
                        className="contact-avatar"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                                fallbackAvatar;
                        }}
                    />
                </div>
                <h4>{activeChat.name}</h4>
            </header>

            {/* ===== Messages ===== */}
            <div className="messages-container">
                {sortedMessages.length > 0 ? (
                    sortedMessages.map((msg) => {
                        const isSentByMe = msg.sender_id === activeChat?.id ? false : true;

                        return (
                            <div
                                key={msg.id}
                                className={`message-bubble ${isSentByMe ? "sent" : "received"
                                    }`}
                            >
                                {/* نص / صورة / صوت */}
                                {msg.message_type === "image" ? (
                                    <img
                                        src={getFullImageUrl(msg.media_path)}
                                        className="msg-image"
                                        alt="message"
                                    />
                                ) : msg.message_type === "audio" ? (
                                    <audio
                                        controls
                                        src={getFullImageUrl(msg.media_path)}
                                    />
                                ) : (
                                    <div className="msg-text">{msg.message}</div>
                                )}

                                {/* وقت الرسالة */}
                                <span className="msg-time">
                                    {new Date(msg.created_at).toLocaleTimeString(
                                        [],
                                        { hour: "2-digit", minute: "2-digit" }
                                    )}
                                </span>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-chat">
                        لا توجد رسائل بعد.. ابدأ المحادثة الآن!
                    </div>
                )}

                {/* عنصر وهمي للسكرول */}
                <div ref={bottomRef} />
            </div>

            {/* ===== Input ===== */}
            <form className="chat-input-area" onSubmit={handleSend}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="اكتب رسالتك هنا..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <button type="submit" className="send-btn">
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default SharedChatWindow;

