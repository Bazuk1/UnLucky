// import { useEffect } from "react";
// import { socket } from "../utils/socketConnection";
import { Searcher } from "../components/Components";

function ItemList() {
	return (
		<div className="flex flex-col mt-[2rem] px-[2rem] flex-1 md:px-[4rem] min-w-[768px] max-w-[1800px]">
			<Searcher searchType="items" TABS={["Featured", "New"]} />
		</div>
	);
}

export default ItemList;
