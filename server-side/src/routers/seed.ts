import { Router } from "express";
import { fetchClientSeed } from "../database/user.functions";
import auth from "../middleware/auth";
import { Request, Response } from "express";
import { fetchCurrentSeeds } from "../database/seed.functions";
import { generateClientSeed } from "../utils/seedGenerator";

var seedRouter = Router();

// Fetch client seed - NEEDS AUTH
seedRouter.get("/client_seed", [auth], async (req: Request, res: Response) => {
	const user_id = res.locals.jwt.user_id;
	try {
		const clientSeed = await fetchClientSeed(user_id);
		res.status(clientSeed.status).send(clientSeed.data);
	} catch (e) {
		console.error(e);
		res.status(500).send(null);
	}
});

// Fetch current seeds - NEEDS AUTH
seedRouter.get(
	"/current_seeds/auth",
	[auth],
	async (req: Request, res: Response) => {
		const user_id = res.locals.jwt.user_id;
		try {
			const currentSeeds = await fetchCurrentSeeds();
			const clientSeed = await fetchClientSeed(user_id);
			res
				.status(
					currentSeeds.status === 200 ? clientSeed.status : currentSeeds.status
				)
				.send({
					public_seed: currentSeeds.data.public_seed,
					server_seed_hashed: generateClientSeed(
						currentSeeds.data.server_seed || ""
					),
					client_seed: clientSeed.data.client_seed,
				});
		} catch (e) {
			console.error(e);
			res.status(500).send(null);
		}
	}
);

// Fetch Server and Public
seedRouter.get("/current_seeds", async (req: Request, res: Response) => {
	try {
		const currentSeeds = await fetchCurrentSeeds();
		res.status(currentSeeds.status).send({
			public_seed: currentSeeds.data.public_seed,
			server_seed_hashed: generateClientSeed(
				currentSeeds.data.server_seed || ""
			),
		});
	} catch (e) {
		console.error(e);
		res.status(500).send(null);
	}
});

export default seedRouter;
