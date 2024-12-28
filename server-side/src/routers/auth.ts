import { Router } from "express";
import jwt from "jsonwebtoken";
import { checkKey } from "../database/user.functions";

var authRouter = Router();

// Generate session token
authRouter.post("/", async (req, res) => {
	try {
		const { session, refToken }: { session: string; refToken: string } =
			JSON.parse(req.body.sessionReq);
		let decodedRef: any | null = null;
		try {
			decodedRef = jwt.verify(refToken, process.env.AUTH_JWT_KEY || "");
		} catch (e) {}

		if (decodedRef) {
			const checkRef = await checkKey(decodedRef);
			if (checkRef.status === 200) {
				const sessionToken = jwt.sign(
					{
						session: session,
						user_id: checkRef.data.user_id,
					},
					"eyJhbGciOi",
					{ expiresIn: "24h" }
				);
				res.status(200).json({
					sessionToken: sessionToken,
				});
			} else res.status(checkRef.status).send(checkRef.data);
		} else {
			res.status(401).send(null);
		}
	} catch (e) {
		console.error(e);
		res.status(500).send(null);
	}
});

export default authRouter;
