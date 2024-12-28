import { useState, useContext } from "react";
import { GlobalContext } from "../App";
import { AuthInstance } from "../utils/serverConnection";
import moment from "moment";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function AccountTab() {
	const { alert, user } = useContext(GlobalContext);

	//Inputs:
	const [emailInput, setEmailInput] = useState<string>(user.userInfo.email);
	const [usernameInput, setUsernameInput] = useState<string>(
		user.userInfo.username
	);
	const [passwordInput, setPasswordInput] = useState<string>("");

	const updateInfo = (type: "USERNAME" | "EMAIL" | "PASSWORD") => {
		if (
			user.userInfo.username !== usernameInput ||
			user.userInfo.email !== emailInput ||
			passwordInput.length >= 8
		) {
			AuthInstance.put(`/update/${type}`, {
				newValue:
					type === "EMAIL"
						? emailInput
						: type === "USERNAME"
						? usernameInput
						: type === "PASSWORD" && passwordInput,
			})
				.then(async (response) => {
					if (response.status === 200) {
						alert.setAlertCode(`update_${type}_success`);
						setTimeout(() => window.location.reload(), 3000);
					} else {
						console.log("Bad update =>", response.status);
						alert.setAlertCode("update_failure");
					}
				})
				.catch((error) => {
					console.log(
						`Bad update => ${error.response ? error.response.status : "error"}`
					);
					console.error(error);
					alert.setAlertCode("update_failure");
				});
		}
	};

	const toggleConfetti = () =>
		localStorage.setItem(
			"showConfetti",
			localStorage.getItem("showConfetti") === "true" ? "false" : "true"
		);

	return (
		<div>
			<h5 className="uppercase font-bold text-white text-3xl select-none">
				PERSONAL INFO
			</h5>
			<div className="mt-7">
				<div className="rounded-md text-md bg-shark-900 text-white border-solid border-[1px] p-2 border-shark-950 font-light flex select-none relative">
					<input
						value={emailInput}
						onChange={(e) => setEmailInput(e.target.value)}
						type="text"
						name="newEmail"
						className="outline-none bg-transparent flex-1 text-shark-100 mt-3 pl-[2px] pr-3"
					/>
					<label className="text-shark-200 text-sm absolute top-1">Email</label>
					<button
						onClick={() => {
							updateInfo("EMAIL");
						}}
						className="text-white flex items-center justify-center bg-green-500 px-4 py-2 rounded-md hover:brightness-105 shadow-green cursor-pointer">
						<span className="font-bold select-none">CHANGE</span>
					</button>
				</div>
				<div className="mt-4 rounded-md text-md bg-shark-900 text-white border-solid border-[1px] p-2 border-shark-950 font-light flex select-none relative">
					<input
						value={usernameInput}
						onChange={(e) => setUsernameInput(e.target.value)}
						maxLength={16}
						type="text"
						name="newUsername"
						className="outline-none bg-transparent flex-1 text-shark-100 mt-3 pl-[2px] pr-3"
					/>
					<label className="text-shark-200 text-sm absolute top-1">
						Username
					</label>
					<button
						onClick={() => {
							updateInfo("USERNAME");
						}}
						className="text-white flex items-center justify-center bg-green-500 px-4 py-2 rounded-md hover:brightness-105 shadow-green cursor-pointer">
						<span className="font-bold select-none">UPDATE</span>
					</button>
				</div>
				<div className="mt-4 rounded-md text-md bg-shark-900 text-white border-solid border-[1px] p-2 border-shark-950 font-light flex select-none relative">
					<input
						value={passwordInput}
						onChange={(e) => setPasswordInput(e.target.value)}
						maxLength={32}
						type="password"
						name="newPassword"
						placeholder="••••••••••••••••"
						className="outline-none bg-transparent flex-1 text-shark-100 mt-3 pl-[2px] pr-3"
					/>
					<label className="text-shark-200 text-sm absolute top-1">
						Password
					</label>
					<button
						onClick={() => {
							updateInfo("PASSWORD");
						}}
						className="text-white flex items-center justify-center bg-green-500 px-4 py-2 rounded-md hover:brightness-105 shadow-green cursor-pointer">
						<span className="font-bold select-none">UPDATE</span>
					</button>
				</div>
			</div>
			<h5 className="uppercase font-bold text-white text-3xl mt-5">SETTINGS</h5>
			<div className="flex flex-col select-none mt-5 font-[UnLucky] text-shark-300 text-sm pb-4 border-b-shark-900 border-b-2 space-y-4">
				<div>
					<span>VOLUME</span>
					<span className="text-white ml-8">COMING SOON</span>
				</div>
				<div className="flex">
					<span>CONFETTI</span>
					<div className="check-box ml-8">
						<input
							onChange={toggleConfetti}
							type="checkbox"
							defaultChecked={
								localStorage.getItem("showConfetti") === "true"
									? true
									: undefined
							}
						/>
					</div>
				</div>
				<div>
					<span>PRIVATE ACCOUNT</span>
					<span className="text-white ml-8">COMING SOON</span>
				</div>
				<div>
					<span>MAIN WALLET</span>
					<FontAwesomeIcon
						icon={faCoins}
						className="text-yellow-400 mr-1 ml-8"
					/>
					<span className="text-white">{user.coins.toFixed(2)}</span>
				</div>
			</div>
			<div className="mt-2 font-[UnLucky] text-sm uppercase select-none">
				<span className="text-shark-300">REGISTERED</span>
				<span className="text-shark-100 ml-8">
					{moment(user.userInfo.createdAt).format("lll")}
				</span>
			</div>
		</div>
	);
}
