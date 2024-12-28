import { Router } from "express";
import { fetchCaseInfo, generateRollStream } from "../database/case.functions";

var unboxingRouter = Router();

unboxingRouter.get("/:case_id/view", async (req, res) => {
    const case_id = req.params.case_id;
    try {
        const caseInfo = await fetchCaseInfo(case_id)
        res.status(caseInfo.status).send(caseInfo.data);
    } catch (e) {
        console.error(e);
        res.status(500).send(null);
    }
});

unboxingRouter.get("/:case_id/roll-stream", async (req, res) => {
    const case_id = req.params.case_id;
    try {
        const rollStream = await generateRollStream(case_id)
        res.status(rollStream.status).send(rollStream.data);
    } catch (e) {
        console.error(e);
        res.status(500).send(null);
    }
});

// 🔴TODO:
// unboxingRouter.get("/:case_id/history", async (req, res) => {
//     const case_id = req.params.case_id;
//     try {
//         // const publicUserInfo = await fetchPublicUserInfo(user_id)
//         // res.status(publicUserInfo.status).send(publicUserInfo.data);
//     } catch (e) {
//         console.error(e);
//         res.status(500).send(null);
//     }
// });

export default unboxingRouter;