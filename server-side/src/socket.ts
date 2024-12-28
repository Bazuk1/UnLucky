import { Server, Socket } from "socket.io";
import { placeRollBet } from "./database/roll.functions";
import { verify } from "jsonwebtoken";
import { fetchUserCoins, updateUserCoins } from "./database/user.functions";
import { playCaseOpening } from "./database/caseOpening.functions";
import { ISlots } from "./database/case.functions";
// TODO: Session id check if valid on connection

interface DataPacket {
    id?: string;
    type: string;
    data: any;
}   

interface SubRequest {
    roomName: "Roll" | "Pvp";
    params: any;
}

interface SoloGameRequest {
  game: "CaseOpening" | "Dice";
  caseOpeningGame?: {
    case_id: string;
    amount: number;
  };
  diceGame?: {
    betOn: number;
    amount: number;
  };
}

export interface BetInfo {
    betType: "Red" | "Green" | "Black";
    amount: number;
    payoutMultiplier: 14 | 2;
    roll_id: string;
}

const SListeners = {
    connection_init: "connection_init",
    subscribe: "subscribe",
    placeBet: "placeBet",
    getUserCoins: "getUserCoins",
    
    subscribePvpGame: "subscribePvpGame",
    enterPvpGame: "enterGame",

    createCaseOpening: "createCaseOpening",
}

const CListeners = {
    connection_ack: "connection_ack",
    createBet: "createBet",
    createGame: "createGame",
    updateGame: "updateGame",

    createPvpGame: "createPvpGame",
    updatePvpGame: "updatePvpGame",

    updateUserCoins: "updateUserCoins",

    updateCaseOpening: "updateCaseOpening",
}

export var SESSIONS: { user_id: string | null; session_id: string; socket_id: string }[] = [];

const findSocketID = (user_id: string) => {
  const session = SESSIONS.find((session) => session.user_id === user_id);
  return session ? session.socket_id : null;
};

const findUserID = (socket_id: string) => {
  const session = SESSIONS.find((session) => session.socket_id === socket_id);
  return session ? session.user_id : null;
};

