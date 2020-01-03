import * as jwt from 'jsonwebtoken';
import * as argon2 from "argon2";
import User, { MongoUser, BaseUser, UserType, JSONUser, mongoUsertoJSONUser } from '../models/User';
import { NextFunction, Response, Request } from 'express';
const autoBind = require('auto-bind');

const API_SECRET = 'SYJ)<u6nNnuzGq%kA]l[MsqX7?"=t)';
const API_SECRET_REFRESH = 'SHv12:b7HI~q4fl,B+UN`hlVsB%Kd4';

// Sign up keys
const SUPER_ADMIN_KEY = '{zmb<qlMS[u]}3nYAo0+LAR"$57Iu}';
const ADMIN_KEY = '7A[pGy^KK]RA>,U~:3bLFq5^Rd%DHCU7';

export interface TokenPayload {
    email: string,
    type: UserType,
    id: string
}

export default class AuthController {

    constructor() {
        autoBind(this);
    }

    // MARK: - Creators

    async signUp(information: BaseUser, password: string, key: string) {

        const getType: (key: String) => UserType = (key) => {
            switch (key) {
                case SUPER_ADMIN_KEY: return UserType.superadmin;
                case ADMIN_KEY: return UserType.admin;
                default: return UserType.client;
            }
        }

        const hashedPassword = await argon2.hash(password);
        const userType = getType(key)
        const user = await User.create({
            ...information,
            password: hashedPassword,
            type: userType,
            introductionDone: false,
            tutorialDone: false
        });
        const tokens = await this.generateTokens(user.email, user.type, user._id);
        return this.generateDataResponse(tokens, mongoUsertoJSONUser(user));
    }

    async signIn(email: string, password: string) {
        const user = await this.getByEmail(email, true);
        const correct = await this.checkPassword(user, password);
        if (correct) {
            const tokens = await this.generateTokens(user.email, user.type, user._id);
            return this.generateDataResponse(tokens, mongoUsertoJSONUser(user));
        } else {
            throw Error('Wrong credentials');
        }
    }

    // MARK: - Queries

    async create(information: BaseUser, type: UserType) {

        function generatePassword() {
            var length = 8,
                charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                retVal = "";
            for (var i = 0, n = charset.length; i < length; ++i) {
                retVal += charset.charAt(Math.floor(Math.random() * n));
            }
            return retVal;
        }

        let password = generatePassword();
        const hashedPassword = await argon2.hash(password);
        const user = await User.create({
            ...information,
            type: type,
            password: hashedPassword
        });

        // TODO: send password by email
        return mongoUsertoJSONUser(user);
    }

    async get(id: string, type: UserType) {
        const user = await User.findById(id).exec();
        if (type !== user.type) {
            throw Error('The current user is not allowed to perform this action.');
        }
        return mongoUsertoJSONUser(user);
    }

    async getBySession(id: string) {
        const user = await User.findById(id).exec();
        return user;
    }

    async getByEmail(email: string, includePassword = false) {
        let query = User.findOne({
            email: email
        });
        if (!includePassword) query.select('-password');
        return query.exec();
    }

    async delete(id: string, type: UserType) {
        const user = await User.findById(id).exec();
        if (user.type === type) {
            await user.remove();
        } else {
            throw Error('The current user is not allowed to perform this action.');
        }
    }

    async update(id: string, type: UserType, information: BaseUser) {
        var user = await User.findById(id).exec();
        if (user.type === type) {
            user = await User.findByIdAndUpdate(id, information, { new: true }).exec();
            return mongoUsertoJSONUser(user);
        } else {
            throw Error('The current user is not allowed to perform this action.');
        }
    }

    // MARK: - Helpers

    generateDataResponse(tokens: Object, user: JSONUser) {
        return {
            ...tokens,
            user: user
        };
    }

    // MARK: - Credentials Verification

