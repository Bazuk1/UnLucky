import { io } from "socket.io-client";

export const socket = io(process.env.REACT_APP_SERVER_URL || "http://localhost:4000", {
  autoConnect: false,
  reconnectionDelay: 10000,
});
