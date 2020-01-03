import AuthController from './AuthController';
import User, { BaseUser, UserType, mongoUsertoJSONUser } from '../models/User';
const authController = new AuthController();
const autoBind = require('auto-bind');

export default class AdminsController {

    constructor() {
        autoBind(this);
    }
    
    async create(information: BaseUser) {
        const admin = authController.create(information, UserType.admin);
        return admin;
    }

    async update(id: string, information: BaseUser) {
        return authController.update(id, UserType.admin, information);
    }

    async delete(id: string) {
        return authController.delete(id, UserType.admin);
    }

    async getAll() {
        const users = await User.find({
            type: UserType.admin
        }).exec();
        return users.map((user) => {
            return mongoUsertoJSONUser(user);
        });
    }

    async get(id: string) {
        return authController.get(id, UserType.admin);
    }

    async getByOffice(office: string) {
        const users = await User.find({
            type: UserType.admin,
            office: office
        }).exec();
        return users.map((user) => {
            return mongoUsertoJSONUser(user);
        });
    }
}
