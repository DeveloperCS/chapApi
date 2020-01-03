import mongoose, { Schema, Document } from 'mongoose';

export enum UserType {
    client = 'client',
    admin = 'admin',
    superadmin ='superadmin'
}

export const mongoUsertoJSONUser = (user: MongoUser) => {
    const jsonUser: JSONUser = {
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        apodo: user.apodo,
        sexo: user.sexo,
        empresa: user.empresa,
        edad: user.edad,
        email: user.email,
        type: user.type,
        introductionDone: user.introductionDone,
        tutorialDone: user.tutorialDone,
        conflicto: user.conflicto,
        persona: user.persona
    }
    return jsonUser
}

export interface BaseUser {
    name: string
    lastname: string
    apodo: string
    sexo: string
    empresa: string
    edad: number
    email: string
    type: UserType
    conflicto: string
    introductionDone: Boolean
    tutorialDone: Boolean
    persona: string
}

export interface JSONUser extends BaseUser {
    id: string
}

export interface MongoUser extends Document, BaseUser {
    password: string
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    apodo: String,
    sexo: String,
    empresa: String,
    edad: Number,
    email: { type: String, unique: true, required: true, dropDups: true },
    password: String,
    type: { type: String, required: true },
    conflicto: String,
    persona: String
});

export default mongoose.model<MongoUser>('User', UserSchema);