import { Decimal128 } from 'mongodb';
import { isValidObjectId } from "mongoose";
import { User } from "./user.schema"
import { compare, hash } from "bcrypt"
import { v4 } from "uuid";
import { generateClientSeed } from '../utils/seedGenerator';

//    password: "$2y$04$ZWUvXOjkCZLuPrRDnFt5d.e9urilbzM3q2hO6XJS9Nb1eC3gCKTD2"

export interface IUser {
    user_id: string;
    username: string;
    avatar: string;
    accountLvl: number;
    createdAt?: string | Date;
}

var validateEmail = function(email: string) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

export async function createUser(username: string, password: string) {
    const user = new User({
        username: username,
        password: await hash(password, 8),
    })
    user.clientSeed = generateClientSeed(user._id.toString());
    User.create(user);
}

export async function loginUser(credentials: { username: string, password: string }) {
    if (credentials && credentials.username && credentials.password) {
        try {
            const user = await User.findOne({ username: credentials.username })
            if (user) {
                if (await compare(credentials.password, user.password)) {
                    const key = v4()
                    user.key = key;
                    user.save();
                    return { status: 200, data: { user_id: user._id.toString(), key: key } }
                } else return { status: 401, data: {} }
            } else return { status: 404, data: {} }
        } catch (e) {
            console.log("Error login user")
            return { status: 500, data: {} }
        }
    } else return { status: 400, data: {} }
}

export async function checkKey(decodedRef: { key: string, user_id: string}) {
    if (decodedRef.key && decodedRef.key && decodedRef.user_id && isValidObjectId(decodedRef.user_id)) {
        try {
            const user = await User.findById(decodedRef.user_id)
            if (user) {
                if (user.key === decodedRef.key) return { status: 200, data: { user_id: user._id.toString() } }
                else return { status: 401, data: {} }
            } else return { status: 404, data: {} }
        } catch (e) {
            console.log("Error checking key")
            return { status: 500, data: {} }
        }
    } else return { status: 400, data: {} }
}

export async function fetchUserInfo(user_id: string) {
    if (user_id && isValidObjectId(user_id)) {
        try {
            const user = await User.findById(user_id)
            if (user) {
                return {
                    status: 200,
                    data: {
                        user: {
                            user_id: user_id,
                            username: user.username,
                            email: user.email,
                            avatar: user.avatar,
                            accountLvl: user.accountLvl,
                            coins: parseFloat(user.coins.toString()),
                            createdAt: user.createdAt.toISOString()
                        }
                    }
                }
            } else return { status: 404, data: {} }
        } catch (e) {
            console.log("Error fetching user info")
            return { status: 500, data: {} }
        }
    } else return { status: 400, data: {} }
}

export async function fetchUserCoins(user_id: string) {
    if (user_id && isValidObjectId(user_id)) {
        try {
            const user = await User.findById(user_id)
            if (user) {
                return {
                    status: 200,
                    data: {
                        coins: parseFloat(user.coins.toString()),
                    }
                }
            } else return { status: 404, data: {} }
        } catch (e) {
            console.log("Error fetching user coins")
            return { status: 500, data: {} }
        }
    } else return { status: 400, data: {} }
}

export async function updateUserCoins(user_id: string | null, amount: number) {
    if (user_id && isValidObjectId(user_id) && amount) {
        try {
            const user = await User.findById(user_id)
            if (user) {
                if (amount > 0 || parseFloat(user.coins.toString()) >= amount) {
                    const newCoinsAmount = parseFloat(user.coins.toString()) + amount;
                    user.coins = Decimal128.fromString(newCoinsAmount.toFixed(2));
                    user.save();
                    return {
                        status: 200,
                        data: {
                            coins: newCoinsAmount,
                        }
                    }
                } else return { status: 401, data: {} }
            } else return { status: 404, data: {} }
        } catch (e) {
            console.log("Error fetching user coins")
            return { status: 500, data: {} }
        }
    } else return { status: 400, data: {} }
}

export async function updateUserInfo(info_type: string, newValue: string, user_id: string) {
    // info_type: "EMAIL" | "USERNAME" | "PASSWORD" | "CLIENT_SEED"
    if (user_id && isValidObjectId(user_id) && info_type && newValue) {
        try {
            const user = await User.findById(user_id)
            if (user) {
                if (info_type === "EMAIL" && validateEmail(newValue)) {
                    user.email = newValue;
                    user.save();
                    return {
                        status: 200,
                        data: {
                            email: newValue,
                        }
                    }
                } else if (info_type === "USERNAME" && newValue.length > 0 && newValue.length < 17) {
                    user.username = newValue;
                    user.save();
                    return {
                        status: 200,
                        data: {
                            username: newValue,
                        }
                    }
                } else if (info_type === "PASSWORD" && newValue.length > 8 && newValue.length < 33) {
                    user.password = await hash(newValue, 8);
                    user.save();
                    return {
                        status: 200,
                        data: {
                            password: "********"
                        }
                    }
                } else if (info_type === "CLIENT_SEED" && newValue.length > 0) {
                    user.clientSeed = generateClientSeed(newValue);
                    user.save();
                    return {
                        status: 200,
                        data: {
                            client_seed: "********"
                        }
                    }
                } else return { status: 401, data: {} }
            } else return { status: 404, data: {} }
        } catch (e) {
            console.log("Error fetching user coins")
            return { status: 500, data: {} }
        }
    } else return { status: 400, data: {} }
}

export async function fetchPublicUserInfo(user_id: string) {
    if (user_id && isValidObjectId(user_id)) {
        try {
            const user = await User.findById(user_id)
            if (user) {
                return {
                    status: 200,
                    data: {
                        user: {
                            user_id: user_id,
                            username: user.username,
                            avatar: user.avatar,
                            accountLvl: user.accountLvl,
                            createdAt: user.createdAt.toISOString()
                        }
                    }
                }
            } else return { status: 404, data: {} }
        } catch (e) {
            console.log("Error fetching public user info")
            return { status: 500, data: {} }
        }
    } else return { status: 400, data: {} }
}

export async function fetchClientSeed(user_id: string) {
    if (user_id && isValidObjectId(user_id)) {
        try {
            const user = await User.findById(user_id)
            if (user) {
                return {
                    status: 200,
                    data: {
                        client_seed: user.clientSeed,
                    }
                }
            } else return { status: 404, data: {} }
        } catch (e) {
            console.log("Error fetching client seed")
            return { status: 500, data: {} }
        }
    } else return { status: 400, data: {} }
}