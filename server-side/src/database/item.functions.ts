import { isValidObjectId, Types } from "mongoose";
import { Item } from "./item.schema";

export interface IItem {
    _id?: Types.ObjectId;
    item_id: string;
    name: string;
    iconUrl: string;
    value: number;
    createdAt: string;
}

interface IItemCreate {
    name: string;
    iconUrl: string;
    value: number;
}

export async function createItem(item: IItemCreate) {
    try {
        await Item.create(item);
        return {
            status: 201,
            data: {}
        }
    } catch (e) {
        console.log("Error creating item")
        return {
            status: 500,
            data: {}
        }
    }
}

export async function fetchItemValue(item_id: Types.ObjectId | string) {
    if (item_id && isValidObjectId(item_id)) {
        try {
            const item = await Item.findById(item_id);
            if (item) {
                return parseFloat(item.value.toString())
            } else return -1
        } catch (e) {
            console.log("Error fetching item value")
            return -1
        }
    } else return -1
}

export async function fetchItemInfo(item_id: Types.ObjectId | string) {
    if (item_id && isValidObjectId(item_id)) {
        try {
            const item = await Item.findById(item_id);
            if (item) {
                const itemRes: IItem = {
                    item_id: item_id.toString(),
                    name: item.name,
                    iconUrl: item.iconUrl,
                    value: parseFloat(item.value.toString()),
                    createdAt: item.createdAt.toString(),
                }
                return { status: 200, data: { item: itemRes } }
            } else return { status: 404, data: {} }
        } catch (e) {
            console.log("Error fetching item value")
            return { status: 500, data: {} }
        }
    } else return { status: 400, data: {} }
}