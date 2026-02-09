import { useUserChat } from "../../../context/UserChatProvider";
import SharedChatWindow from "../SharedChatWindow";

const UserChatWindow = () => {
    const { activeChat, messages, sendMessage } = useUserChat();

    return (
        <SharedChatWindow
            activeChat={activeChat}
            messages={messages}
            sendMessage={sendMessage}
        />
    );
};

export default UserChatWindow;

