import { LazyLoadImage } from "react-lazy-load-image-component";
import { IItem } from "../utils/unboxing";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
function CaseSlot({ item, slotRate }: { item: IItem; slotRate: number }) {
	return (
		<div className="relative flex select-none flex-col justify-center items-center p-1 py-6 border-2 border-shark-900 border-opacity-50 bg-black bg-opacity-10 rounded-md">
			<span className="absolute top-4 left-4 font-bold text-white opacity-50">
				{slotRate * 100}%
			</span>
			<img
				alt="Item background"
				className="item-bg"
				src={`${process.env.PUBLIC_URL}/LogoItemBG512.png`}
			/>
			<LazyLoadImage
				src={item.iconUrl}
				alt={`Item-${item.name}`}
				className="w-[90%] h-[90%] mt-3 object-contain"
			/>
			<span className="font-[Flama-Semibold] text-white mt-5 text-lg text-center">
				{item.name}
			</span>
			<div className="mt-1 flex items-center">
				<FontAwesomeIcon
					icon={faCoins}
					className="text-yellow-400 mx-2 text-xl"
				/>
				<span className="font-[Flama-Semibold] text-white text-lg text-center">
					{item.value.toFixed(2)}
				</span>
			</div>
		</div>
	);
}

export default CaseSlot;
