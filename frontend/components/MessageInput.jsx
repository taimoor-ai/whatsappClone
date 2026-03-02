import { Ionicons } from "@expo/vector-icons";
import { useContext, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSocket } from "../app/context/SocketContext";

import { AuthContext } from "../app/context/authContext";
export default function MessageInput({ recieverId, setSavedLocal }) {
  const [text, setText] = useState("");
  const { socket } = useSocket(); //
  const { token, setToken } = useContext(AuthContext);
  console.log("Token:", token);
  console.log("ReciverId : ", recieverId);
  const sendMessage = () => {
    if (!text || !socket) return;
    socket.emit("stop-typing", { recieverId });
    isTypingRef.current = false;

    setSavedLocal(text);
    setText("");
  };
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef(null);

  const handleTyping = (value) => {
    setText(value);

    if (!socket) return;

    if (!isTypingRef.current) {
      socket.emit("typing", { recieverId });
      isTypingRef.current = true;
    }

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { recieverId });
      isTypingRef.current = false;
    }, 2000);
  };
  const isEmpty = text.trim().length === 0;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Message"
        placeholderTextColor="#ccc"
        value={text}
        caretColor="red"
        onChangeText={handleTyping}
      />

      <TouchableOpacity
        style={{
          padding: 8,
          height: 50,
          width: 50,
          alignContent: "center",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#25D366",
          borderRadius: 25,
        }}
        onPress={sendMessage}
      >
        {isEmpty ? (
          <Ionicons name="mic" size={30} color="black" />
        ) : (
          <Ionicons name="send" size={30} color="black" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 40,
    alignItems: "center",
    padding: 10,
  },
  input: {
    flex: 1,
    color: "white",
    caretColor: "white",
    height: 50,
    fontSize: 20,
    backgroundColor: "#333e4a",
    borderRadius: 30,
    paddingHorizontal: 15,
    marginRight: 10,
  },
});
