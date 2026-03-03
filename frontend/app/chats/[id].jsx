// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useLocalSearchParams } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { jwtDecode } from "jwt-decode";
// import { useEffect, useRef, useState } from "react";
// import {
//   Animated,
//   FlatList,
//   Keyboard,
//   Platform,
//   SafeAreaView,
//   StyleSheet,
//   View,
// } from "react-native";
// import ChatHeader from "../../components/ChatHeader";
// import MessageBubble from "../../components/MessageBubble";
// import MessageInput from "../../components/MessageInput";
// import {
//   createChatIfNotExists,
//   getChatById,
//   setChatAsRead,
// } from "../database/chatQueries";
// import { getMessagesByChatId, insertMessage } from "../database/messageQueries";
// const STATUSBAR_HEIGHT =
//   Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0;
// export default function ChatId({ navigation }) {
//   //  const socket = useSocket(); //
//   const { id, isGroup, user } = useLocalSearchParams();
//   const parsedUser = user ? JSON.parse(user) : null;
//   console.log("Chat ID:", id);
//   console.log("User param:", parsedUser);
//   console.log("isGroup : ", isGroup);

//   const [chat, setChat] = useState(null);
//   const [messages, setMessages] = useState([]);
//   useEffect(() => {
//     const loadChat = async () => {
//       const data = await getChatById(id);
//       const msgs = await getMessagesByChatId(id);
//       console.log(data);
//       console.log("messages: ", msgs);
//       setMessages(msgs);
//       setChat(data);
//     };
//     loadChat();
//   }, [id]);
//   useEffect(() => {
//     // Mark chat as read when we open it
//     const markAsRead = async () => {
//       console.log("i amc jsdbfjsdbjf");
//       await setChatAsRead(id);
//       // setChat((prev) => ({ ...prev, unReadCount: 0 })); // update local state
//     };
//     markAsRead();
//   }, [id]);
//   const flatListRef = useRef(null);
//   const keyboardOffset = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     flatListRef.current?.scrollToEnd({ animated: true });
//   }, [messages]);

//   const storeLocalMessage = async (message) => {
//     console.log(" i am call ");
//     const storedUser = await AsyncStorage.getItem("authToken");
//     const decoded = jwtDecode(storedUser);

//     console.log("decoded: ", decoded);
//     const newMessage = {
//       message_id: Date.now().toString(),
//       chat_id: id, // 🔥 important
//       sender_id: decoded.id,
//       sender_phone: decoded.phone,
//       receiver_id: id,
//       receiver_phone: parsedUser?.phoneNumber || "N/A",
//       content: message,
//       message_type: "text",
//       sent_at: Date.now(),
//       isMe: true,
//       reply_to: null,
//       media_url: null,
//     };
//     try {
//       // 🔎 Check if chat already exists
//       const existingChat = await getChatById(id);

//       // 🟢 If not exists → create chat
//       if (!existingChat) {
//         await createChatIfNotExists({
//           id: id,
//           name: parsedUser?.name || "New Chat",
//           avatar: parsedUser?.avatar || "",
//           unReadCount: 0,
//         });

//         console.log("Chat created on first message ✅");
//       }

//       // 📨 Insert message
//       await insertMessage(newMessage);

//       // 🖥 Update UI
//       setMessages((prev) => [...prev, newMessage]);
//     } catch (error) {
//       console.log("Error saving message:", error);
//     }
//   };
//   // 🧠 Keyboard show/hide listener
//   useEffect(() => {
//     const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
//       Animated.timing(keyboardOffset, {
//         toValue: e.endCoordinates.height,
//         duration: 250,
//         useNativeDriver: false,
//       }).start();
//     });

//     const hideSub = Keyboard.addListener("keyboardDidHide", () => {
//       Animated.timing(keyboardOffset, {
//         toValue: 0,
//         duration: 250,
//         useNativeDriver: false,
//       }).start();
//     });

