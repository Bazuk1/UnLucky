import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import "./database";
import socket from "./socket";
import dotenv from "dotenv";
import cors from "cors";

import RollGame from "./games/roll";

// Initialize Server

dotenv.config();

const app = express();

app.use(
	cors({
		origin: process.env.CORS,
	})
);

app.use(express.json({ limit: "100mb" }));

const httpServer = createServer(app);

export const io = new Server(httpServer, {
	cors: {
		origin: process.env.CORS,
	},
});

////////////////////////////////

// Routes
import rollRouter from "./routers/roll";
import userRouter from "./routers/user";
import authRouter from "./routers/auth";
import seedRouter from "./routers/seed";
import unboxingRouter from "./routers/unboxing";
import { fetchCurrentSeeds } from "./database/seed.functions";
import { createItem } from "./database/item.functions";
import { createCase } from "./database/case.functions";
import { updateUserInfo } from "./database/user.functions";

app.use("/seed", seedRouter);
app.use("/roll", rollRouter);
app.use("/auth", authRouter);
app.use("/unboxing", unboxingRouter);
app.use("/", userRouter);

// Check Server Connection
app.get("/ping", function (_, res) {
	res.status(200).send("pong");
});

// Else
app.get("*", function (_, res) {
	res.sendStatus(404);
});

////////////////////////////////

export var publicSeed: string = "";
export var serverSeed: string = "";

async function updateSeeds() {
	const newSeeds = await fetchCurrentSeeds();
	if (newSeeds.status === 200) {
		publicSeed = newSeeds.data.public_seed || "";
		serverSeed = newSeeds.data.server_seed || "";
	}
}

httpServer.listen(process.env.PORT, () => {
	console.log("Api Server is up!", process.env.PORT);
	socket({ io });
	setTimeout(async () => {
		console.log("Roll Game is up!");
		// await updateUserInfo("PASSWORD", "bazuki123", "647f1aaae69cabb0f282f31e")
		RollGame();

		// setInterval(async () => console.log((await playCaseOpening({case_id: "649bfdceb559f8183c3ae088",amount: 1}, "647f1aaae69cabb0f282f31e")).data.game.itemWon), 5000)

		// await createItem({
		//     name: "Shachar",
		//     iconUrl: "https://cdn.discordapp.com/attachments/760277548676153414/1124742157224390687/shachar.jpg",
		//     value: 0.1
		// })
		// await createItem({
		//     name: "Yoav",
		//     iconUrl: "https://cdn.discordapp.com/attachments/760277548676153414/1124742182792859898/unknown_3.png",
		//     value: 10
		// })
		// await createItem({
		//     name: "Shauli",
		//     iconUrl: "https://cdn.discordapp.com/attachments/760277548676153414/1124742196512423986/5a393813463613bf.jpg",
		//     value: 100000.00
		// })
		// await createItem({
		//     name: "PP-Bizon | Sand Dashed",
		//     iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLO_JAlfwOP3ZTxS6eOlnI-Zg8jnMrXVqWZU7Mxkh9bN9J7yjRrm8xI5ajr0IYXGclI3Z16DqVLqlb_t0MPvvc7KzCMyvyUns3ndzkTkn1gSOcRWfgr_/250x250",
		//     value: 0.01
		// })
		// console.log(await createCase({
		//     name: "Common L",
		//     iconUrl: "https://cdn.discordapp.com/attachments/760277548676153414/1124742142020034590/fat_jesus.jpg",
		// }, [
		//     {
		//         idx: 0,
		//         rate: .89,
		//         item: "64a0583283445e08dfbf3c1c"
		//     },
		//     {
		//         idx: 1,
		//         rate: .1,
		//         item: "64a0583283445e08dfbf3c1e"
		//     },
		//     {
		//         idx: 2,
		//         rate: .01,
		//         item: "64a0583283445e08dfbf3c20"
		//     },
		// ]));
		// console.log((await generateRollStream("649bed96e02ca43291d4a652"))?.data.itemsPos)
	}, 3000);
	// createUser("sheesh", "w123")
	updateSeeds();
	setInterval(() => updateSeeds(), 24 * 60 * 60 * 1000);
});

////////////////////////////////
