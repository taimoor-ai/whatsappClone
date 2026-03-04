import { useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { decryptMessage } from "../utils/crypto";

export default function MessageBubble({ message }) {
  const [previewVisible, setPreviewVisible] = useState(false);

  const isMe = message.isMe;
  const date = new Date(message.sentAt || message.sent_at);

  const isImage = message.message_type === "image";

  // 🔓 Decrypt ONLY if text message
  const decryptedText =
    !isImage && message.content ? decryptMessage(message.content) : null;

  const imageUri = message.media_url || message.content;

  return (
    <>
      <View
        style={[
          styles.container,
          isMe ? styles.right : styles.left,
          isMe ? styles.rightBubble : styles.leftBubble,
        ]}
      >
        {!isMe && <Text style={styles.sender}>{message.sender}</Text>}

        {/* 🖼️ IMAGE MESSAGE */}
        {isImage ? (
          <TouchableOpacity onPress={() => setPreviewVisible(true)}>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          /* 💬 TEXT MESSAGE */
          <Text style={styles.text}>{decryptedText}</Text>
        )}

        <Text style={styles.time}>
          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>

        <View
          style={[styles.tail, isMe ? styles.sentTail : styles.receivedTail]}
        />
      </View>

      {/* 🔍 FULL SCREEN IMAGE PREVIEW */}
      {isImage && (
        <Modal visible={previewVisible} transparent={true} animationType="fade">
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={() => setPreviewVisible(false)}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "75%",
    marginVertical: 5,
    padding: 8,
    borderRadius: 14,
  },

  /* Position */
  left: {
    alignSelf: "flex-start",
    backgroundColor: "#333e4a",
    borderTopLeftRadius: 0,
  },
  right: {
    alignSelf: "flex-end",
    backgroundColor: "#003833",
    borderTopRightRadius: 0,
  },

  text: {
    fontSize: 16,
    color: "#fff",
  },

  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 5,
  },

  sender: {
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 4,
    color: "#0287c3",
  },

  time: {
    fontSize: 10,
    color: "#aaa",
    alignSelf: "flex-end",
    marginTop: 4,
  },

  /* 🔍 Full screen preview */
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },

  fullImage: {
    width: "100%",
    height: "100%",
  },

  tail: {},
});
