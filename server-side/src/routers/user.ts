import { Router } from "express";
import {
	fetchPublicUserInfo,
	fetchUserCoins,
	fetchUserInfo,
	loginUser,
	updateUserInfo,
} from "../database/user.functions";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth";
import { Request, Response } from "express";

var userRouter = Router();

// Login user
userRouter.post("/login", async (req, res) => {
	try {
		const { username, password }: { username: string; password: string } =
			JSON.parse(req.body.credentials);
		if (!username || !password) res.status(400).send(null);

		const userLogin = await loginUser({ username, password });
		if (userLogin.status === 200) {
			const refToken = jwt.sign(
				{
					key: userLogin.data.key,
					user_id: userLogin.data.user_id,
				},
				process.env.AUTH_JWT_KEY || "",
				{ expiresIn: "30d" }
			);
			res.status(200).json({
				refToken: refToken,
			});
		} else res.status(userLogin.status).send(userLogin.data);
	} catch (e) {
		console.error(e);
		res.status(500).send(null);
	}
});

// Get public user information
userRouter.get("/:user_id/public", async (req, res) => {
	const user_id = req.params.user_id;
	try {
		const publicUserInfo = await fetchPublicUserInfo(user_id);
		res.status(publicUserInfo.status).send(publicUserInfo.data);
	} catch (e) {
		console.error(e);
		res.status(500).send(null);
	}
});

// Get private user information - NEEDS AUTH
userRouter.get("/", [auth], async (req: Request, res: Response) => {
	const user_id = res.locals.jwt.user_id;
	try {
		const privateUserInfo = await fetchUserInfo(user_id);
		res.status(privateUserInfo.status).send(privateUserInfo.data);
	} catch (e) {
		console.error(e);
		res.status(500).send(null);
	}
});

// Get private user coins - NEEDS AUTH
userRouter.get("/coins", [auth], async (req: Request, res: Response) => {
	const user_id = res.locals.jwt.user_id;
	try {
		const userCoins = await fetchUserCoins(user_id);
		res.status(userCoins.status).send(userCoins.data);
	} catch (e) {
		console.error(e);
		res.status(500).send(null);
	}
});

// Update user information - NEEDS AUTH
userRouter.put(
	"/update/:info_type",
	[auth],
	async (req: Request, res: Response) => {
		const user_id = res.locals.jwt.user_id;
		const info_type = req.params.info_type;
		try {
			const { newValue }: { newValue: string } = JSON.parse(req.body.newValue);
			if (!newValue) res.status(400).send(null);

			const userUpdated = await updateUserInfo(info_type, newValue, user_id);
			res.status(userUpdated.status).send(userUpdated.data);
		} catch (e) {
			console.error(e);
			res.status(500).send(null);
		}
	}
);

export default userRouter;
