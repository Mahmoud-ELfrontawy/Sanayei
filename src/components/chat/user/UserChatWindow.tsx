import { useUserChat } from "../../../context/UserChatProvider";
import SharedChatWindow from "../SharedChatWindow";

const UserChatWindow = () => {
    const { activeChat, messages, sendMessage, sendImage, sendAudio } = useUserChat();

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

export default UserChatWindow;

