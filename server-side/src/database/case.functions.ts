import {  isValidObjectId, Types } from "mongoose";
import { Case } from "./case.schema";
import { IItem, fetchItemValue } from "./item.functions";
import { ROLL_MAX } from "../games/caseopening";

const SLOT_COUNT: number = 30;


export interface ISlots {
    rollStart: number;
    rollEnd: number;
    item: IItem;
}

export interface ISlots_DB extends ISlots {
    idx: number;
    rate: number | Types.Decimal128;
}

interface ISlotsCreate {
    idx: number;
    rate: number;
    rollStart?: number;
    rollEnd?: number;
    item: string;
}

// Ready for testing
async function calculateCasePrice(slots: ISlotsCreate[]) {
    var totalPrice = 0;
    for (let i = 0; i < slots.length; i++) {
        // @ts-ignore
        const itemValue = await fetchItemValue(slots[i].item);
        totalPrice += parseFloat(slots[i].rate.toString()) * itemValue + 0.04;
    }
    return parseFloat(totalPrice.toFixed(2));
}

function shuffleArray(array: ISlots[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


async function calculateItemsPos(slots: ISlots_DB[]) {
    const itemsOrder: ISlots[] = []
    slots.forEach((slot) => {
        const rate = parseFloat(slot.rate.toString());
        const numItems = Math.round(SLOT_COUNT * rate);
        itemsOrder.push(...Array(numItems < 1 ? 1 : numItems).fill({
            rollStart: slot.rollStart,
            rollEnd: slot.rollEnd,
            item: {
                item_id: slot.item._id ? slot.item._id.toString() : "",
                name: slot.item.name,
                iconUrl: slot.item.iconUrl,
                value: parseFloat(slot.item.value.toString()),
                createdAt: slot.item.createdAt,
            }
        }));
    });
      
    while (itemsOrder.length < SLOT_COUNT) {
        const randomItem = slots[Math.floor(Math.random() * slots.length)];
        itemsOrder.push({
            rollStart: randomItem.rollStart,
            rollEnd: randomItem.rollEnd,
            item: {
                item_id: randomItem.item._id ? randomItem.item._id.toString() : "",
                name: randomItem.item.name,
                iconUrl: randomItem.item.iconUrl,
                value: parseFloat(randomItem.item.value.toString()),
                createdAt: randomItem.item.createdAt,
            },
        });
    }

    return shuffleArray(itemsOrder);
}

async function generateRollSlots(slots: ISlotsCreate[]) {
    var resultSlots: ISlotsCreate[] = [];
    var sum = 0;
    for (let i = 0; i < slots.length; i++) {
        resultSlots.push({
            idx: i,
            rate: slots[i].rate,
            rollStart: sum,
            rollEnd: sum += Math.round((parseFloat(slots[i].rate.toString()) * ROLL_MAX)),
            item: slots[i].item
        })
    }
    return resultSlots;
}

export async function createCase(props: { name: string, iconUrl: string }, slots: ISlotsCreate[]) {
    const { name, iconUrl } = props;
    const price: number = await calculateCasePrice(slots);
    const caseSlots: ISlotsCreate[] = await generateRollSlots(slots);
    const newCase = new Case({ name: name, iconUrl: iconUrl, price: price, slots: caseSlots })
    newCase.save();
}

export async function fetchCaseInfo(case_id: Types.ObjectId | string) {
    if (case_id && isValidObjectId(case_id)) {
        try {
            const fetchedCase = await Case.findById(case_id).populate("slots.item");
            if (fetchedCase) {
                var caseSlots: ISlots_DB[] | never = [];
                for (let i = 0; i < fetchedCase.slots.length; i++) {
                    caseSlots.push({
                        idx: i,
                        rate: parseFloat(fetchedCase.slots[i].rate.toString()),
                        rollStart: fetchedCase.slots[i].rollStart,
                        rollEnd: fetchedCase.slots[i].rollEnd, // @ts-ignore
                        item: {
                            item_id: fetchedCase.slots[i].item._id.toString(), // @ts-ignore
                            name: fetchedCase.slots[i].item.name, // @ts-ignore
                            iconUrl: fetchedCase.slots[i].item.iconUrl, // @ts-ignore
                            value: parseFloat(fetchedCase.slots[i].item.value.toString()),// @ts-ignore
                            createdAt: fetchedCase.slots[i].item.createdAt
                        },
                    });
                }
                return {
                    status: 200,
                    data: {
                        case: {
                            case_id: fetchedCase._id.toString(),
                            price: parseFloat(fetchedCase.price.toString()),
                            name: fetchedCase.name,
                            iconUrl: fetchedCase.iconUrl,
                            lvlRequired: fetchedCase.lvlRequired,
                            openable: fetchedCase.openable,
                            slots: caseSlots,
                        }
                    }
                }
            } else {
                return {
                    status: 404,
                    data: {}
                }
            }
        } catch (e) {
            console.log("Error fetching case slots")
            return {
                status: 500,
                data: {}
            }
        }
    } else return { status: 400, data: {} }
}

export async function generateRollStream(case_id: Types.ObjectId | string) {
    if (case_id && isValidObjectId(case_id)) {
        try {
            const fetchedCase: { slots: ISlots_DB[] } | null = await Case.findById(case_id).populate("slots.item");
            if (fetchedCase) {
                const itemsPos = await calculateItemsPos(fetchedCase.slots);
                return {
                    status: 200,
                    data: {
                        itemsPos
                    }
                }
            } else {
                return {
                    status: 404,
                    data: {}
                }
            }
        } catch (e) {
            console.log("Error fetching case slots")
            console.log(e)
            return {
                status: 500,
                data: {}
            }
        }
    } else return { status: 400, data: {} }
}