//     return () => {
//       showSub.remove();
//       hideSub.remove();
//     };
//   }, []);

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar
//         translucent
//         backgroundColor="transparent"
//         barStyle="light-content"
//       />
//       <View
//         style={[styles.statusBarBackground, { height: STATUSBAR_HEIGHT }]}
//       />
//       <ChatHeader
//         name={parsedUser ? parsedUser.name : chat?.name || "Chat"}
//         profilePic={chat?.avatar}
//         isGroup={isGroup === "true"}
//       />

//       {/* Main chat area */}
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         renderItem={({ item }) => <MessageBubble message={item} />}
//         keyExtractor={(item) => item.message_id}
//         contentContainerStyle={styles.chatArea}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//       />

//       {/* Animated input bar */}
//       <Animated.View
//         style={[styles.inputWrapper, { marginBottom: keyboardOffset }]}
//       >
//         <MessageInput recieverId={id} setSavedLocal={storeLocalMessage} />
//       </Animated.View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#0c151c",
//   },
//   chatArea: {
//     paddingHorizontal: 30,
//     paddingBottom: 10,
//   },
//   inputWrapper: {
//     backgroundColor: "transparent",
//   },
// });
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import ChatHeader from "../../components/ChatHeader";
import MessageBubble from "../../components/MessageBubble";
import MessageInput from "../../components/MessageInput";
import { encryptMessage } from "../../utils/crypto";
import { useSocket } from "../context/SocketContext"; //
import { setChatAsRead } from "../database/chatQueries";
// import context
import { createChatIfNotExists } from "../database/chatQueries";
import { insertMessage } from "../database/messageQueries";

const STATUSBAR_HEIGHT =
  Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0;

