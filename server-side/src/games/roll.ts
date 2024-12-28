// @ts-nocheck
import { io } from '../app';
import { createRollGame, getNextNonce, updateRollStatus } from '../database/roll.functions';



export interface IGame {
    id: string;
    createdAt: string;
    scheduledAt: string;
    status: string | "CREATED" | "FINISHED" | "STARTED";
    rollValue: number | null;
}

const CListeners = {
    createBet: "createBet",
    createGame: "createGame",
    updateGame: "updateGame",
}

var gameRunning = true;
var nonce = 0;

export default async function RollGame() {
    // get nonce from db
    nonce = await getNextNonce();
    const game = async () => {
        setTimeout(async () => {
            var rollGame = await createGame()
            io.to("Roll").emit(CListeners.createGame, {
                type: CListeners.createGame,
                data: {
                    createGame: rollGame
                }
            })
            setTimeout(async () => {
                rollGame = await startGame(rollGame)
                io.to("Roll").emit(CListeners.updateGame, {
                    type: CListeners.updateGame,
                    data: {
                        updateGame: rollGame
                    }
                })
                setTimeout(async () => {
                    rollGame = await finishGame(rollGame)
                    io.to("Roll").emit(CListeners.updateGame, {
                        type: CListeners.updateGame,
                        data: {
                            updateGame: rollGame
                        }
                    })
                    if (gameRunning) game()
                }, 8000);
            }, 15000);
        }, 3000);
    }
    game();
}

async function createGame() {
    nonce++;
    const createdRollGame = await createRollGame(nonce);
    if (createdRollGame.status === 201) {
        const game: IGame = createdRollGame.data;
        return game;
    } else {
        console.log("VERY BAD ERROR IN ROLL GAME CREATION")
    }
}

async function startGame(game: IGame) {
    const updatedRollGame = await updateRollStatus(game.id, "START")
    if (updatedRollGame.status === 200) return updatedRollGame.data;
    else {
        gameRunning = false;
        console.log("Terminating Roll Game")
        console.log(updatedRollGame)
    }
}

async function finishGame(game: IGame) {
    const updatedRollGame = await updateRollStatus(game.id, "FINISH")
    if (updatedRollGame.status === 200) return updatedRollGame.data;
    else {
        gameRunning = false;
        console.log("Terminating Roll Game")
        console.log(updatedRollGame)
    }
}