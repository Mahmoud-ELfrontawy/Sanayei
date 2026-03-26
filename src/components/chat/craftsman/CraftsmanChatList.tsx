import React from "react";
import { useCraftsmanChat } from "../../../context/CraftsmanChatProvider";
import { getAvatarUrl } from "../../../utils/imageUrl";

const CraftsmanChatList: React.FC = () => {
    const { contacts, activeChat, setActiveChat } = useCraftsmanChat();

    // ensure activeChat is in the list even if it's new (started from community)
    const displayContacts = [...contacts];
    if (activeChat && !contacts.some(c => Number(c.id) === Number(activeChat.id))) {
        displayContacts.unshift({
            id: activeChat.id,
            name: activeChat.name,
            type: activeChat.type,
            avatar: activeChat.avatar,
            unread_count: 0
        });
    }

    return (
        <aside className="chat-list">
            <div className="chat-list-header">
                <h3>المحادثات</h3>
            </div>

            <div className="contacts-scroll">
                {displayContacts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        لا توجد محادثات
                    </div>
                ) : (
                    displayContacts.map((c) => (
                        <div
                            key={`${c.type}_${c.id}`}
                            className={`contact-item ${Number(activeChat?.id) === Number(c.id) ? "active" : ""
                                }`}
                            onClick={() => setActiveChat(c)}
                        >
                            <div className="contact-avatar-container" style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                                <img
                                    src={getAvatarUrl(c.avatar, c.name)}
                                    alt={c.name}
                                    className="contact-avatar"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = getAvatarUrl(null, c.name);
                                    }}
                                />
                            </div>

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