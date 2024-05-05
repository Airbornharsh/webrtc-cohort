import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8000 });

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data: any) {
    const message = JSON.parse(data);
    if (message.type === "sender") {
      console.log("sender connected");
      senderSocket = ws;
    } else if (message.type === "receiver") {
      console.log("receiver connected");
      receiverSocket = ws;
    } else if (message.type === "createOffer") {
      console.log("createOffer");
      if (ws !== senderSocket) {
        return;
      }
      receiverSocket?.send(
        JSON.stringify({ type: "createOffer", sdp: message.sdp })
      );
    } else if (message.type === "createAnswer") {
      console.log("createAnswer");
      if (ws !== receiverSocket) {
        return;
      }
      senderSocket?.send(
        JSON.stringify({ type: "createAnswer", sdp: message.sdp })
      );
    } else if (message.type === "iceCandidate") {
      console.log("iceCandidate");
      if (ws === senderSocket) {
        receiverSocket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
        );
      } else if (ws === receiverSocket) {
        senderSocket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
        );
      }
    }
  });
});
