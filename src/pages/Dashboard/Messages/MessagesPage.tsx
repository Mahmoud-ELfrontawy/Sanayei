import React from "react";
import UserChatList from "../../../components/chat/user/UserChatList";
import UserChatWindow from "../../../components/chat/user/UserChatWindow";

import CraftsmanChatList from "../../../components/chat/craftsman/CraftsmanChatList";
import CraftsmanChatWindow from "../../../components/chat/craftsman/CraftsmanChatWindow";

import "./MessagesPage.css";

const MessagesPage: React.FC = () => {
    const userType = localStorage.getItem("userType");

    const ChatList =
        userType === "craftsman" ? CraftsmanChatList : UserChatList;

    const ChatWindow =
        userType === "craftsman" ? CraftsmanChatWindow : UserChatWindow;

    return (
        <div className="messages-page">
            <header className="messages-header">
                <h1>الرسائل والمحادثات</h1>
                <p>تواصل مع الجهات المعنية بطلبات خدماتك</p>
            </header>

            <div className="messages-content">
                <div className="chat-container">
                    <ChatList />
                    <ChatWindow />
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
