import React from "react";
import { useUserChat } from "../../../context/UserChatProvider";


const UserChatList: React.FC = () => {
    const { contacts, activeChat, setActiveChat } = useUserChat();

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
                                src={c.avatar}
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


export default UserChatList;