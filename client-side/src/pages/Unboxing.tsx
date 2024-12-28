import { useContext, useEffect, useMemo, useState } from "react";
import { socket } from "../utils/socketConnection";
import { useNavigate, useParams } from "react-router-dom";
import {
	ICaseSlots,
	ICase,
	IRollStream,
	loadCaseView,
	loadCaseRollStream,
	IItem,
} from "../utils/unboxing";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CaseSlot from "../components/CaseSlot";
import { GlobalContext } from "../App";

function Unboxing() {
	const { user } = useContext(GlobalContext);
	const { case_id } = useParams();
	const navigate = useNavigate();
	const [caseView, setCaseView] = useState<ICase | null>(null);
	const [caseSlots, setCaseSlots] = useState<ICaseSlots[]>([]);
	const [rollStream, setRollStream] = useState<IRollStream[]>([]);
	const [amountToOpen, setAmountToOpen] = useState<number>(1);

	const [animation, setAnimation] = useState<boolean>(false);
	const [showIndicator, setShowIndicator] = useState<boolean>(true);
	const [position, setPosition] = useState(-1470);

	const [finished, setFinished] = useState<boolean>(false);

	const handleCaseLoading = async (id: string) => {
		const caseInfo = await loadCaseView(id);
		if (caseInfo && caseInfo.slots) {
			setCaseView({
				...caseInfo,
				slots: undefined,
			});
			setCaseSlots(caseInfo.slots.sort((a, b) => a.rate - b.rate));
		} else {
			console.log("NO case");
			// Alert box, case not found
			navigate("/unboxing/list");
		}
	};

	const handleRollStreamLoading = async (id: string) => {
		const rollStream = await loadCaseRollStream(id);
		if (rollStream) {
			setRollStream(rollStream);
		} else {
			console.log("NO roll stream");
			// Alert box, case not found
			navigate("/unboxing/list");
		}
	};

	useEffect(() => {
		socket.on("updateCaseOpening", (res) => {
			setRollStream(res.data.roll.stream);
			// console.log(res.data)
			// console.log("Estimated position:", -3480 - (res.data.roll.winningSlot-1) - ((res.data.roll.winningSlot - 16) * 2 * 32) - (res.data.roll.winningSlot - 15) * 165 - 80, "px")
			setTimeout(() => {
				setAnimation(true);
				setPosition(
					-10500 -
						(res.data.roll.winningSlot - 1) -
						(res.data.roll.winningSlot - 16) * 2 * 32 -
						(res.data.roll.winningSlot - 15) * 165 -
						80
				);
			}, 10);
			setTimeout(() => {
				setFinished(true);
				const winningSlot = document.getElementById(
					`itemSlot-${res.data.roll.winningSlot}`
				);
				winningSlot?.setAttribute(
					"class",
					"unboxing-item roll-item relative duration-300 transition-all mx-8 focused"
				);
				setTimeout(() => {
					setFinished(false);
					winningSlot?.removeAttribute("style");
				}, 2000);
			}, 6000);
		});
		return () => {
			socket.removeAllListeners("updateCaseOpening");
		};
	}, [socket]);

	useEffect(() => {
		handleCaseLoading(case_id ? case_id : "");
		handleRollStreamLoading(case_id ? case_id : "");
	}, []);

	const ItemSlot = ({
		item,
		idx,
		dup,
	}: {
		item: IItem;
		idx: number;
		dup: boolean;
	}) => {
		return (
			<div
				id={`itemSlot-${idx}${dup ? "-dup" : ""}`}
				className="unboxing-item roll-item relative duration-300 transition-all mx-8">
				<div
					className={`text-4xl mx-[0.1rem] w-[160px] h-[140px] overflow-hidden text-center leading-[120px] flex rounded-md`}>
					<img
						className="slot-item-bg"
						src={`${process.env.PUBLIC_URL}/LogoItemBG512.png`}
					/>
					<img
						src={item.iconUrl}
						alt={`Item-${item.name}`}
						className="object-fill select-none w-[100%]"
					/>
				</div>
			</div>
		);
	};

	const PrintRollStream = () => {
		var items = [];
		if (rollStream.length >= 30) {
			for (let i = 0; i < 31; i++) {
				items.push(
					<ItemSlot
						key={`itemSlot-${i}-dup`}
						idx={i}
						item={rollStream[i].item}
						dup={true}
					/>
				);
			}
			for (let i = 0; i < 31; i++) {
				items.push(
					<ItemSlot
						key={`itemSlot-${i}`}
						idx={i}
						item={rollStream[i].item}
						dup={false}
					/>
				);
			}
		}
		return items;
	};

	const handleOpenCase = () => {
		// check if user has enough coins to open the case
		if (caseView && caseView.price <= user.userInfo.coins) {
			setAnimation(false);
			setPosition(-1470);
			socket.emit("createCaseOpening", {
				type: "createCaseOpening",
				data: {
					game: "CaseOpening",
					caseOpeningGame: {
						case_id: case_id,
						amount: 1,
					},
				},
			});
		}
	};

	useEffect(() => {
		var animationDuration = setTimeout(() => setAnimation(false), 8500);
		return () => clearTimeout(animationDuration);
	}, [animation]);

	return (
		<div className="w-full p-8">
			<div className="grid grid-rows-2 grid-cols-4 grid-flow-col gap-6 mt-10 min-w-full">
				<div
					className={`flex items-center p-6 bg-shark-800 case-container min-w-full col-span-2 transition-opacity md:col-span-3${
						animation ? " opacity-70 pointer-events-none" : ""
					}`}>
					{/* <div>Back</div> */}
					<LazyLoadImage
						src={caseView?.iconUrl}
						alt={`Case-${caseView?.name}`}
						className="w-[250px] h-[250px] m-4"
					/>
					<div className="self-start mt-12 flex flex-col ml-4">
						<h5 className="uppercase text-white text-4xl my-4">
							{caseView?.name}
						</h5>
						{/* <div>Amount to open</div> */}
						<button
							onClick={handleOpenCase}
							className="uppercase text-white text-[18px] shadow-green bg-[#00c74d] p-5 px-7 rounded-xl self-end hover:translate-y-[-2px] mt-2">
							<span className="font-bold font-[Flama-Bold]">
								open {amountToOpen} Time
							</span>
							<FontAwesomeIcon
								icon={faCoins}
								className="text-yellow-400 ml-2 mr-1"
							/>
							<span className="font-bold font-[Flama-Bold]">
								{caseView?.price.toFixed(2)}
							</span>
						</button>
					</div>
				</div>
				<div className="case-container flex items-center p-6 col-span-2 md:col-span-3">
					<div
						className={`relative rounded-xl bg-shark-900 bg-opacity-50 py-8 transition-[filter] overflow-x-hidden mx-[11rem] min-[700px]:mx-0${
							animation ? " brightness-roll-items" : ""
						}`}>
						<div className="max-w-full shadow-border">
							{/* roll stream */}
							{/* <div className={`indicator transition-opacity ${showIndicator ? "opacity-100" : "opacity-0"}`}></div> */}
							<div
								className={`flex relative left-1/2${
									animation ? " case-roll-transition" : ""
								}${finished ? " finished" : ""}`}
								style={{ transform: `translate3d(${position}px, 0px, 0px)` }}>
								{useMemo(() => PrintRollStream(), [rollStream])}
							</div>
						</div>
					</div>
				</div>
				<div className="row-span-2 case-container p-4 max-h-[700px] overflow-y-auto">
					<h5 className="uppercase text-white text-2xl m-4">In This Case</h5>
					<div className="grid grid-cols-2 gap-2">
						{caseSlots.map((slot) => {
							return (
								<CaseSlot
									key={`slot-${slot.idx}`}
									slotRate={slot.rate}
									item={slot.item}
								/>
							);
						})}
					</div>
				</div>
			</div>
			<div className="w-full bg-shark-800 case-container my-5 h-20"></div>
		</div>
	);
}

export default Unboxing;
