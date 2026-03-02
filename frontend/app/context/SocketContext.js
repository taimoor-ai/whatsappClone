import Constants from "expo-constants";
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { createChatIfNotExists, getAllChats } from "../database/chatQueries";
import { getAllMessages, insertMessage } from "../database/messageQueries";

const { EXPO_SOCKET_URL } = Constants.expoConfig.extra;
const SocketContext = createContext(null);

export const SocketProvider = ({ token, children }) => {
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [messagesByChat, setMessagesByChat] = useState({});
  const [typingUsers, setTypingUsers] = useState({}); // 🔥 NEW

  // ===============================
  // 🔹 LOAD LOCAL DB DATA
  // ===============================
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const dbChats = await getAllChats();
        setChats(dbChats);

        const dbMessages = await getAllMessages();

        const grouped = dbMessages.reduce((acc, msg) => {
          if (!acc[msg.chat_id]) acc[msg.chat_id] = [];
          acc[msg.chat_id].push(msg);
          return acc;
        }, {});

        setMessagesByChat(grouped);
        console.log("✅ Chats & messages loaded");
      } catch (err) {
        console.log("DB Load Error:", err);
      }
    };

    loadInitialData();
  }, []);

  // ===============================
  // 🔹 SOCKET CONNECTION
  // ===============================
  useEffect(() => {
    if (!token) return;

    const newSocket = io(EXPO_SOCKET_URL, {
      auth: { token },
    });

    setSocket(newSocket);

    // ===============================
    // CONNECT
    // ===============================
    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
    });

    // ===============================
    // 🔥 TYPING EVENTS
    // ===============================
    newSocket.on("user-typing", ({ senderId }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [senderId]: true,
      }));
    });

    newSocket.on("user-stop-typing", ({ senderId }) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[senderId];
        return updated;
      });
    });

    // ===============================
    // RECEIVE MESSAGE
    // ===============================
    newSocket.on("receive-message", async (data) => {
      const chatId = data.senderId;

      const newMessage = {
        message_id: Date.now().toString(),
        chat_id: chatId,
        sender_id: data.senderId,
        receiver_id: data.receiverId,
        content: data.content,
        sent_at: data.sentAt,
        isMe: false,
      };

      // 🔥 Stop typing when message arrives
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[chatId];
        return updated;
      });

      // Update chat preview
      setChats((prev) => {
        const exists = prev.find((c) => c.id === chatId);

        if (exists) {
          return prev.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  lastMessageText: newMessage.content,
                  lastMessageTime: newMessage.sent_at,
                  unReadCount: (c.unReadCount || 0) + 1,
                }
              : c,
          );
        }

        return [
          {
            id: chatId,
            name: data.senderNumber,
            avatarUrl: null,
            lastMessageText: newMessage.content,
            lastMessageTime: newMessage.sent_at,
            unReadCount: 1,
          },
          ...prev,
        ];
      });

      setMessagesByChat((prev) => {
        const existing = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: [...existing, newMessage],
        };
      });

      await createChatIfNotExists({
        id: chatId,
        name: data.senderNumber,
      });

      await insertMessage(newMessage);
    });

    // ===============================
    // DISCONNECT
    // ===============================
    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        chats,
        messagesByChat,
        typingUsers, // 🔥 EXPORT THIS
        setChats,
        setMessagesByChat,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
