import { useCraftsmanChat } from "../../../context/CraftsmanChatProvider";
import SharedChatWindow from "../SharedChatWindow";

const CraftsmanChatWindow = () => {
    const { activeChat, messages, sendMessage, sendImage, sendAudio } = useCraftsmanChat();

    return (
        <SharedChatWindow
            activeChat={activeChat}
            messages={messages}
            sendMessage={sendMessage}
            sendImage={sendImage}
            sendAudio={sendAudio}
        />
    );
};

export default CraftsmanChatWindow;
