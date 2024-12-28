import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faPizzaSlice,
	faIceCream,
	faCow,
	faCoins,
	faHamburger,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../App";
import { socket } from "../utils/socketConnection";
import {
	subscribeRoll,
	DefaultInstance,
	placeBet,
} from "../utils/serverConnection";
import { ValueBetBtn, AvatarUser } from "../components/Components";

// 105 icons, type: red, black, green

interface BetInfo {
	betType: string;
	amount: number;
	user: {
		user_id: string;
		username: string;
		avatar: string;
		accountLvl: number;
	};
}

interface RollInfo {
	id: string;
	createdAt: string;
	scheduledAt: string;
	status: string | "CREATED" | "FINISHED" | "STARTED";
	rollValue: number | null;
}

// these are from server
const BET_TABLE = [
	[-4995, -5030],
	[-5070, -5105],
	[-5145, -5180],
	[-5215, -5250],
	[-5290, -5325],
	[-5360, -5400],
	[-5435, -5470],
	[-5510, -5545],
	[-5580, -5620],
	[-5650, -5690],
	[-5730, -5760],
	[-5800, -5840],
	[-5870, -5910],
	[-5950, -5990],
	[-6020, -6060],
];
const TIMER = 15000;

function Roll() {
	const [position, setPosition] = useState(-840);

	const [startingIn, setStartingIn] = useState<number>(TIMER);
	const [animation, setAnimation] = useState<boolean>(false);

	const [showIndicator, setShowIndicator] = useState<boolean>(true);

	const [betAmount, setBetAmount] = useState<string>("1");

	const [betList, setBetList] = useState<BetInfo[]>([]);
	const [betTotal, setBetTotal] = useState<number[]>([0, 0, 0, 0]);
	// red - 0 | green - 1 | black - 2 | bait - 3
	const [rollInfo, setRollInfo] = useState<RollInfo>({
		id: "-1",
		createdAt: "-1",
		rollValue: null,
		scheduledAt: "-1",
		status: "TEMP",
	});
	const [rollWinner, setRollWinner] = useState<
		"RED" | "GREEN" | "BLACK" | "BAIT-RED" | "BAIT-BLACK" | null
	>(null);

	const [rollHistory100, setRollHistory100] = useState<{
		red: number;
		green: number;
		black: number;
		baitRed: number;
		baitBlack: number;
	}>({
		red: 0,
		green: 0,
		black: 0,
		baitRed: 0,
		baitBlack: 0,
	});

	const [rollHistory10, setRollHistory10] = useState<
		["red" | "green" | "black" | "bait-red" | "bait-black"] | []
	>([]);

	const [betTimeout, setBetTimeout] = useState<boolean>(true);

	const { user, alert, audio } = useContext(GlobalContext);

	function playRoll() {
		if (!audio.isMuted)
			new Audio(`${process.env.PUBLIC_URL}/sounds/open_box.mp3`).play();
	}

	function endRoll() {
		// todo: change this sound
		// if (!audio.isMuted) new Audio(`${process.env.PUBLIC_URL}/sounds/win_01.mp3`).play()
	}

	function initBets() {
		setBetList([]);
		setBetTotal([0, 0, 0, 0]);
		setRollWinner(null);
	}

	function betRoll(betType: string) {
		if (betTimeout) alert.setAlertCode("timeout");
		else if (!user.isLoggedIn) alert.setAlertCode("needtologin");
		else {
			if (parseFloat(betAmount) <= 0) {
				setBetTimeout(false);
				alert.setAlertCode("bet_failed_coins");
			} else if (user.coins >= parseFloat(betAmount)) {
				setBetTimeout(true);
				// betType - red/green/black
				// send socket request to the server for betting
				const isEligible = true;
				if (isEligible) {
					// the server will send accept response only, the client will be added to the list from other section of the code
					alert.setAlertCode("bet_success");
					if (!audio.isMuted)
						new Audio(
							`${process.env.PUBLIC_URL}/sounds/roulette_bet.mp3`
						).play();
					placeBet(rollInfo.id, parseFloat(betAmount), betType);
				} else {
					alert.setAlertCode("error");
				}
			} else {
				alert.setAlertCode("bet_failed_coins");
			}
		}
	}

	function updateRollHistory() {
		DefaultInstance.get("/roll/history/100/results")
			.then((response) => {
				if (response.status === 200) {
					setRollHistory100(response.data);
				}
			})
			.catch((error) => {
				console.error(error);
			});

		DefaultInstance.get("/roll/history/10/results")
			.then((response) => {
				if (response.status === 200) {
					setRollHistory10(response.data);
				}
			})
			.catch((error) => {
				console.error(error);
			});
	}

	useEffect(() => {
		DefaultInstance.get("/roll/last")
			.then((response) => {
				if (response.status === 200) {
					setRollInfo(response.data);
					updateRollHistory();
					setStartingIn(
						new Date(response.data.scheduledAt).getTime() - Date.now()
					);
					DefaultInstance.get(`/roll/${response.data.id}/bets`)
						.then((response) => {
							if (response.status === 200) {
								response.data.forEach((betData: any) => {
									const betInfo = betData.bet;
									setBetList((prevState) => [
										...prevState,
										{
											betType: betInfo.betType,
											amount: betInfo.amount,
											user: betData.user,
										},
									]);
									if (betInfo.betType === "red")
										setBetTotal((prevState) => [
											prevState[0] + betInfo.amount,
											prevState[1],
											prevState[2],
											prevState[3],
										]);
									else if (betInfo.betType === "green")
										setBetTotal((prevState) => [
											prevState[0],
											prevState[1] + betInfo.amount,
											prevState[2],
											prevState[3],
										]);
									else if (betInfo.betType === "black")
										setBetTotal((prevState) => [
											prevState[0],
											prevState[1],
											prevState[2] + betInfo.amount,
											prevState[3],
										]);
									else if (betInfo.betType === "bait")
										setBetTotal((prevState) => [
											prevState[0],
											prevState[1],
											prevState[2],
											prevState[3] + betInfo.amount,
										]);
								});
							}
						})
						.catch((error) => {
							console.error(error);
						});
				}
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);

	useEffect(() => {
		const socketRoll = async () => {
			await subscribeRoll();
			socket.on("createBet", (res) => {
				if (res.type === "createBet") {
					const betInfo = res.data.createBet.bet;
					const userInfo = res.data.createBet.user;
					setBetList((prevState) => [
						...prevState,
						{
							betType: betInfo.betType,
							amount: betInfo.amount,
							user: userInfo,
						},
					]);
					// FIXXXX 🔴🔴🔴🔴🔴🔴🔴
					if (betInfo.betType === "red")
						setBetTotal((prevState) => [
							prevState[0] + betInfo.amount,
							prevState[1],
							prevState[2],
							prevState[3],
						]);
					else if (betInfo.betType === "green")
						setBetTotal((prevState) => [
							prevState[0],
							prevState[1] + betInfo.amount,
							prevState[2],
							prevState[3],
						]);
					else if (betInfo.betType === "black")
						setBetTotal((prevState) => [
							prevState[0],
							prevState[1],
							prevState[2] + betInfo.amount,
							prevState[3],
						]);
					else if (betInfo.betType === "bait")
						setBetTotal((prevState) => [
							prevState[0],
							prevState[1],
							prevState[2],
							prevState[3] + betInfo.amount,
						]);
				} else console.log("something went wrong => createBet");
			});
			socket.on(
				"createGame",
				(res: { type: string; data: { createGame: RollInfo } }) => {
					if (res.type === "createGame") {
						// console.log(res)
						initBets();
						setRollInfo(res.data.createGame);
						setStartingIn(
							new Date(res.data.createGame.scheduledAt).getTime() - Date.now()
						);
					} else console.log("something went wrong => createGame");
				}
			);
			socket.on("updateGame", (res) => {
				if (res.type === "updateGame") {
					// console.log(res)
					setRollInfo(res.data.updateGame);
				} else console.log("something went wrong => updateGame");
			});
		};
		setTimeout(() => socketRoll(), 1000);
		setBetTimeout(false);
		return () => {
			socket.removeAllListeners("createBet");
			socket.removeAllListeners("createGame");
			socket.removeAllListeners("updateGame");
		};
	}, [socket]);

	useEffect(() => {
		if (rollInfo.status === "STARTED") {
			playRoll();
			var rollValue = rollInfo.rollValue || 0;
			// console.log(rollValue, rollValue%2 === 0 ? rollValue === 0 ? "Green" : "Black" : "Red") not real
			var posRand = Math.floor(
				Math.random() *
					(BET_TABLE[rollValue][0] - BET_TABLE[rollValue][1] + 1) +
					BET_TABLE[rollValue][1]
			);
			setPosition(-840);
			var animationTimeout = setTimeout(() => {
				setAnimation(true);
				setPosition(posRand);
			}, 10);
			return () => clearTimeout(animationTimeout);
		} else if (rollInfo.status === "CREATED") {
			setShowIndicator(true);
			updateRollHistory();
			setAnimation(false);
			var startingInt = setInterval(
				() =>
					setStartingIn((prev) => {
						if (prev > 0) return prev - 10;
						else {
							clearInterval(startingInt);
							return 0;
						}
					}),
				10
			);
			return () => clearInterval(startingInt);
		} else if (rollInfo.status === "FINISHED" && rollInfo.rollValue != null) {
			console.log(rollInfo.rollValue);
			setShowIndicator(false);
			var rollItem = document.getElementById(
				`roll-${(rollInfo.rollValue || 0) + 68}`
			);
			setRollWinner(
				rollInfo.rollValue === 7
					? "GREEN"
					: rollInfo.rollValue === 6
					? "BAIT-RED"
					: rollInfo.rollValue === 8
					? "BAIT-BLACK"
					: (rollInfo.rollValue > 7
							? rollInfo.rollValue - 7
							: rollInfo.rollValue) %
							2 ===
					  0
					? "RED"
					: "BLACK"
			);
			rollItem?.setAttribute(
				"style",
				"z-index: 10;transform: scale(1.2);filter: brightness(1);"
			);
			if (
				user.isLoggedIn &&
				betList.length > 0 &&
				betList.filter((bet) => bet.user.user_id === user.user_id)
			) {
				socket.emit("getUserCoins", {
					type: "getUserCoins",
					data: {},
				});
			}
			setTimeout(() => rollItem?.removeAttribute("style"), 3000);
		}
	}, [rollInfo.status]);

	useEffect(() => {
		var timeout = setTimeout(() => setBetTimeout(false), 200);
		return () => clearTimeout(timeout);
	}, [betTimeout]);

	const RollItem = ({ rollType, id }: { rollType: string; id: number }) => {
		return (
			<div
				id={`roll-${id}`}
				className="roll-item relative duration-300 transition-all">
				<div
					className={`${rollType} text-4xl mx-[0.1rem] w-[70px] h-[70px] overflow-hidden text-center leading-[70px] rounded-md`}>
					{rollType === "red" ? (
						<FontAwesomeIcon icon={faPizzaSlice} />
					) : rollType === "black" ? (
						<FontAwesomeIcon icon={faCow} />
					) : rollType === "bait-red" || rollType === "bait-black" ? (
						<FontAwesomeIcon icon={faHamburger} />
					) : (
						<FontAwesomeIcon icon={faIceCream} />
					)}
				</div>
			</div>
		);
	};

	const RollItems = () => {
		var items = [];
		for (let i = 0; i < 105; i++) {
			// if (i % 15 === 0) {
			//   // Green
			// }
			// else if ((i % 15) % 2 === 0) {
			//   // Red
			//   if (i % 15 === 14) {
			//     // Red Bait
			//   }
			// } else {
			//   // Black
			//   if (i % 15 === 1) {
			//     // Black Bait
			//   }
			// }
			items.push(
				<RollItem
					id={i}
					key={`roll-item-${i}`}
					rollType={
						i % 15 === 0
							? "green"
							: i % 15 === 14
							? "bait-red"
							: i % 15 === 1
							? "bait-black"
							: (i % 15) % 2 === 0
							? "red"
							: "black"
					}
				/>
			);
		}
		return items;
	};

	return (
		<div className="flex flex-col px-[2rem] md:px-[4rem] min-w-[768px] max-w-[1800px]">
			<div className="text-white flex flex-col self-center md:self-start">
				{/* history */}
				<div className="flex mt-6 items-center select-none">
					<span className="text-xs text-shark-200">LAST 100</span>
					<div className="flex px-4 text-[1.2rem]">
						<div className="mr-2 flex items-center">
							<span className="bg-red-500 roll-history-100-icon red-icon"></span>
							<span className="ml-[0.2rem] leading-[1px] font-bold">
								{rollHistory100.red}
							</span>
						</div>
						<div className="mx-2 flex items-center">
							<span className="bg-[#31353d] roll-history-100-icon black-icon"></span>
							<span className="ml-[0.2rem] leading-[1px] font-bold">
								{rollHistory100.black}
							</span>
						</div>
						<div className="mx-2 flex items-center">
							<span className="bg-green-500 roll-history-100-icon green-icon"></span>
							<span className="ml-[0.2rem] leading-[1px] font-bold">
								{rollHistory100.green}
							</span>
						</div>
						<div className="mx-2 flex items-center">
							<span className="bg-red-bait roll-history-100-icon"></span>
							<span className="ml-[0.2rem] leading-[1px] font-bold">
								{rollHistory100.baitRed}
							</span>
						</div>
						<div className="ml-2 flex items-center">
							<span className="bg-black-bait roll-history-100-icon"></span>
							<span className="ml-[0.2rem] leading-[1px] font-bold">
								{rollHistory100.baitBlack}
							</span>
						</div>
					</div>
				</div>
				<div className="flex mt-3 items-center select-none">
					{/* last 10, do later */}
					<div className="flex text-[1.2rem]">
						{rollHistory10.map((result, index) => {
							return (
								<div
									key={`roll-history-${index}`}
									className={`${result} text-[1rem] mx-[3px] w-[30px] h-[30px] overflow-hidden text-center leading-[30px] rounded-full`}>
									{result === "red" ? (
										<FontAwesomeIcon icon={faPizzaSlice} />
									) : result === "black" ? (
										<FontAwesomeIcon icon={faCow} />
									) : result === "bait-black" || result === "bait-red" ? (
										<FontAwesomeIcon icon={faHamburger} />
									) : (
										<FontAwesomeIcon icon={faIceCream} />
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>
			<div
				className={`relative rounded-xl bg-shark-900 mt-4 bg-opacity-50 py-4 transition-[filter] overflow-x-hidden mx-[11rem] min-[700px]:mx-0${
					animation ? " brightness-roll-items" : ""
				}`}>
				<div className="max-w-full shadow-border">
					{/* roll */}
					<div
						className={`indicator transition-opacity ${
							showIndicator ? "opacity-100" : "opacity-0"
						}`}></div>
					<div
						className={`flex relative left-1/2${
							animation ? " roll-transition" : ""
						}`}
						style={{ transform: `translate3d(${position}px, 0px, 0px)` }}>
						{useMemo(() => RollItems(), [])}
					</div>
				</div>
			</div>
			<div
				className={`transition-opacity flex justify-center items-center select-none flex-col mx-[11rem] min-[700px]:mx-0${
					rollInfo.status === "STARTED" ||
					rollInfo.status === "FINISHED" ||
					startingIn < 0
						? " opacity-0"
						: ""
				}`}>
				{/* starting in */}
				<span className="font-extrabold text-shark-200 text-2xl flex items-center">
					ROLLING IN{" "}
					<span className="text-yellow-400 p-2 text-center">
						{(startingIn / 1000).toFixed(2)}
					</span>
				</span>
				<div className="bg-shark-200 w-full">
					<div
						className={`${
							rollInfo.status === "CREATED" ? `slider-roll ` : ""
						}h-[0.3rem] ${
							startingIn < 1875
								? "bg-red-400"
								: startingIn < 5000
								? "bg-orange-400"
								: "bg-green-400"
						}`}
						style={{
							width: `${
								startingIn > 0 ? (100 - startingIn / 150).toFixed(0) : 100
							}%`,
						}}></div>
				</div>
			</div>
			<div className="mt-8 mx-[11rem] min-[700px]:mx-0">
				{/* betting form */}
				<div className="flex bg-shark-900 relative rounded p-1">
					<span className="absolute top-[2px] left-[8px] text-shark-400 text-xs select-none">
						Bet amount
					</span>
					<FontAwesomeIcon
						icon={faCoins}
						className="text-yellow-400 absolute bottom-[10px] left-[8px]"
					/>
					<input
						type="number"
						className="bg-transparent flex-1 text-shark-100 mt-3 pl-7 p-1 outline-none appearance-none"
						value={betAmount}
						onChange={(e) => setBetAmount(e.target.value)}
					/>
					<div className="items-center space-x-2 text-white font-[500] mx-2 select-none hidden md:flex">
						<button
							className="font-bold text-white transition-opacity opacity-50 hover:opacity-80"
							onClick={() => setBetAmount("0")}>
							CLEAR
						</button>
						<ValueBetBtn
							clickEvent={() =>
								setBetAmount((prevAmount) =>
									prevAmount.length === 0
										? "1"
										: (parseFloat(prevAmount) + 1).toString()
								)
							}
							text="+1"
						/>
						<ValueBetBtn
							clickEvent={() =>
								setBetAmount((prevAmount) =>
									prevAmount.length === 0
										? "10"
										: (parseFloat(prevAmount) + 10).toString()
								)
							}
							text="+10"
						/>
						<ValueBetBtn
							clickEvent={() =>
								setBetAmount((prevAmount) =>
									prevAmount.length === 0
										? "100"
										: (parseFloat(prevAmount) + 100).toString()
								)
							}
							text="+100"
						/>
						<ValueBetBtn
							clickEvent={() =>
								setBetAmount(
									user.isLoggedIn ? (user.coins / 2).toFixed(2) : "0"
								)
							}
							text="1/2"
						/>
						<ValueBetBtn
							clickEvent={() =>
								setBetAmount(user.isLoggedIn ? user.coins.toFixed(2) : "0")
							}
							text="MAX"
						/>
					</div>
				</div>
				<section
					className={`bet-section flex justify-evenly flex-col lg:flex-row mt-4 lg:space-x-8 transition-opacity${
						rollInfo.status !== "CREATED" ? " pointer-events-none" : ""
					}`}>
					{/* RED */}
					<div
						className={`flex transition-opacity flex-col rounded${
							rollInfo.status === "FINISHED"
								? rollWinner === "RED" || rollWinner === "BAIT-RED"
									? " opacity-100"
									: " opacity-40"
								: rollInfo.status === "STARTED"
								? " opacity-40"
								: ""
						}`}>
						<div className="flex bg-shark-900 items-center py-2 rounded-t-md justify-center">
							<div className="red text-xl mx-[0.1rem] w-[36px] h-[36px] overflow-hidden text-center leading-[36px] rounded-full">
								<FontAwesomeIcon icon={faPizzaSlice} />
							</div>
							<div className="red text-xl mx-[0.1rem] ml-[0.2rem] w-[36px] h-[36px] overflow-hidden text-center leading-[36px] rounded-full">
								<FontAwesomeIcon icon={faHamburger} />
							</div>
							<span className="text-shark-100 text-sm font-bold ml-2 select-none">
								Win 2x
							</span>
						</div>
						<button
							onClick={() => betRoll("red")}
							className="bg-red-500 text-white select-none font-bold text-sm flex items-center justify-center h-[40px] px-4 py-2 rounded-md hover:brightness-105 shadow-red cursor-pointer">
							Place Bet
						</button>
						<div className="flex flex-col">
							<div className="flex items-center text-white p-2 select-none">
								<span className="flex-1">
									{betList.filter((bet) => bet.betType === "red").length} Bets
								</span>
								<div>
									<FontAwesomeIcon
										icon={faCoins}
										className="text-yellow-400 mr-2"
									/>
									{rollInfo.status === "FINISHED" ? (
										rollWinner === "RED" || rollWinner === "BAIT-RED" ? (
											<span className="font-bold text-green-500">
												{(betTotal[0] * 2).toFixed(2)}
											</span>
										) : (
											<span className="font-semibold text-red-500">
												{betTotal[0].toFixed(2)}
											</span>
										)
									) : (
										<span className="font-semibold">
											{betTotal[0].toFixed(2)}
										</span>
									)}
								</div>
							</div>
						</div>
						<div className="flex flex-col bets-container h-[200px] md:h-[250px] overflow-y-scroll">
							{betList
								.filter((bet) => bet.betType === "red")
								.sort((a, b) => b.amount - a.amount)
								.map((bet, idx) => {
									return (
										<div
											key={`${bet.user.username}_${idx}`}
											className={`roll-bet flex items-center border-l-[1px] border-r-[1px] rounded ${
												bet.amount > 20
													? "border-yellow-300"
													: "border-shark-300"
											}`}>
											<AvatarUser user={bet.user} />
											<span className="flex-1 text-white opacity-80 font-medium select-none">
												{bet.user.username}
											</span>
											<div>
												<FontAwesomeIcon
													icon={faCoins}
													className="text-yellow-400 mr-2"
												/>
												{(rollInfo.status === "FINISHED" &&
													rollWinner === "RED") ||
												rollWinner === "BAIT-RED" ? (
													<span className="font-bold text-white select-none">
														{(bet.amount * 2).toFixed(2)}
													</span>
												) : (
													<span className="font-semibold text-white select-none">
														{bet.amount.toFixed(2)}
													</span>
												)}
											</div>
										</div>
									);
								})}
						</div>
					</div>
					<div
						className={`flex transition-opacity flex-col rounded ${
							rollInfo.status === "FINISHED"
								? rollWinner === "BLACK" || rollWinner === "BAIT-BLACK"
									? " opacity-100"
									: " opacity-40"
								: rollInfo.status === "STARTED"
								? " opacity-40"
								: ""
						}`}>
						<div className="flex bg-shark-900 items-center py-2 rounded-t-md justify-center">
							<div className="black text-xl mx-[0.1rem] w-[36px] h-[36px] overflow-hidden text-center leading-[36px] rounded-full">
								<FontAwesomeIcon icon={faCow} />
							</div>
							<div className="black text-xl mx-[0.1rem] ml-[0.2rem] w-[36px] h-[36px] overflow-hidden text-center leading-[36px] rounded-full">
								<FontAwesomeIcon icon={faHamburger} />
							</div>
							<span className="text-shark-100 text-sm font-bold ml-2 select-none">
								Win 2x
							</span>
						</div>
						<button
							onClick={() => betRoll("black")}
							className="text-white select-none font-bold text-sm flex items-center justify-center h-[40px] px-4 py-2 rounded-md hover:brightness-105 shadow-black-btn cursor-pointer">
							Place Bet
						</button>
						<div className="flex flex-col">
							<div className="flex items-center text-white p-2 select-none">
								<span className="flex-1">
									{betList.filter((bet) => bet.betType === "black").length} Bets
								</span>
								<div>
									<FontAwesomeIcon
										icon={faCoins}
										className="text-yellow-400 mr-2"
									/>
									{rollInfo.status === "FINISHED" ? (
										rollWinner === "BLACK" || rollWinner === "BAIT-BLACK" ? (
											<span className="font-bold text-green-500">
												{(betTotal[2] * 2).toFixed(2)}
											</span>
										) : (
											<span className="font-semibold text-red-500">
												{betTotal[2].toFixed(2)}
											</span>
										)
									) : (
										<span className="font-semibold">
											{betTotal[2].toFixed(2)}
										</span>
									)}
								</div>
							</div>
						</div>
						<div className="flex flex-col bets-container h-[200px] md:h-[250px] overflow-y-scroll">
							{betList
								.filter((bet) => bet.betType === "black")
								.sort((a, b) => b.amount - a.amount)
								.map((bet, idx) => {
									return (
										<div
											key={`${bet.user.username}_${idx}`}
											className={`roll-bet flex items-center border-l-[1px] border-r-[1px] rounded ${
												bet.amount > 20
													? "border-yellow-300"
													: "border-shark-300"
											}`}>
											<AvatarUser user={bet.user} />
											<span className="flex-1 text-white opacity-80 font-medium select-none">
												{bet.user.username}
											</span>
											<div>
												<FontAwesomeIcon
													icon={faCoins}
													className="text-yellow-400 mr-2"
												/>
												{(rollInfo.status === "FINISHED" &&
													rollWinner === "BLACK") ||
												rollWinner === "BAIT-BLACK" ? (
													<span className="font-bold text-white select-none">
														{(bet.amount * 2).toFixed(2)}
													</span>
												) : (
													<span className="font-semibold text-white select-none">
														{bet.amount.toFixed(2)}
													</span>
												)}
											</div>
										</div>
									);
								})}
						</div>
					</div>
					<div
						className={`flex transition-opacity flex-col rounded ${
							rollInfo.status === "FINISHED"
								? rollWinner === "GREEN"
									? " opacity-100"
									: " opacity-40"
								: rollInfo.status === "STARTED"
								? " opacity-40"
								: ""
						}`}>
						<div className="flex bg-shark-900 items-center py-2 rounded-t-md justify-center">
							<div className="green text-xl mx-[0.1rem] w-[36px] h-[36px] overflow-hidden text-center leading-[36px] rounded-full">
								<FontAwesomeIcon icon={faIceCream} />
							</div>
							<span className="text-shark-100 text-sm font-bold ml-2 select-none">
								Win 14x
							</span>
						</div>
						<button
							onClick={() => betRoll("green")}
							className="bg-green-500 text-white select-none font-bold text-sm flex items-center justify-center h-[40px] px-4 py-2 rounded-md hover:brightness-105 shadow-green cursor-pointer">
							Place Bet
						</button>
						<div className="flex flex-col">
							<div className="flex items-center text-white p-2 select-none">
								<span className="flex-1">
									{betList.filter((bet) => bet.betType === "green").length} Bets
								</span>
								<div>
									<FontAwesomeIcon
										icon={faCoins}
										className="text-yellow-400 mr-2"
									/>
									{rollInfo.status === "FINISHED" ? (
										rollWinner === "GREEN" ? (
											<span className="font-bold text-green-500">
												{(betTotal[1] * 14).toFixed(2)}
											</span>
										) : (
											<span className="font-semibold text-red-500">
												{betTotal[1].toFixed(2)}
											</span>
										)
									) : (
										<span className="font-semibold">
											{betTotal[1].toFixed(2)}
										</span>
									)}
								</div>
							</div>
						</div>
						<div className="flex flex-col bets-container h-[200px] md:h-[250px] overflow-y-scroll">
							{betList
								.filter((bet) => bet.betType === "green")
								.sort((a, b) => b.amount - a.amount)
								.map((bet, idx) => {
									return (
										<div
											key={`${bet.user.username}_${idx}`}
											className={`roll-bet flex items-center border-l-[1px] border-r-[1px] rounded ${
												bet.amount > 20
													? "border-yellow-300"
													: "border-shark-300"
											}`}>
											<AvatarUser user={bet.user} />
											<span className="flex-1 text-white opacity-80 font-medium select-none">
												{bet.user.username}
											</span>
											<div>
												<FontAwesomeIcon
													icon={faCoins}
													className="text-yellow-400 mr-2"
												/>
												{rollInfo.status === "FINISHED" &&
												rollWinner === "GREEN" ? (
													<span className="font-bold text-white select-none">
														{(bet.amount * 14).toFixed(2)}
													</span>
												) : (
													<span className="font-semibold text-white select-none">
														{bet.amount.toFixed(2)}
													</span>
												)}
											</div>
										</div>
									);
								})}
						</div>
					</div>
					<div
						className={`flex transition-opacity flex-col rounded ${
							rollInfo.status === "FINISHED"
								? rollWinner === "BAIT-RED" || rollWinner === "BAIT-BLACK"
									? " opacity-100"
									: " opacity-40"
								: rollInfo.status === "STARTED"
								? " opacity-40"
								: ""
						}`}>
						<div className="flex bg-shark-900 items-center py-2 rounded-t-md justify-center">
							<div className="red text-xl mx-[0.1rem] ml-[0.2rem] w-[36px] h-[36px] overflow-hidden text-center leading-[36px] rounded-full">
								<FontAwesomeIcon icon={faHamburger} />
							</div>
							<div className="black text-xl mx-[0.1rem] ml-[0.2rem] w-[36px] h-[36px] overflow-hidden text-center leading-[36px] rounded-full">
								<FontAwesomeIcon icon={faHamburger} />
							</div>
							<span className="text-shark-100 text-sm font-bold ml-2 select-none">
								Win 7x
							</span>
						</div>
						<button
							onClick={() => betRoll("bait")}
							className="bg-gray-500 text-white select-none font-bold text-sm flex items-center justify-center h-[40px] px-4 py-2 rounded-md shadow-gray-btn hover:brightness-105 cursor-pointer">
							Place BaitBet
						</button>
						<div className="flex flex-col">
							<div className="flex items-center text-white p-2 select-none">
								<span className="flex-1">
									{betList.filter((bet) => bet.betType === "bait").length} Bets
								</span>
								<div>
									<FontAwesomeIcon
										icon={faCoins}
										className="text-yellow-400 mr-2"
									/>
									{rollInfo.status === "FINISHED" ? (
										rollWinner === "BAIT-RED" || rollWinner === "BAIT-BLACK" ? (
											<span className="font-bold text-green-500">
												{(betTotal[3] * 7).toFixed(2)}
											</span>
										) : (
											<span className="font-semibold text-red-500">
												{betTotal[3].toFixed(2)}
											</span>
										)
									) : (
										<span className="font-semibold">
											{betTotal[3].toFixed(2)}
										</span>
									)}
								</div>
							</div>
						</div>
						<div className="flex flex-col bets-container h-[200px] md:h-[250px] overflow-y-scroll">
							{betList
								.filter((bet) => bet.betType === "bait")
								.sort((a, b) => b.amount - a.amount)
								.map((bet, idx) => {
									return (
										<div
											key={`${bet.user.username}_${idx}`}
											className={`roll-bet flex items-center border-l-[1px] border-r-[1px] rounded ${
												bet.amount > 20
													? "border-yellow-300"
													: "border-shark-300"
											}`}>
											<AvatarUser user={bet.user} />
											<span className="flex-1 text-white opacity-80 font-medium select-none">
												{bet.user.username}
											</span>
											<div>
												<FontAwesomeIcon
													icon={faCoins}
													className="text-yellow-400 mr-2"
												/>
												{(rollInfo.status === "FINISHED" &&
													rollWinner === "BAIT-RED") ||
												rollWinner === "BAIT-BLACK" ? (
													<span className="font-bold text-white select-none">
														{(bet.amount * 7).toFixed(2)}
													</span>
												) : (
													<span className="font-semibold text-white select-none">
														{bet.amount.toFixed(2)}
													</span>
												)}
											</div>
										</div>
									);
								})}
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}

export default Roll;
