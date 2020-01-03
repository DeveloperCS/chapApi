import dialogflow from 'dialogflow';
import Message, { BaseMessage, SenderType } from '../models/Message';
import AuthController from './AuthController';
import { mongoUsertoJSONUser } from '../models/User';

const authController = new AuthController();

export default class MessagesController {
    async sendMessage(sessionId: string, message: string) {
        // Create a new session
        const sessionClient = new dialogflow.SessionsClient({
            keyFilename: 'controllers/key.json'
        });
        const sessionPath = sessionClient.sessionPath('wizmarkii-bjmaie', sessionId);
       
        // The text query request.
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: message,
                    languageCode: 'es-MX',
                },
            },
        };
       
        // Send message and get full response text
        const responses = await sessionClient.detectIntent(request);
        const action = responses[0].queryResult.action;
        const messages = responses[0].queryResult.fulfillmentMessages;
        const texts: Array<string> = messages.map((message: any) => {
            return message.text.text[0];
        });
        let fulfillmentText = texts.join('\n\n');

        const user = await authController.getBySession(sessionId);

        console.log(action);

        if (action === "nombre") {
            user.name = message
        } else if (action === "apodo") {
            user.apodo = message
        } else if (action === "apodo.sobrenombre-custom") {
            user.sexo = message
        } else if (action === "empresa") {
            user.sexo = message
        } else if (action === "edad") {
            user.edad = parseInt(message)
        } else if (action === "Conflicto1") {
            user.conflicto = message
        } else if (action === "Comenzar-prueba-personadelconflicto") {
            user.persona = message
        }

        if (user.apodo !== undefined) {
            fulfillmentText = fulfillmentText.replace("v_apodo", user.apodo);
        }
        
        if (user.empresa !== undefined) {
            fulfillmentText = fulfillmentText.replace("v_empresa", user.empresa);
        }
        
        if (user.edad !== undefined) {
            fulfillmentText = fulfillmentText.replace("v_edad", user.edad.toString());
        }
        
        if (user.sexo !== undefined) {
            fulfillmentText = fulfillmentText.replace("v_sexo", user.sexo);
        }
        
        if (user.name !== undefined) {
            fulfillmentText = fulfillmentText.replace("v_nombre", user.name);
        }
        
        if (user.conflicto != undefined) {
            fulfillmentText = fulfillmentText.replace("v_conflicto", user.conflicto);
        }

        if (user.persona != undefined) {
            fulfillmentText = fulfillmentText.replace("v_persona_conflicto", user.persona);
        }

        // Create message object
        const botMessage: BaseMessage = {
            userId: sessionId,
            text: fulfillmentText,
            date: new Date(),
            sender: SenderType.bot
        };

        // Save both messages in the database
        await Promise.all([
            Message.create({
                userId: sessionId,
                text: message,
                date: new Date(),
                sender: SenderType.user
            }),
            Message.create(botMessage),
            user.save()
        ]);

        return {
            user: mongoUsertoJSONUser(user),
            message: botMessage
        }
    }
}