export default function socket({ io }: { io: Server }) {
    console.log("Socket Server is up!");
    io.use(function (socket, next) {
        if (socket.handshake.auth != null && socket.handshake.auth.sessionToken != null) {
          const decoded: any = verify(
            socket.handshake.auth.sessionToken,
            "eyJhbGciOi"
          );
          if (decoded && decoded.user_id && decoded.session) {
            SESSIONS.push({
              user_id: decoded.user_id,
              session_id: decoded.session,
              socket_id: socket.id,
            });
            return next();
          }
        } else if (socket.handshake.auth != null && socket.handshake.auth.sessionId != null) {
            SESSIONS.push({
              user_id: null,
              session_id: socket.handshake.auth.session_id,
              socket_id: socket.id,
            });
            return next();
        } else return next(new Error("Unauthorized"));
      }).on("connection", (socket: Socket) => {
      console.log(`${socket.id} connected`);
    
      socket.on(SListeners.connection_init, (request: DataPacket) => {
        if (request.type === SListeners.connection_init) {
            console.log(`${socket.id} sent`, request.type, request.data);
            const response: DataPacket = {
                type: CListeners.connection_ack,
                data: {}
            }
            socket.emit(CListeners.connection_ack, response);
        } else socket.disconnect();
      })

      socket.on(SListeners.subscribe, (request: DataPacket) => {
        if (request.type === SListeners.subscribe) {
            try {
                const subReq: SubRequest = request.data;
                socket.join(subReq.roomName)
                console.log(`${socket.id} sent`, request.type, request.data);
            } catch (e) {
                socket.disconnect();
            }
        } else socket.disconnect();
      })

      socket.on(SListeners.getUserCoins, async (request: DataPacket) => {
        if (request.type === SListeners.getUserCoins) {
          try {
            const user_id = findUserID(socket.id);
            if (user_id) {
              const userCoins = await fetchUserCoins(user_id);
              if (userCoins.status === 200) {
                socket.emit(CListeners.updateUserCoins, {
                  type: CListeners.updateUserCoins,
                  data: userCoins.data,
                })
              } else {
                console.log(`${socket.id} can't lower coins due to ${userCoins.status}`)
              }
            } else throw new Error("Unauthorized")
          } catch (e) {
              socket.disconnect();
          }
        } else socket.disconnect();
      })

      // Roll:
      socket.on(SListeners.placeBet, async (request: DataPacket) => {
        if (request.type === SListeners.placeBet) {
            try {
                const betInfo: BetInfo = request.data;
                const user_id = findUserID(socket.id);
                const placedBet = await placeRollBet(betInfo, user_id)
                if (placedBet.status === 200) {
                    const response: DataPacket = {
                        type: CListeners.createBet,
                        data: placedBet.data,
                    }
                    io.to("Roll").emit(CListeners.createBet, response)
                    console.log(`${socket.id} sent`, request.type, request.data);
                    // Lower the coins amount:
                    const userCoins = await updateUserCoins(user_id, -betInfo.amount)
                    if (userCoins.status === 200) {
                      socket.emit(CListeners.updateUserCoins, {
                        type: CListeners.updateUserCoins,
                        data: userCoins.data,
                      })
                    } else {
                      console.log(`${socket.id} can't lower coins due to ${userCoins.status}`)
                    }
                } else {
                    console.log(`${socket.id} can't bet due to ${placedBet.status}`)
                }
            } catch (e) {
                socket.disconnect();
            }
        } else socket.disconnect();
      })

      // Solo case opening:

      socket.on(SListeners.createCaseOpening, async (request: DataPacket) => {
        if (request.type === SListeners.createCaseOpening) {
          try {
              const soloGameReq: SoloGameRequest = request.data;
              if (soloGameReq.game === "CaseOpening" && soloGameReq.caseOpeningGame) {
                const user_id = findUserID(socket.id);
                const caseOpened = await playCaseOpening(soloGameReq.caseOpeningGame, user_id);
                if (caseOpened && caseOpened.status === 200) {
                  socket.emit(CListeners.updateUserCoins, {
                    type: CListeners.updateUserCoins,
                    data: {
                      coins: caseOpened.data.newUserCoins
                    },
                  })
                  if (caseOpened.data.game) {
                    socket.emit(CListeners.updateCaseOpening, {
                      type: CListeners.updateCaseOpening,
                      data: {
                        ...caseOpened.data.game,
                        roll: {
                          ...caseOpened.data.game.roll,
                          winningSlot: getWinnerSlot(caseOpened.data.game?.roll)
                        }
                      },
                    })
                  }
                  setTimeout(async () => {
                    // @ts-ignore
                    const userCoins = await updateUserCoins(user_id, caseOpened.data.game.winnings.value)
                    if (userCoins.status === 200) {
                      socket.emit(CListeners.updateUserCoins, {
                        type: CListeners.updateUserCoins,
                        data: userCoins.data
                      })
                    }
                  }, 8000);
                }
                console.log(`${socket.id} sent`, request.type, request.data);
              } else throw new Error("Wrong Game")
          } catch (e) {
              socket.disconnect();
          }
      } else socket.disconnect();
      })

      // Pvp:



      socket.on("disconnect", () => {
        console.log(`${socket.id} disconnected`);
      });
  
    });
}

function getWinnerSlot(roll: { value: number; stream: ISlots[]; }) {
  const rollV = roll.value
  const validIndices: number[] = [];
  roll.stream.forEach((slot, idx) => {
    if (slot.rollStart <= rollV && slot.rollEnd >= rollV && idx >= 15 && idx <= 25) {
      validIndices.push(idx);
    }
  });

  if (validIndices.length > 0) {
    const randomIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
    return randomIndex;
  }
  return -1;
}