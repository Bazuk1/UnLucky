import { serverSeed, publicSeed } from './../app';
import { isValidObjectId } from "mongoose";
import { Roll } from "./roll.schema";
import { IGame } from "../games/roll";
import { BetInfo } from "../socket";
import { fetchUserInfo, updateUserCoins } from "./user.functions";
import { getCombinedSeed, getRandomInt } from '../utils/seedGenerator';

const GAME = "ROLL"

export async function getNextNonce() {
    const lastDocument = await Roll.findOne({}, {}, { sort: { nonce: -1 } });
    return lastDocument ? lastDocument.nonce + 1 : 1;
}

// ✅
export async function createRollGame(nonce: number) {
    try {
        const createdAt = new Date();
        const scheduledAt = new Date(Date.now() + 15000); 
        return await Roll.create({
            createdAt: createdAt,
            scheduledAt: scheduledAt,
            nonce: nonce
        }).then((newRollGame) => {
            const rollGame: IGame = {
                id: newRollGame._id.toString(),
                createdAt: createdAt.toISOString(),
                scheduledAt: scheduledAt.toISOString(),
                status: "CREATED",
                rollValue: null
            }
            return { status: 201, data: rollGame }
        })
    } catch (e) {
        console.log("Error creating roll")
        return { status: 500, data: {} }
    }
}


// ✅
export async function fetchLastRoll() {
    try {
        const roll = await Roll.findOne().sort({ _id:-1 });
        if (roll && roll.createdAt && roll.scheduledAt) {
            return { status: 200, data: {
                id: roll._id.toString(),
                createdAt: roll.createdAt.toISOString(),
                scheduledAt: roll.scheduledAt.toISOString(),
                status: roll.status,
                rollValue: roll.rollValue,
            } }
        } else return { status: 404, data: {} }
    } catch (e) {
        console.log("Error fetching last roll")
        return { status: 500, data: {} }
    }
}

// ✅ - idk why i made this - not used
export async function fetchRollBets(roll_id: string) {
    if (roll_id && isValidObjectId(roll_id)) {
        try {
            const roll = await Roll.findById(roll_id);
            if (roll) {
                return { status: 200, data: roll.bets }
            } else return { status: 404, data: {} }
        } catch (e) {
            console.log("Error fetching roll bets")
            return { status: 500, data: {} }
        }
    } else return { status: 400, data: {} }
}

// ✅
export async function fetchRollHistory() {
    try {
        const rolls = await Roll.find({ status: "FINISHED" }).sort({ _id: -1 }).limit(100);
        if (rolls) {
            return { status: 200, data: rolls }
        } else return { status: 404, data: {} }
    } catch (e) {
        console.log("Error fetching roll history")
        return { status: 500, data: {} }
    }
}

// ✅
export async function fetchRollHistoryResults(amount: 10 | 100) {
    try {
        const rolls = await Roll.find({ status: "FINISHED" }, { rollValue: 1, _id: 0 }).sort({ _id: -1 }).limit(amount);
        if (rolls) {
            if (amount === 100) {
                var results = {
                    red: 0,
                    black: 0,
                    green: 0,
                    baitRed: 0,
                    baitBlack: 0,
                };
                rolls.forEach(roll => {
                    roll.rollValue === 7 ? results.green++ : roll.rollValue === 6 ? results.baitRed++ : roll.rollValue === 8 ? results.baitBlack++ : (roll.rollValue > 7 ? roll.rollValue - 7 : roll.rollValue) % 2 === 0 ? results.red++ : results.black++
                })
                return { status: 200, data: results }
            } else {
                var results10: string[] = []
                rolls.forEach(roll => {
                    roll.rollValue === 7 ? results10.push("green") : roll.rollValue === 6 ? results10.push("bait-red") : roll.rollValue === 8 ? results10.push("bait-black") : (roll.rollValue > 7 ? roll.rollValue - 7 : roll.rollValue) % 2 === 0 ? results10.push("red") : results10.push("black")
                })
                return { status: 200, data: results10 }
            }
        } else return { status: 404, data: {} }
    } catch (e) {
        console.log("Error fetching roll history")
        return { status: 500, data: {} }
    }
}

