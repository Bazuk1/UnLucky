import { isValidObjectId } from "mongoose";
import { CaseOpening } from "./caseOpening.schema";
import { Case } from "./case.schema";
import { ISlots, generateRollStream } from "./case.functions";
import { calculateUserWin, openCase } from "../games/caseopening";
import { IUser, updateUserCoins } from "./user.functions";
import { IItem, fetchItemInfo } from "./item.functions";

export interface ICase {
    name: string;
    iconUrl: string;
    price: number;
    lvlRequired: number;
    openable: boolean;
    slots: ISlots[];
}

interface IBox {
    case_id: string;
    iconUrl: string;
    name: string;
    price: number;
}

interface ICaseOpening {
    box: IBox;
    createdAt?: string | Date;
    winnings: {
        item_id: string;
        value: number;
        item: IItem;
    };
    roll: {
        value: number;
        stream: ISlots[];
    };
    user?: IUser;
}

// to do, amount > 1

export async function getNextNonce() {
    const lastDocument = await CaseOpening.findOne({}, {}, { sort: { nonce: -1 } });
    return lastDocument ? lastDocument.nonce + 1 : 1;
}

export async function playCaseOpening({ case_id, amount } : { case_id: string, amount: number }, user_id: string | null) {
    if (case_id && isValidObjectId(case_id) && user_id && isValidObjectId(user_id)) {
        try {
            const fetchedCase: ICase | null = await Case.findById(case_id);
            if (fetchedCase) {
                const updatedUserCoins = await updateUserCoins(user_id, -(fetchedCase.price*amount));
                if (updatedUserCoins.status === 200) {
                    const nonce = await getNextNonce();
                    const openCaseResult = await openCase(user_id, fetchedCase, nonce);
                    if (openCaseResult !== -1) {
                        // Opened Case
                        const itemIdWon = await calculateUserWin(fetchedCase.slots, openCaseResult);
                        if (itemIdWon !== "null") {
                            const caseOpeningGame = new CaseOpening({
                                case: case_id,
                                user: user_id,
                                itemWon: itemIdWon,
                                nonce: nonce,
                                roll: openCaseResult
                            })
                            const itemWon = await fetchItemInfo(itemIdWon);
                            const itemStream = await generateRollStream(case_id);
                            if (itemWon.status === 200 && itemWon.data.item && itemStream.status === 200 && itemStream.data.itemsPos) {
                                const gameRes: ICaseOpening = {
                                    box: {
                                        case_id: case_id,
                                        name: fetchedCase.name,
                                        iconUrl: fetchedCase.iconUrl,
                                        price: fetchedCase.price
                                    },
                                    winnings: {
                                        item_id: itemIdWon,
                                        value: itemWon.data.item.value,
                                        item: itemWon.data.item
                                    },
                                    roll: {
                                        stream: itemStream.data.itemsPos,
                                        value: openCaseResult
                                    },
                                }
                                await caseOpeningGame.save();
                                return {
                                    status: 200,
                                    data: { 
                                        newUserCoins: updatedUserCoins.data.coins,
                                        game: gameRes
                                    }
                                }
                            } else return { status: 500, data: {} }
                        } else return { status: 500, data: {} }
                    }
                } else return { status: 401, data: {} }
            } else return { status: 404, data: {} }
        } catch (e) {
            console.log(e)
            console.log("Error at playing case opening solo")
            return { status: 500, data: {} }
        }
    } else return { status: 400, data: {} }
    
}