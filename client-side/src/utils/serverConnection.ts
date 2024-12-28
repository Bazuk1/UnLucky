import axios, { AxiosError } from "axios";
import { customAlphabet } from "nanoid";
import { socket } from "./socketConnection";

// Axios instances:
export const DefaultInstance = axios.create({
	baseURL: process.env.REACT_APP_SERVER_URL,
	timeout: 5000,
});

export var AuthInstance = axios.create({
	baseURL: process.env.REACT_APP_SERVER_URL,
	timeout: 5000,
	headers: {
		Authorization: localStorage.getItem("sessionToken"),
	},
});

// Temp:

const SListeners = {
	connection_init: "connection_init",
	subscribe: "subscribe",
	placeBet: "placeBet",

	subscribePvpGame: "subscribePvpGame",
	enterPvpGame: "enterGame",
};

const CListeners = {
	connection_ack: "connection_ack",
	createBet: "createBet",
	createGame: "createGame",
	updateGame: "updateGame",

	createPvpGame: "createPvpGame",
	updatePvpGame: "updatePvpGame",
};

// Side functions:

async function pingExpressServer() {
	return DefaultInstance.get("/ping")
		.then((response) => {
			if (response.status === 200) return true;
			return false;
		})
		.catch((error) => {
			// console.error(error);
			return false;
		});
}

function sessionIdGenerator() {
	return customAlphabet("0123456789abcdef", 8)();
}

// Server connection initialization:

export async function initializeConnection() {
	// Ping Express server:
	const expressServerConnection = await pingExpressServer();
	if (expressServerConnection) {
		const sessionId = sessionIdGenerator();
		const refToken = localStorage.getItem("refToken");
		if (refToken) {
			console.log("Found Refresh Token");
			return DefaultInstance.post("/auth", {
				sessionReq: {
					session: sessionId,
					refToken: refToken,
				},
			})
				.then(async (response) => {
					if (response.status === 200) {
						console.log("New sessionToken:", response.data.sessionToken);
						localStorage.setItem("sessionToken", response.data.sessionToken);
						socket.auth = {
							sessionId: sessionId,
							sessionToken: response.data.sessionToken,
						};
						AuthInstance = axios.create({
							baseURL: process.env.REACT_APP_SERVER_URL,
							timeout: 5000,
							headers: {
								Authorization: localStorage.getItem("sessionToken"),
							},
						});
						socket.connect();
						const isConnected = await socketInit();
						console.log(`Socket connection: ${isConnected}`);
						return "success-authenticated";
					} else {
						console.log("Bad refresh token =>", response.status);
						return "success";
					}
				})
				.catch((error: AxiosError) => {
					console.log("Bad refresh token => error");
					console.error(error);

					if (error.response && error.response.status === 401) {
						localStorage.removeItem("refToken");
					}

					return "success";
				});
		} else {
			socket.auth = {
				sessionId: sessionId,
			};
			socket.connect();
			const isConnected = await socketInit();
			console.log(`Socket connection: ${isConnected}`);
			return "success";
		}
	} else {
		console.log("NO SERVER CONNECTION!!!");
		setTimeout(() => {
			return initializeConnection();
		}, 5000);
		// להראות מסך "אין חיבור לשרת" וכל 5 שניות לשלוח פינג עד התחברות מוצלחת.
	}
}

async function socketInit() {
	var connectionTimeout = setTimeout(() => {
		return false;
	}, 10000);
	socket.once(CListeners.connection_ack, (res) => {
		console.log("Socket Connection:", CListeners.connection_ack, res);
		clearTimeout(connectionTimeout);
		return true;
	});
	socket.emit(SListeners.connection_init, {
		type: SListeners.connection_init,
		data: {},
	});
}

// Roll functions:

export async function subscribeRoll() {
	socket.emit(SListeners.subscribe, {
		type: SListeners.subscribe,
		data: {
			roomName: "Roll",
			params: {},
		},
	});
	// socket.onAny((event, ...args) => console.log(event, ...args))
}

export async function placeBet(
	roll_id: string,
	amount: number,
	betType: string
) {
	socket.emit(SListeners.placeBet, {
		type: SListeners.placeBet,
		data: {
			betType: betType,
			amount: amount,
			payoutMultiplier: betType === "green" ? 14 : betType === "bait" ? 7 : 2,
			roll_id: roll_id,
		},
	});
}

// Pvp functions:

export async function subscribePvp() {
	socket.emit(SListeners.subscribe, {
		type: SListeners.subscribe,
		data: {
			roomName: "Pvp",
			params: {},
		},
	});
	// socket.onAny((event, ...args) => console.log(event, ...args))
}

export async function fetchAuthUserInfo() {
	return AuthInstance.get("/")
		.then(async (response) => {
			if (response.status === 200) {
				console.log("Fetched auth user info");
				return response.data.user;
			} else {
				console.log(`Can't fetch auth user info => ${response.status}`);
				return null;
			}
		})
		.catch((error) => {
			console.log("Can't fetch auth user info => error");
			console.error(error);
			return null;
		});
}