// ✅
export async function placeRollBet(betInfo: BetInfo, user_id: string | null) {
    const { amount, payoutMultiplier, roll_id, betType }: BetInfo = betInfo;
    if (amount && payoutMultiplier && roll_id && isValidObjectId(roll_id) && betType && user_id && isValidObjectId(user_id)) {
        try {
            const roll = await Roll.findById(roll_id);
            const user = await fetchUserInfo(user_id);
            if (roll && user.status === 200 && user.data.user) {
                const userInfo = user.data.user;
                if (parseFloat(userInfo.coins.toString()) >= amount) {
                    const newBet = {
                        roll_id: roll_id,
                        betType: betType,
                        payoutMultiplier: payoutMultiplier,
                        amount: amount
                    }
                    roll.bets.push({
                        bet: newBet,
                        user: {
                            user_id: user_id,
                            username: userInfo.username,
                            avatar: userInfo.avatar,
                            accountLvl: userInfo.accountLvl
                        },
                    });
                    await roll.save();
                    return { 
                        status: 200, 
                        data: {
                            createBet: {
                                bet: newBet,
                                user: user.data.user
                            }
                        }
                    }
                } else return { status: 401, data: {} }

            } else return { status: 404, data: {} }
        } catch (e) {
            console.log("Error placing bet")
            return { status: 500, data: {} }
        }
    } else return { status: 400, data: {} }
}

// ✅
export async function updateRollStatus(roll_id: string, newStatus: "START" | "FINISH") {
    if (roll_id && isValidObjectId(roll_id) && newStatus) {
        try {
            const roll = await Roll.findById(roll_id);
            if (roll && roll.createdAt && roll.scheduledAt) {
                var updatedRollGame: IGame = {
                    id: roll._id.toString(),
                    createdAt: roll.createdAt.toISOString(),
                    scheduledAt: roll.scheduledAt.toISOString(),
                    status: roll.status,
                    rollValue: roll.rollValue,
                };
                if (newStatus === "START" && roll.status === "CREATED") {
                    roll.status = "STARTED"
                    const seed = getCombinedSeed(GAME, serverSeed, publicSeed, roll.nonce);
                    const rollValue = getRandomInt({ max: 15, seed })
                    roll.rollValue = rollValue;
                    await roll.save();
                    updatedRollGame.status = "STARTED";
                    updatedRollGame.rollValue = roll.rollValue
                    await awardRollWinners(roll.bets, roll.rollValue)
                    console.log("ROLL", seed, rollValue);
                    return { status: 200, data: updatedRollGame }
                } else if (newStatus === "FINISH" && roll.status === "STARTED") {
                    roll.status = "FINISHED"
                    await roll.save();
                    updatedRollGame.status = "FINISHED";
                    updatedRollGame.rollValue = roll.rollValue
                    return { status: 200, data: updatedRollGame }
                }
                return { status: 304, data: updatedRollGame }
            } else return { status: 404, data: {} }
        } catch (e) {
            console.log("Error fetching roll bets")
            return { status: 500, data: {} }
        }
    } else return { status: 400, data: {} }
}

async function awardRollWinners(rollBets: any, rollValue: number) {
    const betTypeWinner = (rollValue === 7 ? "green" : rollValue === 6 ? "bait-red" : rollValue === 8 ? "bait-black" : (rollValue > 7 ? rollValue - 7 : rollValue) % 2 === 0 ? "red" : "black").split("-");
    var winners: any[] = [];
    rollBets.filter((bet: any) => bet.bet.betType === betTypeWinner[0] || bet.bet.betType === betTypeWinner[1]).forEach((bet: any) => {
        const winIdx = winners.findIndex(winner => winner.user_id === bet.user.user_id);
        if (winIdx === -1) winners.push({ user_id: bet.user.user_id, amount: bet.bet.amount*bet.bet.payoutMultiplier })
        else winners[winIdx].amount += bet.bet.amount*bet.bet.payoutMultiplier;
    })
    winners.forEach(async (winner) => {
        await updateUserCoins(winner.user_id, winner.amount);
        console.log(winner.user_id, "won", winner.amount)
    });

}