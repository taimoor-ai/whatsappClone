import { io } from "socket.io-client";
console.log("i am in Sockets.js");
// Create only one socket connection for the whole app
const socket = io(process.env.EXPO_SOCKET_URL, {
  auth: { token: "12345" },
  autoConnect: false,
});

export default socket;
