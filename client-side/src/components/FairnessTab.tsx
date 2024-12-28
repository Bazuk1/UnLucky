import { useState, useContext, useEffect } from "react";
import { AuthInstance } from "../utils/serverConnection";
import { GlobalContext } from "../App";

export default function FairnessTab() {
	const { alert } = useContext(GlobalContext);

	const [clientSeed, setClientSeed] = useState<string>("");
	const [staticSeeds, setStaticSeeds] = useState<string[]>(["", ""]);
	// 0 - server 1 - public

	const changeClientSeed = () => {
		if (clientSeed.length > 0) {
			AuthInstance.put("/update/CLIENT_SEED", {
				newValue: clientSeed,
			})
				.then(async (response) => {
					if (response.status === 200) {
						alert.setAlertCode("update_CLIENT_SEED_success");
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

	const loadSeeds = () => {
		AuthInstance.get("/seed/current_seeds/auth")
			.then(async (response) => {
				if (response.status === 200) {
					setClientSeed(response.data.client_seed);
					setStaticSeeds([
						response.data.server_seed_hashed,
						response.data.public_seed,
					]);
				}
			})
			.catch((error) => {
				console.log(
					`Bad update => ${error.response ? error.response.status : "error"}`
				);
			});
	};

	useEffect(() => loadSeeds(), []);

	return (
		<div className="flex flex-col">
			<h5 className="uppercase font-bold text-white text-3xl select-none">
				FAIRNESS
			</h5>
			<h1 className="text-shark-100 text-sm my-2">
				UnLucky employs a simple system for verification of games. Server seeds
				are hashed and shown before a game and the user can pick any seed they
				want.
			</h1>
			<div className="rounded-md text-md bg-shark-900 text-white border-solid border-[1px] p-2 border-shark-950 font-light flex select-none relative mt-3">
				<input
					value={clientSeed}
					onChange={(e) => setClientSeed(e.target.value)}
					type="text"
					name="clientSeed"
					className="outline-none bg-transparent flex-1 text-shark-100 mt-3 pl-[2px] pr-3"
				/>
				<label className="text-shark-200 text-sm absolute top-1">
					Client Seed
				</label>
				<button
					onClick={changeClientSeed}
					className="text-white flex items-center justify-center bg-green-500 px-4 py-2 rounded-md hover:brightness-105 shadow-green cursor-pointer">
					<span className="font-bold select-none">CHANGE</span>
				</button>
			</div>
			<div className="opacity-80 pointer-events-none rounded-md text-md bg-shark-900 text-white border-solid border-[1px] p-2 border-shark-950 font-light flex select-none relative mt-3">
				<input
					defaultValue={staticSeeds[0]}
					type="text"
					name="serverSeed"
					className="outline-none bg-transparent flex-1 text-shark-100 mt-3 pl-[2px] pr-3"
				/>
				<label className="text-shark-200 text-sm absolute top-1">
					Server Seed (hashed)
				</label>
			</div>
			<div className="opacity-80 pointer-events-none rounded-md text-md bg-shark-900 text-white border-solid border-[1px] p-2 border-shark-950 font-light flex select-none relative mt-3">
				<input
					defaultValue={staticSeeds[1]}
					type="text"
					name="publicSeed"
					className="outline-none bg-transparent flex-1 text-shark-100 mt-3 pl-[2px] pr-3"
				/>
				<label className="text-shark-200 text-sm absolute top-1">
					Public Seed
				</label>
			</div>
		</div>
	);
}
