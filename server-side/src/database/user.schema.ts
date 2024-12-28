import { Schema, model } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        default: "",
    },
    password: {
        type: String,
        required: true,
    },
    coins: {
        type: Schema.Types.Decimal128,
        default: 0,
    },
    avatar: {
        type: String,
        default: "https://cdn.discordapp.com/attachments/760277548676153414/1114291184626581546/image.png"
    },
    accountLvl: {
        type: Number,
        default: 1,
    },
    key: {
        type: String,
        unique: true,
    },
    clientSeed: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});

export const User = model("User", userSchema);
