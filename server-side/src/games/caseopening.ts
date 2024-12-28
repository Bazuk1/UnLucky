import { getCombinedSeed, getRandomInt } from "../utils/seedGenerator";
import { fetchClientSeed } from "../database/user.functions";
import { ICase } from "../database/caseOpening.functions";
import { serverSeed } from "../app";
import { ISlots } from "../database/case.functions";


export const ROLL_MAX: number = 99999999;
const GAME = "CASEOPENING"



export async function openCase(user_id: string, caseToOpen: ICase, nonce: number) {
    try {
        const clientSeed = await fetchClientSeed(user_id);
        if (clientSeed.status === 200 && clientSeed.data.client_seed) {
            const seed = getCombinedSeed(GAME, serverSeed, clientSeed.data.client_seed, nonce);
            const rollValue = getRandomInt({ max: ROLL_MAX, seed })
            return rollValue;
        } else return -1;
    } catch (e) {
        console.log("Error opening case")
        return -1;
    }
}

export async function calculateUserWin(slots: ISlots[], rollValue: number) {
    try {
        for (let i = 0; i < slots.length; i++) {
            // @ts-ignore
            if (slots[i].rollStart <= rollValue && slots[i].rollEnd >= rollValue) return slots[i].item.toString();
        }
        return "null";
    } catch (e) {
        console.log("Error calculating user item win")
        return "null";
    }
}