export default function ChatId() {
  const { id, isGroup, user } = useLocalSearchParams();
  const parsedUser = user ? JSON.parse(user) : null;

  const { chats, messagesByChat, setMessagesByChat, setChats, socket } =
    useSocket();

  const [chat, setChat] = useState(null);
  const flatListRef = useRef(null);
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  const messages = messagesByChat[id] || [];

  // Load chat from context on screen mount
  useEffect(() => {
    const existingChat = chats.find((c) => c.id === id);
    if (existingChat) setChat(existingChat);
    else
      setChat({
        id,
        name: parsedUser?.name || "Chat",
        avatar: parsedUser?.avatar || null,
      });
  }, [chats]);

  // Scroll to bottom when messages update
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Mark chat as read (update DB + reset unread count in context)
  useEffect(() => {
    const markAsRead = async () => {
      try {
        // Reset local context unread count
        setChats((prev) =>
          prev.map((c) => (c.id === id ? { ...c, unReadCount: 0 } : c)),
        );
        await setChatAsRead(id);
        // Update in DB
        await createChatIfNotExists({
          id: id,
          name: parsedUser?.name || "Chat",
          avatar: parsedUser?.avatar || null,
          unReadCount: 0,
        });
      } catch (error) {
        console.log("Error marking chat as read:", error);
      }
    };
    markAsRead();
  }, [id]);

  // Store new local message (send + update context + DB)
  const storeLocalMessage = async (
    content,
    messageType = "text",
    mediaUrl = null,
  ) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const decoded = jwtDecode(token);
      console.log("content : ", content);
      const encryptedContent =
        messageType === "text" ? await encryptMessage(content) : null;

      const newMessage = {
        message_id: Date.now().toString(),
        chat_id: id,
        sender_id: decoded.id,
        sender_phone: decoded.phone,
        receiver_id: id,
        receiver_phone: parsedUser?.phoneNumber || "N/A",
        content: encryptedContent,
        message_type: messageType,
        sent_at: Date.now(),
        isMe: true,
        reply_to: null,
        media_url: mediaUrl,
      };

      // 1️⃣ Update messages in context
      setMessagesByChat((prev) => {
        const existing = prev[id] || [];
        return { ...prev, [id]: [...existing, newMessage] };
      });

      // 2️⃣ Update chat preview in context
      setChats((prev) => {
        const exists = prev.find((c) => c.id === id);
        if (exists) {
          return prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  lastMessageSenderId: decoded.id,
                  lastMessageText:
                    messageType === "text" ? newMessage.content : "📷 Image",
                  lastMessageTime: newMessage.sent_at,
                }
              : c,
          );
        } else {
          return [
            {
              id: id,
              name: parsedUser?.name || "Chat",
              avatarUrl: parsedUser?.avatar || null,
              lastMessageText:
                messageType === "text" ? newMessage.content : "📷 Image",
              lastMessageTime: newMessage.sent_at,
              lastMessageSenderId: decoded.id,
              unReadCount: 0,
            },
            ...prev,
          ];
        }
      });

      // 3️⃣ Persist in DB
      await createChatIfNotExists({
        id: id,
        name: parsedUser?.name || "Chat",
        avatar: parsedUser?.avatar || null,
      });
      await insertMessage(newMessage);

      const messageData = {
        recieverId: id,
        token: token,
        content: encryptedContent,
        messageType: messageType,
        mediaUrl: mediaUrl,
      };
      // 4️⃣ Send via socket
      socket?.emit("send-message", messageData);
    } catch (error) {
      console.log("Error saving message:", error);
    }
  };

  // Keyboard listeners
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) =>
      Animated.timing(keyboardOffset, {
        toValue: e.endCoordinates.height,
        duration: 250,
        useNativeDriver: false,
      }).start(),
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start(),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    // <KeyboardAvoidingView
    //   style={{ flex: 1 }}
    //   behavior={Platform.OS === "ios" ? "padding" : "height"}
    //   keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // adjust if you have a status bar
    // >
    //   <StatusBar
    //     translucent
    //     backgroundColor="transparent"
    //     barStyle="light-content"
    //   />
    //   <View
    //     style={[styles.statusBarBackground, { height: STATUSBAR_HEIGHT }]}
    //   />
    //   <ChatHeader
    //     name={parsedUser ? parsedUser.name : chat?.name || "Chat"}
    //     profilePic={chat?.avatar}
    //     isGroup={isGroup === "true"}
    //   />
    //   <ImageBackground
    //     source={require("../../assets/images/chatBackground.jpeg")}
    //     style={{ flex: 1 }}
    //   >
    //     <FlatList
    //       ref={flatListRef}
    //       data={messages}
    //       renderItem={({ item }) => <MessageBubble message={item} />}
    //       keyExtractor={(item) => item.message_id}
    //       contentContainerStyle={{ paddingHorizontal: 30, paddingBottom: 10 }}
    //       showsVerticalScrollIndicator={false}
    //       keyboardShouldPersistTaps="handled"
    //     />

    //     {/* Input bar */}
    //     <Animated.View
    //       style={[styles.inputWrapper, { marginBottom: keyboardOffset }]}
    //     >
    //       <MessageInput recieverId={id} setSavedLocal={storeLocalMessage} />
    //     </Animated.View>
    //   </ImageBackground>
    // </KeyboardAvoidingView>
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        // behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // adjust if you have a status bar
      >
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <View
          style={[styles.statusBarBackground, { height: STATUSBAR_HEIGHT }]}
        />
        <ChatHeader
          name={parsedUser ? parsedUser.name : chat?.name || "Chat"}
          profilePic={chat?.avatarUrl}
          isGroup={isGroup === "true"}
          id={id}
        />
        <ImageBackground
          source={require("../../assets/images/chatBackground.jpeg")}
          style={{ flex: 1 }}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => <MessageBubble message={item} />}
            keyExtractor={(item) => item.message_id}
            contentContainerStyle={{ paddingHorizontal: 30, paddingBottom: 10 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />

          {/* Input bar */}
          <Animated.View
            style={[styles.inputWrapper, { marginBottom: keyboardOffset }]}
          >
            <MessageInput recieverId={id} setSavedLocal={storeLocalMessage} />
          </Animated.View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c151c" },
  chatArea: { paddingHorizontal: 30, paddingBottom: 10 },
  inputWrapper: { backgroundColor: "transparent" },
  statusBarBackground: { width: "100%", backgroundColor: "#0c151c" },
});