    async verifyIfTokenIsValidForType(req: Request, types: Array<UserType>) {
        return this.getTokenFromRequest(req)
        .then((token) => {
            return this.verifyToken(token);
        })
        .then((token) => {
            const decoded: any = jwt.decode(token);
            if (types.includes(decoded.type)) {
                return decoded;
            } else {
                throw Error('The user does not have enough permissions to perform this action.');
            }
        });
    }

    async verifyIfTokenIsValidForIdAndType(req: Request, id: string, types: Array<UserType>) {
        return this.verifyIfTokenIsValidForType(req, types).then((decoded) => {
            if (decoded.id === id) {
                return;
            } else {
                throw Error('The user does not have enough permissions to perform this action.');
            }
        });
    }

    async checkToken(req: Request, res: Response, next: NextFunction, types: Array<UserType>) {
        return this.verifyIfTokenIsValidForType(req, types).then(() => {
            next();
        });
    }

    async checkClientToken(req: Request, res: Response, next: NextFunction) {
        return this.checkToken(req, res, next, [UserType.client, UserType.admin, UserType.superadmin]);
    }

    async checkAdminToken(req: Request, res: Response, next: NextFunction) {
        return this.checkToken(req, res, next, [UserType.admin, UserType.superadmin]);
    }

    async checkSuperAdminToken(req: Request, res: Response, next: NextFunction) {
        return this.checkToken(req, res, next, [UserType.superadmin]);
    }

    async checkPassword(user: MongoUser, password: string) {
        return argon2.verify(user.password, password)
    }

    // MARK: - Request manipulation

    getBaseUserFromRequest(req: Request) {
        const jsonUser: BaseUser = {
            name: req.body.name,
            lastname: req.body.lastname,
            email: req.body.email,
            apodo: req.body.apodo,
            sexo: req.body.sexo,
            empresa: req.body.empresa,
            edad: req.body.edad,
            type: req.body.type,
            introductionDone: req.body.introductionDone,
            tutorialDone: req.body.tutorialDone,
            conflicto: req.body.conflicto,
            persona: req.body.persona
        }
        return jsonUser;
    }

    async getNormalizedToken(token: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (token === null || token === undefined) {
                reject(Error('Auth token is not supplied'));
            } else if (token.startsWith('Bearer ')) {
                token = token.slice(7, token.length); // Remove Bearer from string
            }

            if (token.length > 7) {
                resolve(token);
            } else {
                reject(Error('Auth token is not complete'));
            }
        });
    }

    async getTokenFromRequest(req: Request): Promise<string> {
        let token = req.body.token || req.headers['x-access-token'] || req.headers['authorization'] || req.params.token;
        return this.getNormalizedToken(token);
    }

    getRefreshTokenFromRequest(req: Request): Promise<string> {
        let refreshToken = req.body.refreshToken || req.headers['x-refresh-token'] || req.headers['authorization-refresh'] || req.params.refreshToken;
        return this.getNormalizedToken(refreshToken);
    }

    // MARK: - Token Verification

    async verifyToken(token: string): Promise<string> {
        return this.verifyAnyToken(token, API_SECRET);
    }

    async verifyRefreshToken(token: string): Promise<string> {
        return this.verifyAnyToken(token, API_SECRET_REFRESH);
    } 

    async verifyAnyToken(token: string, secret: string): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(token);
                }
            });
        });
    };

    // MARK: - Token Generation

    generateToken(email: string, type: UserType, id: string) {
        const payload: TokenPayload = {
            email: email,
            type: type,
            id: id
        };
        const tokenDuration = '7d';
        return jwt.sign(payload, API_SECRET,
        {
            expiresIn: tokenDuration
        });
    }

    generateRefreshToken(email: string, type: UserType, id: string) {
        const payload: TokenPayload = {
            email: email,
            type: type,
            id: id
        };
        const tokenDuration = '30d';
        const token = jwt.sign(payload, API_SECRET_REFRESH,
        {
            expiresIn: tokenDuration
        });
        return token
    }

    async generateTokens(email: string, type: UserType, id: string) {
        return {
            token: this.generateToken(email, type, id),
            refreshToken: this.generateRefreshToken(email, type, id)
        };
    }
}
