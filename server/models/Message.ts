import mongoose, { Schema, Document } from 'mongoose';
import { MongoUser } from './User';

export enum SenderType {
    user = 'user',
    bot = 'bot'
}

export interface BaseMessage {
    sender: SenderType
    userId: MongoUser['_id']
    text: string
    date: Date
}

export interface JSONMessage extends BaseMessage {
    id: string
}

export interface MongoMessage extends Document, BaseMessage {}

export const mongoMessagetoJSONMessage = (message: MongoMessage) => {
    const jsonMessage: JSONMessage = {
        id: message._id,
        userId: message.userId,
        sender: message.sender,
        text: message.text,
        date: message.date
    }
    return jsonMessage
}

const MessageSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, required: true }
});

export default mongoose.model<MongoMessage>('Message', MessageSchema);
