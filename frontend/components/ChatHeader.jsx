import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
export default function ChatHeader({ name, profilePic, isGroup }) {
  const navigation = useNavigation();
 

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Image
        source={{
          uri:
            profilePic ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        }}
        style={styles.avatar}
      />

      <View style={styles.info}>
        <Text style={styles.name}>{name || "Chat"}</Text>
        <Text style={styles.status}>{isGroup ? "Group Chat" : "Online"}</Text>
      </View>

      <View style={styles.actions}>
        <Ionicons name="call-outline" size={22} color="#fff" />
        <Ionicons
          name="videocam-outline"
          size={22}
          color="#fff"
          style={{ marginLeft: 15 }}
        />
        <Ionicons
          name="ellipsis-vertical"
          size={22}
          color="#fff"
          style={{ marginLeft: 15 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 80,
    backgroundColor: "#0c151c",

    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginLeft: 10 },
  info: { flex: 1, marginLeft: 10 },
  name: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  status: { color: "#d9fdd3", fontSize: 12 },
  actions: { flexDirection: "row", alignItems: "center" },
});
