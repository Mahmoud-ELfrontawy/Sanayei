import { useCraftsmanChat } from "../../../context/CraftsmanChatProvider";
import SharedChatWindow from "../SharedChatWindow";

const CraftsmanChatWindow = () => {
    const { activeChat, messages, sendMessage } = useCraftsmanChat();

    return (
        <SharedChatWindow
            activeChat={activeChat}
            messages={messages}
            sendMessage={sendMessage}
        />
    );
};

export default CraftsmanChatWindow;
