import SockJS from "sockjs-client";
import Stomp from "stompjs";

let stompClient = null;
const userKey = "syncdrive.user";
const socketUrl =
  import.meta.env.VITE_CHAT_SOCKET_URL ?? "http://localhost:8083/ws";

// Updated signature to accept onSignalReceived
export const connectSocket = (
  roomId,
  onMessageReceived,
  onUserJoined,
  onSignalReceived
) => {
  if (stompClient) {
    // console.log("WebSocket connection already active or pending.");
    return;
  }

  const socket = new SockJS(socketUrl);
  stompClient = Stomp.over(socket);
  stompClient.debug = () => {};

  stompClient.connect(
    {},
    () => {
      // console.log("WebSocket Connected!");

      // 1. Subscribe to Chat Messages (Includes JOIN/LEAVE)
      stompClient.subscribe(`/topic/room/${roomId}`, (payload) => {
        const msg = JSON.parse(payload.body);
        // console.log("SOCKET MSG RECEIVED:", payload.body);
        onMessageReceived(msg);
      });

      // 2. Subscribe to Participant Updates
      stompClient.subscribe(`/topic/room/${roomId}/participants`, (payload) => {
        onUserJoined(JSON.parse(payload.body));
      });

      // 3. Subscribe to Video Signals (WebRTC)
      stompClient.subscribe(`/topic/room/${roomId}/signal`, (payload) => {
        if (onSignalReceived) {
          const signal = JSON.parse(payload.body);
          const currentUser = JSON.parse(sessionStorage.getItem(userKey));

          // Filter out my own signals so I don't process my own Offer/Answer
          if (currentUser && signal.sender !== currentUser.username) {
            onSignalReceived(signal);
          }
        }
      });

      // 4. Send JOIN Signal (for Chat Presence)
      const user = JSON.parse(sessionStorage.getItem(userKey));
      if (user) {
        stompClient.send(
          `/app/chat/${roomId}/join`,
          {},
          JSON.stringify({
            sender: user.username,
            userId: user.id,
            type: "JOIN",
          })
        );
      }
    },
    (error) => {
      // console.log("Socket error:", error);
      // Reset so we can retry later
      stompClient = null;
    }
  );
};

// Send WebRTC Signals (Offer, Answer, ICE)
export const sendSignal = (roomId, type, payload) => {
  if (stompClient && stompClient.connected) {
    const user = JSON.parse(sessionStorage.getItem(userKey));

    // Safety Check: Ensure username exists
    if (!user || !user.username) {
      // console.error("Cannot send signal: User username is missing!", user);
      return;
    }

    const signalMessage = {
      type: type, // e.g. "offer"
      roomId: roomId,
      sender: user.username,

      // Stringify the payload again so Java treats it as a simple String
      payload: JSON.stringify(payload),
    };

    // console.log("Sending Signal:", signalMessage.type, "from", signalMessage.sender);

    stompClient.send(
      `/app/chat/${roomId}/signal`,
      {},
      JSON.stringify(signalMessage)
    );
  }
};

// Structured metadata is optional; plain content remains the fallback for older clients.
export const sendMessage = (
  roomId,
  messageContent,
  typeOverride = "CHAT",
  metadata = {},
) => {
  if (stompClient && stompClient.connected) {
    const user = JSON.parse(sessionStorage.getItem(userKey));
    const chatMessage = {
      sender: user.username,
      content: messageContent,
      type: typeOverride,
    };
    if (metadata.card) {
      chatMessage.card = metadata.card;
    }

    stompClient.send(
      `/app/chat/${roomId}/sendMessage`,
      {},
      JSON.stringify(chatMessage)
    );
  }
};

export const notifyHostLeft = (roomId) => {
  if (stompClient && stompClient.connected) {
    const user = JSON.parse(sessionStorage.getItem(userKey));
    const message = {
      sender: user.username,
      type: "HOST_LEFT",
      content: "Host has left the room. Closing in 5 seconds...",
    };

    stompClient.send(
      `/app/chat/${roomId}/sendMessage`,
      {},
      JSON.stringify(message)
    );
  }
};

export const disconnectSocket = () => {
  if (stompClient) {
    if (stompClient.connected) {
      try {
        stompClient.disconnect(() => {
          // console.log("Socket Disconnected");
        });
      } catch (e) {
        // Ignore already closed errors
      }
    }
    stompClient = null;
  }
};
