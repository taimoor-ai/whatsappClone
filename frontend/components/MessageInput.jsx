import { Ionicons } from "@expo/vector-icons";
import { useContext, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSocket } from "../app/context/SocketContext";

import { AuthContext } from "../app/context/authContext";
export default function MessageInput({ recieverId, setSavedLocal }) {
  console.log(recieverId);
  const [text, setText] = useState("");
  const { socket } = useSocket(); //
  const { token, setToken } = useContext(AuthContext);

  console.log("Token:", token);
  const sendMessage = () => {
    if (!text || !socket) return;
    setSavedLocal(text);

    setText("");
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
        onChangeText={setText}
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
