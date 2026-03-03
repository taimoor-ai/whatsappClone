import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { useContext, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../app/context/authContext";
import { useSocket } from "../app/context/SocketContext";
const { API_URL_IP } = Constants.expoConfig.extra;
// Helper function to pick and upload image to backend (S3)
const pickAndUploadImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    console.log("1");
    if (result.canceled) return null;
    console.log("2");
    const localUri = result.assets[0].uri;
    const filename = localUri.split("/").pop();
    const formData = new FormData();
    console.log("3");
    formData.append("image", {
      uri: localUri,
      name: filename,
      type: "image/jpeg",
    });
    console.log("4");
    const token = await AsyncStorage.getItem("authToken");
    console.log("5");
    console.log(API_URL_IP);
    const response = await fetch(`http://${API_URL_IP}:3000/api/upload`, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("response", data);
    // const data = await response.json();
    return data.imageUrl;
  } catch (err) {
    console.error("Image upload failed:", err);
    Alert.alert("Error", "Failed to upload image");
    return null;
  }
};

export default function MessageInput({ recieverId, setSavedLocal }) {
  const [text, setText] = useState("");
  const { socket } = useSocket();
  const { token } = useContext(AuthContext);

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

  const sendTextMessage = async () => {
    if (!text || !socket) return;

    socket.emit("stop-typing", { recieverId });
    isTypingRef.current = false;

    const messageData = {
      recieverId,
      content: text,
      messageType: "text",
      token: token,
    };

    socket.emit("send-message", messageData);
    setSavedLocal(text);
    setText("");
  };

  const sendImageMessage = async () => {
    if (!socket) return;

    const imageUrl = await pickAndUploadImage();
    if (!imageUrl) return;

    const messageData = {
      recieverId,
      content: imageUrl,
      messageType: "image",
      token: token,
    };

    socket.emit("send-message", messageData);
    setSavedLocal(null, "image", imageUrl); // Save locally in context/DB
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

      {/* Image Upload Button */}
      <TouchableOpacity style={styles.imageButton} onPress={sendImageMessage}>
        <Ionicons name="image" size={28} color="black" />
      </TouchableOpacity>

      {/* Send Text Button */}
      <TouchableOpacity style={styles.sendButton} onPress={sendTextMessage}>
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
  sendButton: {
    padding: 8,
    height: 50,
    width: 50,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#25D366",
    borderRadius: 25,
    marginLeft: 5,
  },
  imageButton: {
    padding: 8,
    height: 50,
    width: 50,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffcc00",
    borderRadius: 25,
    marginRight: 5,
  },
});
