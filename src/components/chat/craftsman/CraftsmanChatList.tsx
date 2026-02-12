import React from "react";
import { useCraftsmanChat } from "../../../context/CraftsmanChatProvider";

const CraftsmanChatList: React.FC = () => {
    const { contacts, activeChat, setActiveChat } = useCraftsmanChat();

    return (
        <aside className="chat-list">
            <div className="chat-list-header">
                <h3>المحادثات</h3>
            </div>

            <div className="contacts-scroll">
                {contacts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        لا توجد محادثات
                    </div>
                ) : (
                    contacts.map((c) => (
                        <div
                            key={c.id}
                            className={`contact-item ${activeChat?.id === c.id ? "active" : ""
                                }`}
                            onClick={() => setActiveChat(c)}
                        >
                            <img
                                src={c.avatar || "/default-avatar.png"}
                                alt={c.name}
                                className="contact-avatar"
                            />

                            <div className="contact-info">
                                <div className="contact-name">{c.name}</div>
                            </div>

                            {c.unread_count > 0 && (
                                <span className="unread-badge">
                                    {c.unread_count}
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </aside>

    );
};

export default CraftsmanChatList;