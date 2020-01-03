import AuthController from './AuthController';
import User, { BaseUser, UserType, mongoUsertoJSONUser } from '../models/User';
const authController = new AuthController();
const autoBind = require('auto-bind');

export default class ClientsController {

    constructor() {
        autoBind(this);
    }
    
    async create(information: BaseUser) {
        return authController.create(information, UserType.client);
    }

    async update(id: string, information: BaseUser) {
        return authController.update(id, UserType.client, information);
    }

    async delete(id: string) {
        return authController.delete(id, UserType.client);
    }

    async getAll() {
        const users = await User.find({
            type: UserType.client
        }).exec();
        return users.map((user) => {
            return mongoUsertoJSONUser(user);
        });
    }

    async get(id: string) {
        return authController.get(id, UserType.client);
    }

    async setIntroductionDone(id: string) {
        const user = await User.findByIdAndUpdate(id, {
            introductionDone: true
        }, { new: true }).exec();
        return mongoUsertoJSONUser(user);
    }

    async setTutorialDone(id: string) {
        const user = await User.findByIdAndUpdate(id, {
            tutorialDone: true
        }, { new: true }).exec();
        return mongoUsertoJSONUser(user);
    }
}
