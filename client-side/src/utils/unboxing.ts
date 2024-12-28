import { DefaultInstance } from "./serverConnection";

export interface IItem {
	item_id: string;
	name: string;
	iconUrl: string;
	value: number;
	createdAt: string;
}

export interface ICaseSlots {
	idx: number;
	rate: number;
	rollStart: number;
	rollEnd: number;
	item: IItem;
}

export interface ICase {
	case_id: string;
	name: string;
	iconUrl: string;
	lvlRequired: number;
	price: number;
	openable: boolean;
	slots?: ICaseSlots[];
}

export interface IRollStream {
	rollStart: number;
	rollEnd: number;
	item: IItem;
}

export async function loadCaseView(case_id: string) {
	return DefaultInstance.get(`/unboxing/${case_id}/view`)
		.then((response: { status: number; data: { case: ICase } }) => {
			if (response.status === 200) return response.data.case;
			return null;
		})
		.catch((error) => {
			console.error(error);
			return null;
		});
}

export async function loadCaseRollStream(case_id: string) {
	return DefaultInstance.get(`/unboxing/${case_id}/roll-stream`)
		.then((response: { status: number; data: { itemsPos: IRollStream[] } }) => {
			if (response.status === 200) return response.data.itemsPos;
			return [];
		})
		.catch((error) => {
			console.error(error);
			return [];
		});
}

export async function loadCaseHistory(case_id: string) {
	// Coming soon..
}
