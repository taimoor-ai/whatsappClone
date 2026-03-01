import { StyleSheet, Text, View } from "react-native";
import { decryptMessage } from "../utils/crypto";
export default function MessageBubble({ message }) {
  const isMe = message.isMe;
  const date = new Date(message.sent_at);
  // 🔓 Decrypt only for display
  const decryptedText = decryptMessage(message.content);
  return (
    <View
      style={[
        styles.container,
        isMe ? styles.right : styles.left,
        isMe ? styles.rightBubble : styles.leftBubble,
      ]}
    >
      {!isMe && <Text style={styles.sender}>{message.sender}</Text>}
      <Text style={styles.text}>{decryptedText}</Text>
      <Text style={styles.time}>{date.toLocaleString()}</Text>
      <View
        style={[styles.tail, isMe ? styles.sentTail : styles.receivedTail]}
      />
    </View>
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
    paddingTop: 0,
    backgroundColor: "#333e4a",
  },
  right: {
    alignSelf: "flex-end",
    backgroundColor: "#003833",
  },

  /* Bubble tail effect */
  leftBubble: {
    borderTopLeftRadius: 0, // missing corner for incoming messages
  },
  rightBubble: {
    borderTopRightRadius: 0, // missing corner for outgoing messages
  },

  text: {
    fontSize: 16,
    color: "#fff",
  },
  sender: {
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 2,
    color: "#0287c3",
  },
  time: {
    fontSize: 10,
    color: "#777",
    alignSelf: "flex-end",
  },
});
