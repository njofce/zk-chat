import Message from '../persistence/model/message/message.model';
import { IMessage } from './../persistence/model/message/message.types';

/**
 * Encapsultes the functionality for handling chat messages.
 */
class ChatService {

    public async getDailyMessages(): Promise<IMessage[]> {
        return (await Message.getDailyMessages())
            .map(message => {
                return {
                    uuid: message.uuid,
                    epoch: message.epoch,
                    chat_type: message.chat_type,
                    message_content: message.message_content
                }
            });
    }

}

export default ChatService