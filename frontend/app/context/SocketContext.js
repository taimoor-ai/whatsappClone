import Constants from "expo-constants";
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  createChatIfNotExists,
  getAllChats,
  getChatById,
} from "../database/chatQueries";
import { getAllMessages, insertMessage } from "../database/messageQueries";

const { EXPO_SOCKET_URL } = Constants.expoConfig.extra;
const SocketContext = createContext(null);

export const SocketProvider = ({ token, children }) => {
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [messagesByChat, setMessagesByChat] = useState({});
  console.log("i am Socket ");

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // 1️⃣ Load chats
        const dbChats = await getAllChats();
        setChats(dbChats);

        // 2️⃣ Load messages
        const dbMessages = await getAllMessages();

        // 3️⃣ Group messages by chat_id
        const groupedMessages = {};

        dbMessages.forEach((msg) => {
          if (!groupedMessages[msg.chat_id]) {
            groupedMessages[msg.chat_id] = [];
          }
          groupedMessages[msg.chat_id].push(msg);
        });

        setMessagesByChat(groupedMessages);

        console.log("✅ Chats & messages loaded from DB");
      } catch (error) {
        console.log("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, []);
  useEffect(() => {
    console.log(token);
    if (token) {
      console.log(EXPO_SOCKET_URL);
      const newSocket = io(EXPO_SOCKET_URL, {
        auth: { token }, // send token with handshake
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("✅ Socket connected:", newSocket.id);
        newSocket.emit("bind_number", { token });
      });
      newSocket.on("undelivered-messages", async (messages) => {
        console.log("📩 Undelivered messages received:", messages);

        for (const msg of messages) {
          const chatId = msg.senderId; // sender is OTHER user

          // ============================
          // 1️⃣ CHECK / CREATE CHAT
          // ============================
          let chat = await getChatById(chatId);

          if (!chat) {
            chat = {
              id: chatId,
              name: msg.sender_name || chatId,
              avatarUrl: null,
              lastMessageText: msg.content,
              lastMessageTime: msg.sentAt,
              unReadCount: 1,
            };

            // Persist in DB
            await createChatIfNotExists({
              id: chat.id,
              name: chat.name,
              avatar: chat.avatarUrl,
            });

            // Add to context
            setChats((prev) => [chat, ...prev]);
          } else {
            // Update chat preview for existing chat
            setChats((prevChats) =>
              prevChats.map((c) =>
                c.id === chatId
                  ? {
                      ...c,
                      lastMessageText: msg.content,
                      lastMessageTime: msg.sentAt,
                      unReadCount: (c.unReadCount || 0) + 1,
                    }
                  : c,
              ),
            );
          }

          // ============================
          // 2️⃣ CREATE MESSAGE OBJECT
          // ============================
          const newMessage = {
            message_id: Date.now().toString(),
            chat_id: chatId,
            sender_id: msg.senderId,
            sender_phone: msg.senderNumber,
            receiver_id: msg.receiverId,
            receiver_phone: msg.recieverNumber || "N/A",
            content: msg.content,
            message_type: "text",
            sent_at: msg.sentAt,
            isMe: false,
            reply_to: null,
            media_url: null,
          };

          // ============================
          // 3️⃣ INSERT INTO DATABASE
          // ============================
          await insertMessage(newMessage);

          // ============================
          // 4️⃣ UPDATE CONTEXT STATE
          // ============================
          setMessagesByChat((prev) => {
            const existingMessages = prev[chatId] || [];
            return {
              ...prev,
              [chatId]: [...existingMessages, newMessage],
            };
          });
        }
      });
      newSocket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
      });
      newSocket.on("receive-message", async (data) => {
        const chatId = data.senderId;

        const newMessage = {
          message_id: Date.now().toString(),
          chat_id: chatId,
          sender_id: data.senderId,
          sender_phone: data.senderNumber,
          receiver_id: data.receiverId,
          receiver_phone: data.receiverNumber || "N/A",
          content: data.content,
          message_type: "text",
          sent_at: data.sentAt,
          isMe: false,
          reply_to: null,
          media_url: null,
        };

        // ============================
        // 🔥 1️⃣ UPDATE UI FIRST
        // ============================

        setChats((prevChats) => {
          const exists = prevChats.find((c) => c.id === chatId);

          if (exists) {
            return prevChats.map((c) =>
              c.id === chatId
                ? {
                    ...c,
                    lastMessageText: newMessage.content,
                    lastMessageTime: newMessage.sent_at,
                    unReadCount: (c.unReadCount || 0) + 1,
                  }
                : c,
            );
          } else {
            return [
              {
                id: chatId,
                name: data.senderNumber,
                avatarUrl: null,
                lastMessageText: newMessage.content,
                lastMessageTime: newMessage.sent_at,
                unReadCount: 1,
              },
              ...prevChats,
            ];
          }
        });

        setMessagesByChat((prev) => {
          const existing = prev[chatId] || [];
          return {
            ...prev,
            [chatId]: [...existing, newMessage],
          };
        });

        // ============================
        // 💾 2️⃣ PERSIST TO DATABASE
        // ============================

        await createChatIfNotExists({
          id: chatId,
          name: data.senderNumber,
          avatar: null,
        });

        await insertMessage(newMessage);
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      // if token removed (logout), disconnect socket
      if (socket) socket.disconnect();
      setSocket(null);
    }
  }, [token]); // reconnect when token changes

  return (
    <SocketContext.Provider
      value={{
        socket,
        chats,
        messagesByChat,
        setChats,
        setMessagesByChat,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook for easy access
export const useSocket = () => useContext(SocketContext);
