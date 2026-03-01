import { useCraftsmanChat } from "../../../context/CraftsmanChatProvider";
import SharedChatWindow from "../SharedChatWindow";

const CraftsmanChatWindow = () => {
    const { activeChat, setActiveChat, messages, sendMessage, sendImage, sendAudio, canSendMessage } = useCraftsmanChat();

    return (
        <SharedChatWindow
            activeChat={activeChat}
            messages={messages}
            sendMessage={sendMessage}
            sendImage={sendImage}
            sendAudio={sendAudio}
            canSendMessage={canSendMessage}
            profileLink={activeChat ? `/user/${activeChat.id}` : undefined}
            onBack={() => setActiveChat(null)}
        />
    );
};

export default CraftsmanChatWindow;
