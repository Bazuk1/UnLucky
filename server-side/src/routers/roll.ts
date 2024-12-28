import { Router } from "express";
import {
  fetchLastRoll,
  fetchRollBets,
  fetchRollHistory,
  fetchRollHistoryResults
} from "../database/roll.functions";

var rollRouter = Router();

// Get roll information
rollRouter.get("/last", async (req, res) => {
  try {
    const rollFetched = await fetchLastRoll();
    res.status(rollFetched.status).send(rollFetched.data);
  } catch (e) {
    console.error(e);
    res.status(500).send(null);
  }
});

// Get roll bets
rollRouter.get("/:roll_id/bets", async (req, res) => {
    const roll_id = req.params.roll_id;
    try {
        const betsFetched = await fetchRollBets(roll_id);
        res.status(betsFetched.status).send(betsFetched.data);
    } catch (e) {
        console.error(e);
        res.status(500).send(null);
    }
});

// Get roll history
rollRouter.get("/history/100/results", async (req, res) => {
  try {
      const historyFetched = await fetchRollHistoryResults(100);
      res.status(historyFetched.status).send(historyFetched.data);
  } catch (e) {
      console.error(e);
      res.status(500).send(null);
  }
});

// Get roll history
rollRouter.get("/history/10/results", async (req, res) => {
  try {
      const historyFetched = await fetchRollHistoryResults(10);
      res.status(historyFetched.status).send(historyFetched.data);
  } catch (e) {
      console.error(e);
      res.status(500).send(null);
  }
});

// Get roll history
rollRouter.get("/history", async (req, res) => {
    try {
        const historyFetched = await fetchRollHistory();
        res.status(historyFetched.status).send(historyFetched.data);
    } catch (e) {
        console.error(e);
        res.status(500).send(null);
    }
});

export default rollRouter;
