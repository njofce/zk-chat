import Message from '../persistence/model/message/message.model';
import { IMessage } from './../persistence/model/message/message.types';

class ChatService {

    public async getDailyMessages(roomIds: string[]): Promise<IMessage[]> {
        return (await Message.getDailyMessages())
            .filter(m => roomIds.indexOf(m.uuid) != -1)
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