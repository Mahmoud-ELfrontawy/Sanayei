import { useUserChat } from "../../../context/UserChatProvider";
import SharedChatWindow from "../SharedChatWindow";

const UserChatWindow = () => {
    const { activeChat, setActiveChat, messages, sendMessage, sendImage, sendAudio, canSendMessage } = useUserChat();

    return (
        <SharedChatWindow
            activeChat={activeChat}
            messages={messages}
            sendMessage={sendMessage}
            sendImage={sendImage}
            sendAudio={sendAudio}
            canSendMessage={canSendMessage}
            profileLink={activeChat ? `/craftsman/${activeChat.id}` : undefined}
            onBack={() => setActiveChat(null)}
        />
    );
};

export default UserChatWindow;

